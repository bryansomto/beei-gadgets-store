"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { SignInButtonWithGoogle } from "@/components/SessionButtons";
import { SignUpForm } from "@/components/SignUpForm";
import Link from "next/link";
import React from "react";
import SweetAlert2 from "react-sweetalert2";

const Register = () => {
  return (
    <section>
      <MaxWidthWrapper className="pb-24 pt-10 lg:col-span-1 sm:pb-32 lg:gap-x-0 xl:gap-x-8 lg:pt-16 xl:pt-24 lg:pb-52">
        <div className="flex flex-col justify-center items-center col-span-1 gap-4">
          <h2 className="mt-2 mb-8 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
            Register to continue
          </h2>
          <div className="flex flex-col gap-8 items-center">
            <SignUpForm />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-col gap-2 items-center">
              <p className="text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
              <div>
                <p className="text-sm text-gray-500">or</p>
              </div>
              <div>
                <SignInButtonWithGoogle />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a
                href="/terms"
                className="font-medium text-primary hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="font-medium text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default Register;
