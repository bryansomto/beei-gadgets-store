"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export default function RelatedProducts({
  currentProductId,
  categoryId,
}: {
  currentProductId: string;
  categoryId: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/products?categoryId=${categoryId}&excludeId=${currentProductId}&limit=6`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response = await res.json();

        // Handle both response formats:
        // 1. { success: true, data: products[] }
        // 2. Direct products array
        const products = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.products)
          ? response.products
          : [];
        setRelatedProducts(products);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
        setError("Failed to load related products");
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    } else {
      setLoading(false);
    }
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-hidden py-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-3 w-3/4 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-sm text-red-500">{error}</div>;
  }

  if (!relatedProducts?.length) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3
          id="related-products-heading"
          className="text-xl font-bold text-gray-900 dark:text-gray-100"
        >
          You may also like
        </h3>
        {categoryId && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products?category=${categoryId}`} className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {relatedProducts.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="flex-shrink-0 w-32 group"
            aria-label={`View ${product.name}`}
          >
            <div className="aspect-square bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
              <Image
                src={product.images[0] || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover group-hover:opacity-75 transition-opacity"
                sizes="(max-width: 640px) 128px, 128px"
              />
            </div>
            <h3 className="mt-1.5 text-xs font-medium text-gray-900 dark:text-gray-300 line-clamp-1">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
              {formatPrice(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
