"use client";

import { useSession } from "next-auth/react";
import MenuBar from "./MenuBar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  requiresAuth?: boolean;
  loadingFallback?: ReactNode;
}

export default function Layout({
  children,
  requiresAuth = false,
  loadingFallback = <DefaultLoadingFallback />,
}: LayoutProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (requiresAuth && status === "unauthenticated") {
      toast({
        title: "Access Denied",
        description: "You need to be logged in to view this page",
        variant: "destructive",
      });
    }
  }, [requiresAuth, status, toast]);

  if (requiresAuth && status === "loading") {
    return (
      <MaxWidthWrapper>
        <div className="bg-bgGray min-h-screen flex items-center justify-center">
          {loadingFallback}
        </div>
      </MaxWidthWrapper>
    );
  }

  if (requiresAuth && !session) {
    return (
      <MaxWidthWrapper>
        <div className="bg-bgGray min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
            <p>Please sign in to access this page</p>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="bg-bgGray min-h-screen space-y-8">
        <MenuBar />
        <div className="flex flex-col flex-grow items-center gap-6 p-4">
          {children}
        </div>
      </div>
      <Toaster />
    </MaxWidthWrapper>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p>Loading...</p>
    </div>
  );
}
