import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { mongooseConnect } from "@/lib/mongoose";
import {
  saltAndHashPassword,
  verifyPassword,
  isPasswordStrong,
} from "@/lib/saltPassword";
import { defaultLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    console.log("=== PASSWORD RESET DEBUG ===");
    console.log("Starting password reset process");

    await defaultLimiter.middleware(req, 5, "PASSWORD_RESET_LIMITER");
    console.log("Rate limit check passed");

    await mongooseConnect();
    console.log("Database connected successfully");

    const { token, password } = (await req.json()) as {
      token?: string;
      password?: string;
    };

    console.log("Received token:", token ? `${token.substring(0, 10)}...` : "MISSING");
    console.log("Received password:", password ? "PRESENT" : "MISSING");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const strengthCheck = isPasswordStrong(password);
    if (!strengthCheck.isValid) {
      return NextResponse.json(
        { error: strengthCheck.message },
        { status: 400 }
      );
    }

    const resetToken = await PasswordResetToken.findOne({
      token,
      expires: { $gt: new Date() },
      used: false,
    });

    if (!resetToken) {
      const maybeExpired = await PasswordResetToken.findOne({ token });
      if (maybeExpired) {
        console.log("Token exists but is expired or used");
      }
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: resetToken.email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const isSameAsCurrent = await verifyPassword(password, user.password);
    if (isSameAsCurrent) {
      return NextResponse.json(
        { error: "New password cannot be the same as current password" },
        { status: 400 }
      );
    }

    await PasswordResetToken.updateOne(
      { token },
      { used: true, usedAt: new Date() }
    );

    const hashedPassword = await saltAndHashPassword(password);

    await User.updateOne(
      { email: user.email },
      {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error: unknown) {
    console.error("Reset password error details:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      (error as { message: string }).message === "Rate limit exceeded"
    ) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
