"use client";

import { signIn, signOut } from "next-auth/react";
import { buttonVariants } from "./ui/button";
import { FaGoogle } from "react-icons/fa";

export const SignInButton = () => {
  return (
    <button
      className={`${buttonVariants({
        size: "sm",
        variant: "ghost",
      })} cursor-pointer`}
    >
      Sign In
    </button>
  );
};

export const SignInButtonWithGoogle = () => {
  return (
    <button
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => signIn("google")}
      className={`${buttonVariants({
        size: "sm",
        variant: "secondary",
      })} cursor-pointer`}
      aria-label="Sign in with Google"
    >
      <FaGoogle />
      <span className="ml-2">Sign in with your Google account</span>
    </button>
  );
};

export const SignOutButton = () => {
  return (
    <button
      onClick={() => signOut()}
      className={`${buttonVariants({
        size: "sm",
        variant: "ghost",
      })} cursor-pointer`}
    >
      Sign Out
    </button>
  );
};

// export const SignInButtonWithNodeMailer = () => {
//   return (
//     <button
//       onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
//         signIn("nodemailer")
//       }
//       className={`${buttonVariants({
//         size: "sm",
//         variant: "secondary",
//       })} cursor-pointer`}
//       aria-label="Sign in with NodeMailer"
//     >
//       <span className="ml-2">Sign in with Nodemailer</span>
//     </button>
//   );
// };
