import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, name } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME || 'Interview AI',
      },
      subject,
      html,
    };

    await sgMail.send(msg);

    console.log('✅ SendGrid email sent to:', to);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
