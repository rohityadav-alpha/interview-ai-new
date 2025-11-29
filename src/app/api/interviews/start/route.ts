import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateInterviewQuestions } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { skill, difficulty = 'medium' } = body;

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Starting interview for:', { userId, skill, difficulty });

    // Generate AI questions
    const questions = await generateInterviewQuestions(skill, difficulty, 10);

    console.log('✅ Generated questions:', questions.length);

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        clerkUserId: userId,
        userEmail: user.emailAddresses[0]?.emailAddress || '',
        userFirstName: user.firstName || 'Anonymous',
        userLastName: user.lastName || '',
        userUsername: user.username || user.id.substring(0, 8),
        skill,
        difficulty,
        isCompleted: false,
        totalScore: 0,
        avgScore: 0,
        questionsAttempted: 0,
      },
    });

    console.log('✅ Created interview:', interview.id);

    // Store questions
    const questionRecords = await Promise.all(
      questions.map((q, index) =>
        prisma.interviewResponse.create({
          data: {
            interviewId: interview.id,
            questionNumber: index + 1,
            question: q.question,
          },
        })
      )
    );

    console.log('✅ Stored questions:', questionRecords.length);

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      questionCount: questionRecords.length,
    });

  } catch (error: any) {
    console.error('❌ Start interview error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start interview', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
