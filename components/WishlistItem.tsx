"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";

export default function WishlistItem({ product }: { product: any }) {
  const handleRemove = async () => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      // Refresh the page to see updates
      window.location.reload();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
      <Link href={`/products/${product._id}`} className="block">
        <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="h-12 w-12" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:underline">
              {product.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
            aria-label="Remove from wishlist"
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="font-bold">
            {product.discount ? (
              <div className="flex items-center gap-2">
                <span>
                  {formatPrice(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-sm line-through text-gray-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              formatPrice(product.price)
            )}
          </span>
          <Button size="sm" asChild>
            <Link href={`/products/${product._id}`}>View Product</Link>
          </Button>
        </div>
      </div>

      <div className="absolute top-2 left-2 flex gap-2">
        {product.isNew && (
          <Badge variant="secondary" className="text-xs">
            New
          </Badge>
        )}
        {product.discount && (
          <Badge className="bg-red-500 hover:bg-red-600 text-xs">
            -{product.discount}%
          </Badge>
        )}
      </div>
    </div>
  );
}
