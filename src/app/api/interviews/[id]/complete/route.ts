import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const interviewId = parseInt(id);

    // Get all responses
    const responses = await prisma.interviewResponse.findMany({
      where: { interviewId },
    });

    // Calculate scores
    const answeredQuestions = responses.filter(r => r.aiScore !== null);
    const totalScore = answeredQuestions.reduce((sum, r) => sum + (r.aiScore || 0), 0);
    const avgScore = answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

    // Update interview
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        isCompleted: true,
        totalScore: Math.round(totalScore),
        avgScore: avgScore,
        questionsAttempted: answeredQuestions.length,
      },
    });

    return NextResponse.json({
      success: true,
      totalScore: Math.round(totalScore),
      avgScore: avgScore.toFixed(2),
    });

  } catch (error: any) {
    console.error('Complete interview error:', error);
    return NextResponse.json({ error: 'Failed to complete interview' }, { status: 500 });
  }
}
