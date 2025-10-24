import WishlistItem from "@/components/WishlistItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { Product } from "@/types";

export default async function WishlistPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const authCookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (!session?.user?.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
          <p className="mb-4">Please sign in to view your wishlist</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch wishlist");
    }

    const products = await response.json();

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="mb-4">Save items you love to your wishlist</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <WishlistItem key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Wishlist page error:", error);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Wishlist</h2>
          <p className="mb-4">
            {error instanceof Error
              ? error.message
              : "We couldn't load your wishlist. Please try again."}
          </p>
          <Button asChild>
            <Link href="/wishlist">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }
}
