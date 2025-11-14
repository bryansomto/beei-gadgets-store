"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      // Show success feedback
    } catch (error: unknown) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        toast({ description: `${product.name} removed from wishlist` });
      } else {
        await addToWishlist(product._id);
        toast({ description: `${product.name} added to wishlist` });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.stock !== undefined && product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium bg-red-500 px-2 py-1 rounded text-sm">
                Out of Stock
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 rounded-full shadow-md backdrop-blur-sm transition-colors"
            onClick={(e) => handleWishlistClick(e, product)}
            disabled={isProcessing}
            aria-label={
              isInWishlist(product._id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isInWishlist(product._id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-md mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              ({product.reviews})
            </span>
          </div>
          <p className="font-semibold">{formatPrice(product.price)}</p>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <Button
          className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
          disabled={/*(product.stock ?? 0) <= 0 ||*/ isLoading || isAdding}
          onClick={handleAddToCart}
          aria-label="Add to cart"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
