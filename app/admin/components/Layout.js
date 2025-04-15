"use client";
import { useSession } from "next-auth/react";
import MenuBar from "./MenuBar";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function Layout({ children }) {
  return (
    <MaxWidthWrapper>
      <div className="bg-bgGray min-h-screen">
        <MenuBar />
        <div className="">{children}</div>
      </div>
    </MaxWidthWrapper>
  );
}
