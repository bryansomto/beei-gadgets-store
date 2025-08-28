// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { PasswordResetToken } from '@/models/PasswordResetToken';
import { mongooseConnect } from '@/lib/mongoose';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // User doesn't exist, redirect to signup
      return NextResponse.json(
        { 
          error: 'Email not registered',
          redirectToSignup: true 
        },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token to database
    await PasswordResetToken.create({
      email: user.email,
      token: resetToken,
      expires,
      used: false
    });

    console.log('Created reset token for:', email);
    console.log('Token:', resetToken);
    console.log('Expires:', expires);
    

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}