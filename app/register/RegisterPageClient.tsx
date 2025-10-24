"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { SignInButtonWithGoogle } from "@/components/SessionButtons";
import { SignUpForm } from "@/components/SignUpForm";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

const RegisterPageClient = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleAuthStart = () => {
    setIsLoading(true);
  };

  const handleAuthEnd = (success: boolean = true) => {
    setIsLoading(false);
    if (!success) {
      toast({
        title: "Authentication Error",
        description: "There was an issue during sign in",
        variant: "destructive",
      });
    }
  };
  return (
    <section className="bg-gray-50 dark:bg-zinc-900 min-h-screen flex items-center justify-center p-4">
      <MaxWidthWrapper className="max-w-md w-full bg-slate-50 dark:bg-zinc-950 rounded-xl shadow-md p-8 sm:p-10">
        <div className="flex flex-col justify-center items-center col-span-1 gap-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo/Branding with aria-label */}
            <Link href="/" className="mb-6" aria-label="Return to homepage">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                <span className="text-primary">beei</span>gadgets
              </h1>
            </Link>
            {/* Header with proper heading hierarchy */}
            <header className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Welcome
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Register to create a new account
              </p>
            </header>

            {/* Loading overlay with aria attributes */}
            {isLoading && (
              <div
                className="fixed inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
                aria-live="assertive"
                aria-busy="true"
              >
                <Loader2
                  className="h-8 w-8 animate-spin text-primary"
                  aria-hidden="true"
                />
                <span className="sr-only">Signing in...</span>
              </div>
            )}

            <div className="w-full">
              <SignUpForm />
            </div>

            {/* Divider with aria-hidden */}
            <div className="relative w-full" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-950 text-gray-500">
                  or continue with
                </span>
              </div>
            </div>
            {/* Google Sign In */}
            <SignInButtonWithGoogle
              onAuthStart={handleAuthStart}
              onAuthEnd={() => handleAuthEnd()}
              onError={() => handleAuthEnd(false)}
              callbackUrl={callbackUrl}
              className="w-full"
            />

            {/* Sign in Link */}
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-primary hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                aria-label="Sign up for a new account"
              >
                Sign in
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
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default RegisterPageClient;
