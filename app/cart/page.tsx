"use client";

import { Cart } from "@/components/Cart";
import useUser from "@/lib/userSession";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export default function CartPage() {
  const { loading, authenticated } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/products";
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !authenticated) {
      toast({ description: "Please login to access your cart" });
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [loading, authenticated, router, returnUrl]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-2 border rounded-lg"
              >
                <Skeleton className="w-16 h-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Cart />
    </div>
  );
}
