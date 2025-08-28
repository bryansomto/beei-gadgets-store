import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  // Use test domain for development, real domain for production
  const useTestDomain = process.env.EMAIL_USE_TEST_DOMAIN === 'true' || 
                       process.env.NODE_ENV === 'development';

  const fromEmail = useTestDomain 
    ? 'BeeiGadgets <onboarding@resend.dev>'  // Resend's test domain
    : 'BeeiGadgets <noreply@beeigadgets.com>'; // Your actual domain

  // For development with test domain, we can still send real emails
  if (useTestDomain) {
    console.log('\n📧 ===== USING RESEND TEST DOMAIN =====');
    console.log('From:', fromEmail);
    console.log('To:', email);
    console.log('Reset Link:', resetUrl);
    console.log('========================================\n');
  }

  try {
    if (!resend) {
      throw new Error('Resend client not initialized');
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your BeeiGadgets Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="color: #333;">BeeiGadgets</h1>
            </div>
            
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6;">You requested to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
            
            <p style="color: #666; line-height: 1.6;">Or copy and paste this URL in your browser:</p>
            <p style="color: #333; background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px;">If you have any questions, contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully with test domain');
    return { success: true, data, mode: useTestDomain ? 'test-domain' : 'production' };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Fallback to console log if Resend fails
    console.log('\n📧 [FALLBACK] Password Reset Email:');
    console.log('To:', email);
    console.log('Reset Link:', resetUrl);
    console.log('==================================\n');
    
    throw error;
  }
}

// lib/email.ts - Nodemailer version
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransporter({
//   service: 'Gmail', // or any other service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export async function sendPasswordResetEmail(email: string, resetUrl: string) {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_FROM,
//       to: email,
//       subject: 'Reset your password',
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Password Reset</title>
//         </head>
//         <body>
//           <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
//             <h2>Password Reset Request</h2>
//             <p>You requested to reset your password. Click the button below to create a new password:</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
//                 Reset Password
//               </a>
//             </div>
//             <p>If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
//             <p>Or copy and paste this URL in your browser:</p>
//             <p>${resetUrl}</p>
//           </div>
//         </body>
//         </html>
//       `,
//     });
//   } catch (error) {
//     console.error('Email sending error:', error);
//     throw error;
//   }
// }