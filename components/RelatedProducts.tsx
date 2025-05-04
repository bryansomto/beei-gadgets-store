"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";

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

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?categoryId=${categoryId}&excludeId=${currentProductId}&limit=6` // Increased to 6 items
        );
        const data = await res.json();
        setRelatedProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  if (loading)
    return (
      <div className="flex space-x-4 overflow-hidden py-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 h-40 bg-gray-100 dark:bg-zinc-900 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );

  if (!relatedProducts.length) return null;

  return (
    <div className="relative">
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {relatedProducts.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="flex-shrink-0 w-32 group" // Fixed width for consistent sizing
          >
            <div className="aspect-square bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={128} // Smaller image size
                height={128}
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
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
