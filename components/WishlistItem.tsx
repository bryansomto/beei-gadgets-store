"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";

export default function WishlistItem({ product }: { product: Product }) {
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
      window.location.reload();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800 flex items-start gap-3 p-3 sm:block sm:gap-0 sm:p-0">
      <Link
        href={`/products/${product._id}`}
        className="block w-24 h-24 flex-shrink-0 sm:w-full sm:h-auto rounded-md overflow-hidden"
      >
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
      </Link>
      <div className="flex-1 min-w-0 p-0 sm:p-4">
        <div className="flex justify-between items-center mb-2">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:underline">
              {product.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 rounded-full shadow-md backdrop-blur-sm transition-colors flex-shrink-0 -mr-2 sm:mr-0"
            onClick={handleRemove}
            aria-label="Remove from wishlist"
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 sm:mt-4">
          <span className="font-bold text-sm sm:text-base">
            {product.discount ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-2">
                <span>
                  {formatPrice(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-xs sm:text-sm line-through text-gray-500">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              formatPrice(product.price)
            )}
          </span>
          <Button
            size="sm"
            asChild
            className="text-sm px-2 py-1 h-auto sm:text-base sm:px-4 sm:py-2 sm:h-9 gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
          >
            <Link href={`/products/${product._id}`}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
