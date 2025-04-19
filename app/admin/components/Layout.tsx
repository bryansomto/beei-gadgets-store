"use client";
import { useSession } from "next-auth/react";
import MenuBar from "./MenuBar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MaxWidthWrapper>
      <div className="bg-bgGray min-h-screen space-y-8">
        <MenuBar />
        <div className="flex flex-col flex-grow items-center gap-6">
          {children}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
