// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { PasswordResetToken } from '@/models/PasswordResetToken';
import { mongooseConnect } from '@/lib/mongoose';
import { 
  saltAndHashPassword, 
  verifyPassword, 
  isPasswordStrong 
} from '@/lib/saltPassword'; // Your password utilities
import { defaultLimiter } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    console.log('=== PASSWORD RESET DEBUG ===');
    console.log('Starting password reset process');
    
    await defaultLimiter.middleware(req, 5, 'PASSWORD_RESET_LIMITER');
    console.log('Rate limit check passed');
    
    await mongooseConnect();
    console.log('Database connected successfully');
    
    const { token, password } = await req.json();
    console.log('Received token:', token ? `${token.substring(0, 10)}...` : 'MISSING');
    console.log('Received password:', password ? 'PRESENT' : 'MISSING');
    
    if (!token || !password) {
      console.log('Missing token or password');
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Check password strength
    const strengthCheck = isPasswordStrong(password);
    if (!strengthCheck.isValid) {
      console.log('Password strength check failed:', strengthCheck.message);
      return NextResponse.json(
        { error: strengthCheck.message },
        { status: 400 }
      );
    }
    console.log('Password strength check passed');

    // Find the reset token with detailed query logging
    console.log('Looking for token in database...');
    const resetToken = await PasswordResetToken.findOne({ 
      token,
      expires: { $gt: new Date() },
      used: false
    });

    console.log('Token query result:', resetToken ? 'FOUND' : 'NOT FOUND');
    
    if (resetToken) {
      console.log('Token details:');
      console.log('- Email:', resetToken.email);
      console.log('- Expires:', resetToken.expires);
      console.log('- Used:', resetToken.used);
      console.log('- Current time:', new Date());
      console.log('- Is expired?', new Date() > resetToken.expires);
    } else {
      // Let's check if the token exists but is expired or used
      const anyToken = await PasswordResetToken.findOne({ token });
      if (anyToken) {
        console.log('Token exists but may be invalid:');
        console.log('- Expired?', new Date() > anyToken.expires);
        console.log('- Used?', anyToken.used);
      } else {
        console.log('No token found with that value');
      }
    }

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find the user
    console.log('Looking for user with email:', resetToken.email);
    const user = await User.findOne({ email: resetToken.email });
    
    if (!user) {
      console.log('User not found for email:', resetToken.email);
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    console.log('User found:', user.email);

    // Check if new password is different from current
    const isSameAsCurrent = await verifyPassword(password, user.password);
    if (isSameAsCurrent) {
      console.log('New password is same as current password');
      return NextResponse.json(
        { error: 'New password cannot be the same as current password' },
        { status: 400 }
      );
    }
    console.log('New password is different from current password');

    // Mark token as used immediately
    console.log('Marking token as used');
    await PasswordResetToken.updateOne(
      { token },
      { used: true, usedAt: new Date() }
    );

    // Hash the new password
    console.log('Hashing new password');
    const hashedPassword = await saltAndHashPassword(password);

    // Update user password
    console.log('Updating user password');
    await User.updateOne(
      { email: user.email },
      { 
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    );

    console.log('Password reset successful for user:', user.email);
    
    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    console.log('=== PASSWORD RESET COMPLETE ===');
    return response;
  } catch (error) {
    console.error('Reset password error details:', error);
    
    if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message === 'Rate limit exceeded') {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     // Apply rate limiting - 5 attempts per minute per IP
//     await defaultLimiter.middleware(req, 5, 'PASSWORD_RESET_LIMITER');

//     await mongooseConnect();
    
//     const { token, password } = await req.json();
    
//     if (!token || !password) {
//       return NextResponse.json(
//         { error: 'Token and password are required' },
//         { status: 400 }
//       );
//     }

//     // Use your password strength utility
//     const strengthCheck = isPasswordStrong(password);
//     if (!strengthCheck.isValid) {
//       return NextResponse.json(
//         { error: strengthCheck.message },
//         { status: 400 }
//       );
//     }

//     // Find the reset token
//     const resetToken = await PasswordResetToken.findOne({ 
//       token,
//       expires: { $gt: new Date() },
//       used: false
//     });

//     // Generic error message to prevent information disclosure
//     if (!resetToken) {
//       return NextResponse.json(
//         { error: 'Invalid or expired reset token' },
//         { status: 400 }
//       );
//     }

//     // Find the user
//     const user = await User.findOne({ email: resetToken.email });
    
//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid or expired reset token' }, // Generic message
//         { status: 400 }
//       );
//     }

//     // Use your verifyPassword utility to check if new password is different from current
//     const isSameAsCurrent = await verifyPassword(password, user.password);
//     if (isSameAsCurrent) {
//       return NextResponse.json(
//         { error: 'New password cannot be the same as current password' },
//         { status: 400 }
//       );
//     }

//     // Mark token as used immediately
//     await PasswordResetToken.updateOne(
//       { token },
//       { used: true, usedAt: new Date() }
//     );

//     // Use your saltAndHashPassword utility for consistent hashing
//     const hashedPassword = await saltAndHashPassword(password);

//     // Update user password and add to history
//     await User.updateOne(
//       { email: user.email },
//       { 
//         password: hashedPassword,
//         $push: { 
//           passwordHistory: {
//             hash: user.password, // Store old password in history
//             changedAt: new Date()
//           } 
//         },
//         passwordChangedAt: new Date() // Track when password was last changed
//       }
//     );

//     // Log the password reset (consider using a proper logging library)
//     const forwardedFor = req.headers.get('x-forwarded-for');
//     const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
//     console.log(`Password reset for user: ${user.email}, IP: ${ip}`);
    
//     // Invalidate all existing sessions for this user (if you have session management)
//     // await invalidateUserSessions(user._id);
    
//     // Create response with security headers
//     const response = NextResponse.json({
//       success: true,
//       message: 'Password reset successfully',
//     });
    
//     response.headers.set('X-Content-Type-Options', 'nosniff');
//     response.headers.set('X-Frame-Options', 'DENY');
//     response.headers.set('X-XSS-Protection', '1; mode=block');
//     response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
//     return response;
//   } catch (error) {
//     if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message === 'Rate limit exceeded') {
//       return NextResponse.json(
//         { error: 'Too many requests. Please try again later.' },
//         { status: 429 }
//       );
//     }
    
//     console.error('Reset password error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Other HTTP methods unchanged
// export async function GET() {
//   return NextResponse.json(
//     { error: 'Method not allowed' },
//     { status: 405 }
//   );
// }

// export async function PUT() {
//   return NextResponse.json(
//     { error: 'Method not allowed' },
//     { status: 405 }
//   );
// }

// export async function DELETE() {
//   return NextResponse.json(
//     { error: 'Method not allowed' },
//     { status: 405 }
//   );
// }

// export async function PATCH() {
//   return NextResponse.json(
//     { error: 'Method not allowed' },
//     { status: 405 }
//   );
// }