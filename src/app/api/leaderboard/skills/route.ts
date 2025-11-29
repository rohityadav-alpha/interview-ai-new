import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('📚 Fetching available skills...');

    const interviews = await prisma.interview.findMany({
      where: {
        isCompleted: true,
      },
      select: {
        skill: true,
      },
      distinct: ['skill'],
      orderBy: {
        skill: 'asc',
      },
    });

    const skills = interviews.map((i) => i.skill).filter(Boolean);

    console.log(`✅ Found ${skills.length} unique skills:`, skills);

    return NextResponse.json({ skills });

  } catch (error: any) {
    console.error('❌ Skills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
