"use client";

import { signIn, signOut } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { buttonVariants } from "./ui/button";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

interface AuthButtonProps extends Omit<ComponentProps<"button">, "onClick"> {
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
  callbackUrl?: string;
}

const getButtonProps = (
  props: AuthButtonProps,
  isLoading: boolean,
  className?: string
) => {
  const { onAuthStart, onAuthEnd, callbackUrl, ...buttonProps } = props;
  return {
    ...buttonProps,
    className: cn(
      buttonVariants({ size: "sm", variant: "ghost" }),
      "cursor-pointer",
      isLoading && "opacity-70 cursor-not-allowed",
      className
    ),
    disabled: isLoading,
  } satisfies ComponentProps<"button">;
};

export const SignInButton = ({
  className,
  onAuthStart,
  onAuthEnd,
  callbackUrl,
  ...props
}: AuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const buttonProps = getButtonProps(props, isLoading, className);

  const handleClick = async () => {
    onAuthStart?.();
    setIsLoading(true);
    try {
      await signIn(undefined, { callbackUrl: callbackUrl || "/" });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onAuthEnd?.();
    }
  };

  return (
    <button {...buttonProps} onClick={handleClick}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
    </button>
  );
};

export const SignInButtonWithGoogle = ({
  onAuthStart,
  onAuthEnd,
  callbackUrl,
  className,
  ...props
}: AuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const buttonProps = {
    ...getButtonProps(props, isLoading, className),
    "aria-label": "Sign in with Google",
  };

  const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAuthStart?.();
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: callbackUrl || "/" });
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: "An error occurred during Google sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onAuthEnd?.();
    }
  };

  return (
    <button {...buttonProps} onClick={handleSignIn}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FaGoogle className="mr-2" />
      )}
      <span>Sign in with Google</span>
    </button>
  );
};

export const SignOutButton = ({
  onAuthStart,
  onAuthEnd,
  className,
  ...props
}: AuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const buttonProps = getButtonProps(props, isLoading, className);

  const handleSignOut = async () => {
    onAuthStart?.();
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      toast({
        title: "Signed out successfully",
        description: "You have been signed out",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An error occurred during sign out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onAuthEnd?.();
    }
  };

  return (
    <button {...buttonProps} onClick={handleSignOut}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Out"}
    </button>
  );
};
