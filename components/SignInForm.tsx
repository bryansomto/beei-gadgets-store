"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonVariants } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onAuthStart?: () => void;
  onAuthEnd?: (success?: boolean) => void;
  onError?: () => void;
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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const finalCallbackUrl =
    callbackUrl || searchParams.get("callbackUrl") || "/";

  const onSubmit = async (data: SignInFormValues) => {
    onAuthStart?.();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: finalCallbackUrl,
      });

      if (result?.error) {
        onError?.();
        onAuthEnd?.(false);

        let errorMessage = "An error occurred during login";
        if (result.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password";
        } else if (result.error === "AccessDenied") {
          errorMessage = "Your account is not authorized";
        }

        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorMessage,
        });
      } else {
        toast({
          title: "Login successful",
          description: "Redirecting to your account...",
        });
        router.push(finalCallbackUrl);
        router.refresh();
      }
    } catch (error) {
      onError?.();
      onAuthEnd?.(false);
      console.error("SignIn error:", error);
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
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4 w-full", className)}
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          className={cn(
            "block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
            "focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
            "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
            errors.email &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
          )}
          placeholder="you@example.com"
          aria-describedby="email-description"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p
            className="text-sm text-red-500 dark:text-red-400 mt-1"
            id="email-error"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
              "focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
              "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
              errors.password &&
                "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
            )}
            placeholder="••••••••"
            minLength={8}
            aria-describedby="password-description"
            aria-invalid={!!errors.password}
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
          <p
            className="text-sm text-red-500 dark:text-red-400 mt-1"
            id="password-error"
          >
            {errors.password.message}
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
