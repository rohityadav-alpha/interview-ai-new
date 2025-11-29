import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { evaluateAnswer } from '@/lib/ai';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Auth check
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const interviewId = parseInt(id);
    
    // ✅ Validate interview ID
    if (isNaN(interviewId)) {
      return NextResponse.json({ error: 'Invalid interview ID' }, { status: 400 });
    }

    // ✅ Get request body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { questionId, answer } = body;

    // ✅ Validate inputs
    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Missing questionId or answer' }, { status: 400 });
    }

    if (typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json({ error: 'Answer must be a non-empty string' }, { status: 400 });
    }

    // ✅ Verify ownership
    const interview = await prisma.interview.findFirst({
      where: { 
        id: interviewId, 
        clerkUserId: userId 
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found or unauthorized' }, 
        { status: 403 }
      );
    }

    // ✅ Get question
    const question = await prisma.interviewResponse.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // ✅ Verify question belongs to this interview
    if (question.interviewId !== interviewId) {
      return NextResponse.json(
        { error: 'Question does not belong to this interview' }, 
        { status: 403 }
      );
    }

    console.log('🎯 Evaluating answer for question:', questionId);

    // ✅ Evaluate with AI
    const evaluation = await evaluateAnswer(
      question.question, 
      answer.trim(), 
      interview.skill
    );

    console.log('💾 Evaluation result:', {
      score: evaluation.score,
      hasStrengths: evaluation.strengths?.length > 0,
      hasImprovements: evaluation.improvements?.length > 0,
      hasConfidenceTips: evaluation.confidenceTips?.length > 0,
    });

    // ✅ Save to database with all fields
    try {
      await prisma.interviewResponse.update({
        where: { id: questionId },
        data: {
          userAnswer: answer.trim(),
          aiScore: evaluation.score,
          aiFeedback: evaluation.feedback,
          strengths: JSON.stringify(evaluation.strengths),
          improvements: JSON.stringify(evaluation.improvements),
          confidenceTips: JSON.stringify(evaluation.confidenceTips),
        },
      });

      console.log('✅ Answer saved successfully');
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save answer to database' }, 
        { status: 500 }
      );
    }

    // ✅ Return success with all data
    return NextResponse.json({
      success: true,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      confidenceTips: evaluation.confidenceTips,
    });

  } catch (error: any) {
    console.error('❌ Submit answer error:', error);
    console.error('Error details:', {
      name: error.constructor?.name,
      message: error.message,
      code: error.code,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to submit answer',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}
