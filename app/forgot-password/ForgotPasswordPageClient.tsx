"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";

// Define validation schema with Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

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
        setTimeout(() => router.push("/login"), 2000);
      } else if (response.data.redirectToSignup) {
        toast.error("Email not registered. Please sign up first.");
        router.push("/register");
      }
    } catch (error: unknown) {
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
    <section className="bg-gray-50 dark:bg-zinc-900 min-h-screen flex items-center justify-center p-4">
      <MaxWidthWrapper className="max-w-md w-full bg-slate-50 dark:bg-zinc-950 rounded-xl shadow-md p-8 sm:p-10">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo/Branding with aria-label */}
          <Link href="/" className="mb-6" aria-label="Return to homepage">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              <span className="text-primary">beei</span>gadgets
            </h1>
          </Link>
          <Link
            href="/login"
            className={cn(
              "flex items-center text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm mb-4"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
          <header className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Reset your password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </header>
          <div className="w-full">
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
          </div>

          <div className="relative w-full" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium text-primary hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              aria-label="Sign up for a new account"
            >
              Sign up now
            </Link>
          </p>

          {/* Legal Links */}
          <footer className="text-center text-xs text-gray-500 mt-4">
            <p>
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                aria-label="View our Terms of Service"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                aria-label="View our Privacy Policy"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </footer>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
