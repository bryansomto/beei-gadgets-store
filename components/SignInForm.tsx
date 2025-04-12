"use client";

import { signIn, useSession } from "next-auth/react";
import { buttonVariants } from "./ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const { data: session, status } = useSession(); // get session + status
  const router = useRouter(); // Next.js client-side navigation
  const [loading, setLoading] = useState(false);

  // ✅ Watch for login success
  useEffect(() => {
    if (status === "authenticated") {
      // Optional: Add toast/alert here before redirect
      router.refresh(); // Refresh the session
      router.push("/"); // Redirect to homepage or dashboard
      console.log(session);
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const formObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      formObject[key] = value.toString();
    });

    const res = await signIn("credentials", {
      ...formObject,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      alert("Invalid credentials");
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
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
