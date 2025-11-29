import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user interviews
    const interviews = await prisma.interview.findMany({
      where: {
        clerkUserId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate stats
    const stats = await prisma.interview.aggregate({
      where: {
        clerkUserId: userId,
        isCompleted: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        avgScore: true,
      },
      _sum: {
        interviewDuration: true,
      },
    });

    return NextResponse.json({
      success: true,
      interviews,
      stats: {
        total: stats._count.id || 0,
        avgScore: Number(stats._avg.avgScore) || 0,
        totalTime: stats._sum.interviewDuration || 0,
      },
    });

  } catch (error: any) {
    console.error('List interviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
