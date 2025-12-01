// src/app/api/interviews/list/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch user interviews with stats
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

// DELETE - Delete an interview by ID
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get interview ID from URL search params
    const { searchParams } = new URL(request.url);
    const interviewIdParam = searchParams.get('id');

    if (!interviewIdParam) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const interviewId = parseInt(interviewIdParam, 10);

    // Verify interview belongs to user
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        clerkUserId: userId,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete related responses first
    await prisma.interviewResponse.deleteMany({
      where: {
        interviewId,
      },
    });

    // Delete the interview
    await prisma.interview.delete({
      where: {
        id: interviewId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Interview deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete interview error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    );
  }
}
