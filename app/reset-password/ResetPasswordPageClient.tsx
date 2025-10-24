"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { passwordSchema } from "@/lib/passwordSchema";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

// Create a schema for the form
const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      // You could add a token validation check here
    } else {
      setIsValidToken(false);
      toast.error("Invalid or missing reset token");
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        password: data.password,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        router.push("/login");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          setIsValidToken(false);
          console.log(error.response?.data?.error);
          console.log(token);
        }
        toast.error(error.response?.data?.error || "Failed to reset password");
      } else {
        toast.error("Failed to reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <MaxWidthWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Card className="bg-white dark:bg-zinc-800">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/forgot-password">
                  <Button>Request a new reset link</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link
              href="/login"
              className={cn(
                "flex items-center text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm mb-4"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>

            <Card className="bg-white dark:bg-zinc-950 border-0 h-full mx-auto w-full max-w-md px-2.5 md:px-20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                  Create new password
                </CardTitle>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                  Enter your new password below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className={cn(
                          "pr-10 block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
                          "focus:border-primary focus:ring-2 focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
                          "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
                          "h-10 px-3 py-2 text-sm ring-offset-background",
                          errors.password &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500"
                        )}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className={cn(
                        "block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
                        "focus:border-primary focus:ring-2 focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
                        "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
                        "h-10 px-3 py-2 text-sm ring-offset-background",
                        errors.confirmPassword &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full flex justify-center",
                      isLoading && "cursor-not-allowed",
                      "bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                    )}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
