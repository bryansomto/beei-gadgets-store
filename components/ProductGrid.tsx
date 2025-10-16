"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { Star, ImageOff, ArrowRight, Heart } from "lucide-react";
import { FaCartPlus } from "react-icons/fa";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { useCart } from "@/context/CartContext";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";

interface ProductGridProps {
  title: string;
  limit?: number;
  category?: string;
  products?: Product[];
}

export default function ProductGrid({
  title,
  limit = 8,
  category,
  products: initialProducts = [],
}: ProductGridProps) {
  const { addToCart, isLoading } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<{
          success: boolean;
          products: Product[];
          totalProducts?: number;
        }>("/api/products", {
          params: { limit, category },
        });

        if (data?.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setError("Invalid product data structure received.");
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!initialProducts || initialProducts.length === 0) {
      fetchProducts();
    } else {
      setProducts(initialProducts);
      setLoading(false);
    }
  }, [limit, category]);

  const handleWishlistClick = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProcessing(true);
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400">
        {error}
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4 gap-2"
        >
          Retry <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48 dark:bg-zinc-800" />
          {title === "New arrivals" && (
            <Skeleton className="h-4 w-20 dark:bg-zinc-800" />
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden dark:bg-zinc-900">
              <div className="flex flex-col h-full">
                <Skeleton className="aspect-square w-full dark:bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-1/2 dark:bg-zinc-800" />
                  <Skeleton className="h-8 w-full mt-4 dark:bg-zinc-800" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {title}
          <span className="hidden ml-2 text-muted-foreground text-sm font-normal">
            ({products.length} products)
          </span>
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          aria-label="View all products"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative w-full mb-6" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm"></div>
      </div>

      {title === "New arrivals" ? (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop
            breakpoints={{
              768: { slidesPerView: 1.5 },
              1280: { slidesPerView: 2 },
              // 1440: { slidesPerView: 3 },
            }}
            className="!pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full dark:bg-zinc-900 dark:border-zinc-800">
                    <Link
                      href={`/products/${product._id}`}
                      className="grid grid-cols-1 md:grid-cols-3 h-full"
                    >
                      <div className="relative md:col-span-1 aspect-square bg-gray-50 dark:bg-zinc-800">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600">
                            <ImageOff className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 flex flex-col items-start gap-2 p-3">
                          {product.isNew && (
                            <Badge variant="secondary" className="shadow-sm">
                              New
                            </Badge>
                          )}
                          {product.discount && (
                            <Badge className="bg-red-500 hover:bg-red-600 shadow-sm">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={(e) => handleWishlistClick(e, product)}
                          disabled={isProcessing}
                          aria-label={
                            isInWishlist(product._id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isInWishlist(product._id)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="p-6 flex flex-col md:col-span-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-md mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm dark:text-gray-300">
                                {product.rating?.toFixed(1) || "4.8"}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-sm">
                              ({product.reviews || 24} reviews)
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            {product.discount ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                  {formatPrice(
                                    product.price * (1 - product.discount / 100)
                                  )}
                                </span>
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <Button
                            size="lg"
                            className="gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-zinc-200"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product);
                            }}
                            disabled={isLoading || isAdding}
                          >
                            <FaCartPlus className="h-4 w-4" />
                            {/* Add to Cart */}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col dark:bg-zinc-900 dark:border-zinc-800">
                <Link
                  href={`/products/${product._id}`}
                  className="flex flex-col h-full"
                >
                  <div className="relative aspect-square bg-gray-50 dark:bg-zinc-800">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-100">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 flex flex-col items-start gap-2 p-2">
                      {product.isNew && (
                        <Badge
                          variant="secondary"
                          className="shadow-sm text-xs"
                        >
                          New
                        </Badge>
                      )}
                      {product.discount && (
                        <Badge className="bg-red-500 hover:bg-red-600 shadow-sm text-xs">
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => handleWishlistClick(e, product)}
                      disabled={isProcessing}
                      aria-label={
                        isInWishlist(product._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isInWishlist(product._id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-2">
                      <h3 className="font-medium text-xs sm:text-sm lg:text-base line-clamp-2 text-gray-900 dark:text-gray-100">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">
                          {typeof product.category === "object" &&
                            product.category.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="mb-3">
                        {product.discount ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                              {formatPrice(
                                product.price * (1 - product.discount / 100)
                              )}
                            </span>
                            <span className="text-xs line-through text-muted-foreground">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        disabled={isLoading || isAdding}
                      >
                        <FaCartPlus className="h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
