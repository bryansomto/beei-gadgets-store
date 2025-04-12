"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { useSession } from "next-auth/react";
import { SignOutButton } from "./SessionButtons";
import { isUserAdmin } from "@/lib/isUserAdmin";

const Navbar = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = isUserAdmin(user?.email);
  return (
    <nav className="sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-green-600">beei</span>gadgets
          </Link>
          <div className="h-full flex items-center space-x-4">
            {!user && (
              <Link
                href="/login"
                className={buttonVariants({ size: "sm", variant: "ghost" })}
              >
                Log In
              </Link>
            )}

            {user && isAdmin && (
              <>
                <SignOutButton />
                <Link
                  href="/admin"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Configure 🛠
                </Link>
              </>
            )}

            {user && !isAdmin && (
              <>
                <p>Welcome {user.name}</p>
                <SignOutButton />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
