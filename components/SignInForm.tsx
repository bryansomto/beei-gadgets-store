"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignInFormProps {
  onAuthStart?: () => void;
  onAuthEnd?: (success?: boolean) => void; // Modified to accept success status
  onError?: () => void; // Added new prop
  callbackUrl?: string;
  className?: string;
}

export function SignInForm({
  onAuthStart,
  onAuthEnd,
  onError,
  callbackUrl,
  className,
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const finalCallbackUrl =
    callbackUrl || searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAuthStart?.();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: finalCallbackUrl,
      });

      if (result?.error) {
        onError?.();
        onAuthEnd?.(false);
        toast({
          variant: "destructive",
          title: "Login failed",
          description:
            result.error === "CredentialsSignin"
              ? "Invalid email or password"
              : "An error occurred during login",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Redirecting to your account...",
        });
        router.push(finalCallbackUrl);
        router.refresh(); // Ensure client state is updated
      }
    } catch (error) {
      onError?.();
      onAuthEnd?.(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
      onAuthEnd?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 w-full", className)}
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 disabled:opacity-50"
          placeholder="you@example.com"
          aria-describedby="email-description"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 disabled:opacity-50"
          placeholder="••••••••"
          minLength={8}
          aria-describedby="password-description"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full flex justify-center",
          isLoading && "cursor-not-allowed"
        )}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

function Link({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
