"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  ChevronLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { FaCartPlus } from "react-icons/fa";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function ProductPageClient({ product }: { product: Product }) {
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const categoryId =
    typeof product.category === "string"
      ? product.category
      : product.category._id;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImage(index);
    setIsZoomed(false);
  }, []);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  }, [product.images.length]);

  const prevImage = useCallback(() => {
    setCurrentImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  }, [product.images.length]);

  const toggleWishlist = useCallback(() => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted
        ? "Product removed from your wishlist."
        : "Product added to your wishlist.",
    });
  }, [isWishlisted, toast]);

  const shareProduct = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link copied to clipboard.",
      });
    }
  }, [product, toast]);

  const primaryImage = product.images[currentImage];
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Back Button */}
        <nav className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            aria-label="Return to products listing"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to products
          </Link>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Gallery */}
          <section
            aria-labelledby="product-images-heading"
            className="space-y-6"
          >
            <h2 id="product-images-heading" className="sr-only">
              Product images
            </h2>

            {/* Main Image with Zoom and Navigation */}
            <div className="relative group">
              <div
                className={`relative bg-gray-50 dark:bg-zinc-800 rounded-xl overflow-hidden max-w-2xl mx-auto ${
                  isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={toggleZoom}
                aria-label="Product image zoom toggle"
              >
                <div className="aspect-square w-full max-w-md mx-auto">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className={`object-cover transition-all duration-300 ${
                      isZoomed ? "scale-150" : "group-hover:scale-105"
                    }`}
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, (max-width: 1280px) 50vw, 40vw"
                  />
                </div>

                {/* Image Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                    aria-label="Out of stock indicator"
                  >
                    <div className="text-center text-white p-4">
                      <div className="bg-red-500 px-4 py-2 rounded-lg font-semibold text-base sm:text-lg mb-2">
                        Out of Stock
                      </div>
                      <p className="text-sm">We'll restock soon!</p>
                    </div>
                  </div>
                )}

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImage + 1} / {product.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-2xl mx-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 relative aspect-square w-16 sm:w-20 bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden transition-all ${
                      currentImage === index
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:ring-1 ring-gray-300 dark:ring-zinc-600 opacity-80 hover:opacity-100"
                    }`}
                    role="tab"
                    aria-selected={currentImage === index}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Details */}
          <section
            aria-labelledby="product-details-heading"
            className="space-y-8 max-w-2xl xl:max-w-none"
          >
            <h2 id="product-details-heading" className="sr-only">
              Product details
            </h2>

            <div className="space-y-6">
              {/* Product Header */}
              <header className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {product.name}
                    </h1>

                    {/* Rating and Reviews */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div
                        className="flex items-center"
                        aria-label={`Rating: ${product.rating} out of 5`}
                      >
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300 dark:text-zinc-600"
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {product.rating?.toFixed(1)} ({product.reviews}{" "}
                          reviews)
                        </span>
                      </div>

                      {/* Stock Status Badge */}
                      {!isOutOfStock && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          In Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWishlist}
                    className="flex-shrink-0 h-10 w-10 rounded-full"
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isWishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </Button>
                </div>

                {/* Date Added */}
                {product.createdAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added{" "}
                    {new Date(product.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </header>

              {/* Price and Stock */}
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(product.price)}
                </p>
                {product.stock !== undefined && (
                  <p
                    className={`text-sm font-medium ${
                      product.stock > 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} units available`
                      : "Currently out of stock"}
                  </p>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>2-year warranty</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1 h-12 sm:h-14 text-base font-semibold gap-3 bg-primary hover:bg-primary/90"
                    disabled={isOutOfStock || isLoading || isAdding}
                    onClick={handleAddToCart}
                    aria-label="Add to cart"
                  >
                    {isAdding ? (
                      <>
                        <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaCartPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 sm:h-14 px-4 sm:px-6 border-2"
                    onClick={shareProduct}
                    aria-label="Share product"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {isOutOfStock && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                      🔔 Get notified when back in stock
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <article className="prose prose-gray dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Description
                </h3>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {product.description}
                </div>
              </article>

              {/* Specifications */}
              {Object.keys(product.properties).length > 0 && (
                <section
                  aria-labelledby="specifications-heading"
                  className="border-t pt-6"
                >
                  <h3
                    id="specifications-heading"
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
                  >
                    Specifications
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.properties).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700"
                      >
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize mb-1 sm:mb-0">
                          {key}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>
          </section>
        </div>

        {/* Related Products Section */}
        <section
          className="mt-12 lg:mt-16"
          aria-labelledby="related-products-heading"
        >
          <RelatedProducts
            currentProductId={product._id}
            categoryId={categoryId}
          />
        </section>
      </div>
    </div>
  );
}
