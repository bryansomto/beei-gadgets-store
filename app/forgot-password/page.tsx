"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
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

// Define validation schema with Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await axios.post("/api/auth/forgot-password", {
        email: data.email,
      });

      if (response.data.success) {
        toast.success("Password reset link sent to your email!");
      } else if (response.data.redirectToSignup) {
        toast.error("Email not registered. Please sign up first.");
        router.push("/register");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.redirectToSignup) {
          toast.error("Email not registered. Please sign up first.");
          router.push("/register");
        } else {
          toast.error(
            error.response?.data?.error || "Failed to send reset email"
          );
        }
      } else {
        toast.error("Failed to send reset email");
      }
    }
  };

  return (
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

          <Card className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                Reset your password
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={cn(
                        "pl-10 block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
                        "focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
                        "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
                        errors.email &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full flex justify-center",
                    isSubmitting && "cursor-not-allowed",
                    "bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                  )}
                  size="lg"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className={cn(
                      "font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                    )}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
