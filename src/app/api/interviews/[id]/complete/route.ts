// src/app/api/interviews/[id]/complete/route.ts

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
    const answeredQuestions = responses.filter((r) => r.aiScore !== null);
    const totalScore = answeredQuestions.reduce(
      (sum, r) => sum + (r.aiScore || 0),
      0
    );
    const avgScore =
      answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        isCompleted: true,
        totalScore: Math.round(totalScore),
        avgScore: avgScore,
        questionsAttempted: answeredQuestions.length,
      },
    });

    // ✅ Send email with SendGrid
    try {
      const user = await currentUser();
      const userEmail = user?.primaryEmailAddress?.emailAddress;

      if (userEmail && process.env.SENDGRID_API_KEY) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const reportUrl = `${baseUrl}/reports/${interviewId}`;
        const userName = user?.firstName || 'User';

        const msg = {
          to: userEmail,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL!,
            name: process.env.SENDGRID_FROM_NAME || 'Interview AI',
          },
          subject: `Your Interview AI report for ${updatedInterview.skill}`,
          html: `
            <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Hi ${userName},</h2>
              <p>
                Congratulations on completing your interview practice session in <strong>${updatedInterview.skill}</strong>!
              </p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📊 Score:</strong> ${avgScore.toFixed(1)}/10</p>
                <p style="margin: 5px 0;"><strong>📝 Total Questions:</strong> ${responses.length}</p>
                <p style="margin: 5px 0;"><strong>✅ Questions Attempted:</strong> ${answeredQuestions.length}</p>
              </div>
              <p>View your detailed performance report with AI feedback:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${reportUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Detailed Report →
                </a>
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Keep practicing to improve your interview skills!
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">
                This email was sent by Interview AI. If you didn't request this, please ignore it.
              </p>
            </div>
          `,
        };

        await sgMail.send(msg);
        console.log('✅ SendGrid email sent successfully to:', userEmail);
      }
    } catch (emailError: any) {
      console.error('SendGrid email failed (non-blocking):', emailError.response?.body || emailError);
    }

    return NextResponse.json({
      success: true,
      totalScore: Math.round(totalScore),
      avgScore: avgScore.toFixed(2),
    });
  } catch (error: any) {
    console.error('Complete interview error:', error);
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    );
  }
}
