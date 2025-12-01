import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');

    console.log('📊 Fetching leaderboard for skill:', skill || 'all');

    // Get all completed interviews
    const whereClause: any = {
      isCompleted: true,
      totalScore: {
        gt: 0,
      },
    };

    if (skill && skill !== 'all') {
      whereClause.skill = skill;
    }

    const allInterviews = await prisma.interview.findMany({
      where: whereClause,
      orderBy: [
        { totalScore: 'desc' },
        { avgScore: 'desc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        clerkUserId: true,
        userEmail: true,
        userFirstName: true,
        userLastName: true,
        userUsername: true,
        skill: true,
        difficulty: true,
        totalScore: true,
        avgScore: true,
        createdAt: true,
      },
    });

    console.log(`📈 Found ${allInterviews.length} total interviews`);

    // Group by email and get best score per user
    const userBestMap = new Map<string, any>();

    allInterviews.forEach((interview) => {
      const email = interview.userEmail;
      if (!email) return;

      const existing = userBestMap.get(email);
      
      // Keep the interview with highest total score
      if (!existing || interview.totalScore > existing.totalScore) {
        userBestMap.set(email, interview);
      } else if (interview.totalScore === existing.totalScore) {
        // If same total score, prefer higher avg score
        if (Number(interview.avgScore) > Number(existing.avgScore)) {
          userBestMap.set(email, interview);
        }
      }
    });

    console.log(`👥 Unique users: ${userBestMap.size}`);

    // Convert to array and add rankings
    const leaderboard = Array.from(userBestMap.values())
      .sort((a, b) => {
        // Sort by total score first
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        // Then by avg score
        const avgDiff = Number(b.avgScore) - Number(a.avgScore);
        if (avgDiff !== 0) {
          return avgDiff;
        }
        // Finally by date (earlier is better)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 100)
      .map((interview, index) => {
        // Count total interviews for this user
        const userInterviews = allInterviews.filter(
          (i) => i.userEmail === interview.userEmail
        );

        return {
          rank: index + 1,
          userEmail: interview.userEmail,
          userName: `${interview.userFirstName || ''} ${interview.userLastName || ''}`.trim() || 'Anonymous',
          userFirstName: interview.userFirstName || 'Anonymous',
          userLastName: interview.userLastName || '',
          skill: interview.skill,
          difficulty: interview.difficulty,
          totalScore: interview.totalScore,
          avgScore: Number(interview.avgScore),
          interviewCount: userInterviews.length,
          createdAt: interview.createdAt,
        };
      });

    console.log(`✅ Returning top ${leaderboard.length} users`);

    return NextResponse.json({ leaderboard });

  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Error fetching leaderboard' },
      { status: 500 }
    );
  }
}
