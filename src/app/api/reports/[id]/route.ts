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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const interviewId = parseInt(id);

    // Get interview
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, clerkUserId: userId },
      include: {
        responses: {
          orderBy: { questionNumber: 'asc' },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      interview,
    });

  } catch (error: any) {
    console.error('Get report error:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

