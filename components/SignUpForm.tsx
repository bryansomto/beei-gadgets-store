"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { buttonVariants } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      await axios.post("/api/register", {
        firstName:
          data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1),
        lastName:
          data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1),
        email: data.email,
        password: data.password,
      });

      toast({
        title: "Account created!",
        description: "Your account has been registered successfully.",
      });

      // Redirect to login or dashboard after successful registration
      router.push("/login");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description:
            error.response.data.message ||
            "An error occurred during registration",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-sm"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          disabled={isLoading}
          className={cn(
            "block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
            "focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
            "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
            errors.firstName &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
          )}
          placeholder="John"
          aria-describedby="firstName-description"
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
        />
        {errors.firstName && (
          <p
            className="text-sm text-red-500 dark:text-red-400 mt-1"
            id="firstName-error"
          >
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          autoComplete="family-name"
          disabled={isLoading}
          className={cn(
            "block w-full rounded-md border border-gray-300 dark:border-zinc-600 shadow-sm",
            "focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary",
            "p-2 disabled:opacity-50 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100",
            errors.lastName &&
              "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
          )}
          placeholder="Doe"
          aria-describedby="lastName-description"
          aria-invalid={!!errors.lastName}
          {...register("lastName")}
        />
        {errors.lastName && (
          <p
            className="text-sm text-red-500 dark:text-red-400 mt-1"
            id="lastName-error"
          >
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email
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
          placeholder="email@example.com"
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
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
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
            Creating account...
          </>
        ) : (
          "Sign up"
        )}
      </button>
    </form>
  );
}
