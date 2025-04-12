"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
// import { auth } from "@/auth";
import { useSession } from "next-auth/react";
import { SignOutButton } from "./SessionButtons";
// import { useRouter } from "next/navigation";

const Navbar = () => {
  // const session = await auth();
  // const user = session?.user;
  // const isAdmin = user?.email === process.env.ADMIN_EMAIL;
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;
  return (
    <nav className="sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-green-600">beei</span>gadgets
          </Link>
          <div className="h-full flex items-center space-x-4">
            {!user ? (
              <Link
                href="/login"
                className={buttonVariants({ size: "sm", variant: "ghost" })}
              >
                Log In
              </Link>
            ) : isAdmin ? (
              <>
                <p>Welcome {user.name}</p>
                <SignOutButton />
                <Link
                  href="/admin"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  Configure 🛠
                </Link>
              </>
            ) : (
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
