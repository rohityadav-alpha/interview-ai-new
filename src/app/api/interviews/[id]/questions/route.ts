import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const interviewId = parseInt(id);

    // Verify ownership
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        clerkUserId: userId,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get questions
    const questions = await prisma.interviewResponse.findMany({
      where: {
        interviewId: interviewId,
      },
      orderBy: {
        questionNumber: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      questions,
      interview: {
        skill: interview.skill,
        difficulty: interview.difficulty,
      },
    });

  } catch (error: any) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
