"use client";

import { signIn, useSession } from "next-auth/react";
import { buttonVariants } from "./ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import useUser from "@/lib/userSession";

export function SignInForm() {
  const { user, isAdmin, loading, authenticated } = useUser();
  const router = useRouter(); // Next.js client-side navigation
  const [progress, setProgress] = useState(false);

  // ✅ Watch for login success
  React.useEffect(() => {
    if (authenticated) {
      Swal.fire({
        icon: "success",
        title: `Welcome back, ${user?.name ?? "user"}!`,
        showConfirmButton: false,
        timer: 1500,
      });
      router.refresh(); // Refresh the session
      router.push("/"); // Redirect to homepage or dashboard
    }
  }, [authenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProgress(true);

    const formData = new FormData(event.currentTarget);
    const formObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      formObject[key] = value.toString();
    });

    const res = await signIn("credentials", {
      ...formObject,
      redirect: false,
    });

    setProgress(false);

    if (res?.error) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: "Invalid credentials, please try again.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-2"
    >
      <label htmlFor="credentials-email">
        <p>Email</p>
        <input
          name="email"
          id="credentials-email"
          type="email"
          required
          minLength={3}
          placeholder="email@beeigadgetsstore.com"
          className="mb-0 w-72 pr-3 p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <label htmlFor="credentials-password">
        <p>Password</p>
        <input
          name="password"
          id="credentials-password"
          type="password"
          required
          minLength={3}
          placeholder="************"
          className="mb-0 w-72 pr-3  p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <button
        type="submit"
        className={`${buttonVariants({ size: "lg" })} cursor-pointer`}
        disabled={progress}
      >
        {progress ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
