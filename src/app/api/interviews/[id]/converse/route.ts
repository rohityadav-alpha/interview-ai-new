// src/app/api/interviews/[id]/converse/route.ts
// Stateless conversational endpoint: receives history + user answer → returns AI response + evaluation
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { evaluateAnswerConversational } from '@/lib/ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const interviewId = parseInt(id);
    if (isNaN(interviewId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await request.json();
    const { questionId, answer, conversationHistory } = body;

    if (!questionId || !answer?.trim()) {
      return NextResponse.json({ error: 'Missing questionId or answer' }, { status: 400 });
    }

    // Verify ownership
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, clerkUserId: userId },
    });
    if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 403 });

    const question = await prisma.interviewResponse.findUnique({ where: { id: questionId } });
    if (!question || question.interviewId !== interviewId) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Run conversational Gemini evaluation
    const result = await evaluateAnswerConversational(
      question.question,
      answer.trim(),
      interview.skill,
      interview.difficulty,
      conversationHistory || []
    );

    // Persist to DB
    await prisma.interviewResponse.update({
      where: { id: questionId },
      data: {
        userAnswer: answer.trim(),
        aiScore: result.score,
        aiFeedback: result.feedback,
        strengths: JSON.stringify(result.strengths),
        improvements: JSON.stringify(result.improvements),
        confidenceTips: JSON.stringify(result.confidenceTips),
      },
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      feedback: result.feedback,         // short spoken feedback
      verboseFeedback: result.verboseFeedback, // full feedback for display
      strengths: result.strengths,
      improvements: result.improvements,
      confidenceTips: result.confidenceTips,
      spokenResponse: result.spokenResponse,   // what AI says aloud next
    });

  } catch (error: any) {
    console.error('Converse error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
