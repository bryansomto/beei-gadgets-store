"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft } from "lucide-react";
import { FaCartPlus, FaShareAlt } from "react-icons/fa";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

export default function ProductPageClient({ product }: { product: Product }) {
  const { addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const categoryId =
    typeof product.category === "string"
      ? product.category
      : product.category._id;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
      // Show success feedback
    } catch (error) {
      // Show error feedback
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

  const primaryImage = product.images[currentImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-zinc-900 min-h-screen">
      {/* Navigation Back Button */}
      <nav aria-label="Back to products">
        <Link
          href="/products"
          className="flex items-center text-sm text-primary hover:underline transition-colors"
          aria-label="Return to products listing"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to products
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Product Images Gallery */}
        <section aria-labelledby="product-images-heading">
          <h2 id="product-images-heading" className="sr-only">
            Product images
          </h2>

          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div
              className={`relative aspect-square bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden group ${
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={toggleZoom}
              aria-label="Product image zoom toggle"
            >
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-300 ${
                  isZoomed ? "scale-150" : "group-hover:scale-105"
                }`}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.stock !== undefined && product.stock <= 0 && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  aria-label="Out of stock indicator"
                >
                  <span className="text-white font-bold text-lg bg-red-500 px-3 py-1 rounded">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div
                className="grid grid-cols-4 gap-2"
                role="tablist"
                aria-label="Product thumbnails"
              >
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative aspect-square bg-gray-50 dark:bg-zinc-800 rounded-md overflow-hidden transition-all ${
                      currentImage === index
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 ring-gray-300 dark:ring-zinc-600"
                    }`}
                    role="tab"
                    aria-selected={currentImage === index}
                    aria-label={`View product image ${index + 1}`}
                    aria-controls="main-product-image"
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Product Details */}
        <section aria-labelledby="product-details-heading">
          <h2 id="product-details-heading" className="sr-only">
            Product details
          </h2>

          <div className="space-y-6">
            {/* Product Header */}
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {/* Rating */}
                <div
                  className="flex items-center"
                  aria-label={`Rating: ${product.rating} out of 5`}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-zinc-600"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {product.rating?.toFixed(1)} ({product.reviews} reviews)
                  </span>
                </div>
                {/* Date Added */}
                {product.createdAt && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Added {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </header>

            {/* Price and Stock */}
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-gray-100 font-semibold text-2xl">
                {formatPrice(product.price)}
              </p>
              <p
                className={`text-sm ${
                  product.stock !== undefined && product.stock > 0
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {product.stock !== undefined && product.stock > 0
                  ? `In stock (${product.stock} available)`
                  : "Out of stock"}
              </p>
            </div>

            {/* Description */}
            <article className="prose max-w-none dark:prose-invert">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Description
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {product.description}
              </p>
            </article>

            {/* Specifications */}
            {Object.keys(product.properties).length > 0 && (
              <section aria-labelledby="specifications-heading">
                <h2
                  id="specifications-heading"
                  className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-4"
                >
                  Specifications
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.properties).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-b border-gray-100 dark:border-zinc-700 pb-2"
                    >
                      <dt className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {key}
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-200 mt-1">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                size="lg"
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                disabled={
                  (product.stock !== undefined && product.stock <= 0) ||
                  isLoading ||
                  isAdding
                }
                onClick={handleAddToCart}
                aria-label="Add to cart"
              >
                <FaCartPlus className="h-5 w-5" />
                Add to cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800"
                aria-label="Share product"
              >
                <FaShareAlt className="h-5 w-5" />
                Share
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Related Products Section */}
      <section className="mt-16" aria-labelledby="related-products-heading">
        <RelatedProducts
          currentProductId={product._id}
          categoryId={categoryId}
        />
      </section>
    </div>
  );
}
