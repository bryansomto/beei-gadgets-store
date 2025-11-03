import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Check, Star, Truck, Shield, Headphones } from "lucide-react";
import React from "react";
import ProductGrid from "@/components/ProductGrid";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

async function fetchProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/products`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // Return empty array instead of throwing
  }
}

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="bg-slate-50 dark:bg-zinc-900">
      {/* Hero Section - Simplified & Action-Oriented */}
      <section className="py-8 md:py-12">
        <MaxWidthWrapper>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content - Streamlined */}
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Premium <span className="text-green-600">Gadgets</span> &
                Electronics
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0">
                Latest mobile devices, gaming gear, and smart home accessories
                at unbeatable prices.
              </p>

              {/* Key Benefits - Compact */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                  2-Year Warranty
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                  24/7 Support
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
                >
                  <Link href="/products">Shop All Products</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/products?category=featured">View Deals</Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Social Proof */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <div className="flex -space-x-3">
                <Image
                  src="/users/user-1.png"
                  alt="user image"
                  width={48}
                  height={48}
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-slate-100"
                />
                <Image
                  src="/users/user-2.png"
                  alt="user image"
                  width={48}
                  height={48}
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-slate-100"
                />
                <Image
                  src="/users/user-3.png"
                  alt="user image"
                  width={48}
                  height={48}
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-slate-100"
                />
              </div>
              <div className="text-center lg:text-right">
                <div className="flex justify-center lg:justify-end gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-green-600 fill-green-600"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">1,250+</span> satisfied
                  customers
                </p>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Featured Categories - Quick Navigation */}
      <section className="py-8 bg-white dark:bg-zinc-800">
        <MaxWidthWrapper>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Find exactly what you&apos;re looking for
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Mobile Phones",
                href: "/products?category=mobile-phones",
                emoji: "📱",
              },
              {
                name: "Gaming",
                href: "/products?category=gaming-consoles",
                emoji: "🎮",
              },
              {
                name: "Accessories",
                href: "/products?category=accessories",
                emoji: "🎧",
              },
              {
                name: "Smart Home",
                href: "/products?category=smart-home",
                emoji: "🏠",
              },
            ].map((category) => (
              <Button
                key={category.name}
                asChild
                variant="outline"
                className="h-24 flex flex-col gap-2 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Link href={category.href}>
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Featured Products - Using your existing ProductGrid with Swiper */}
      <ProductGrid title="New arrivals" limit={8} products={products} />

      {/* Category Sections */}
      <div className="space-y-12 py-12">
        <section>
          <ProductGrid
            products={products}
            title="Mobile Phones"
            limit={8}
            category="mobile phones"
          />
        </section>

        <section>
          <ProductGrid
            products={products}
            title="Gaming Consoles"
            limit={8}
            category="gaming consoles"
          />
        </section>

        <section>
          <ProductGrid
            products={products}
            title="Mobile Phone Accessories"
            limit={8}
            category="mobile phone accessories"
          />
        </section>

        <section>
          <ProductGrid
            products={products}
            title="Gaming Accessories"
            limit={8}
            category="gaming console accessories"
          />
        </section>
      </div>

      {/* Trust Signals Section */}
      <section className="py-12 bg-slate-100 dark:bg-zinc-800">
        <MaxWidthWrapper>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                On orders over $50
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2-Year Warranty</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All products covered
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Headphones className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Always here to help
              </p>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Reviews Section */}
      <section className="py-12">
        <MaxWidthWrapper className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            Customer Reviews
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-green-600 fill-green-600"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;Solid design, long-lasting battery. Applications run
                smooth without lags.&quot;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src="/users/user-1.png"
                  alt="Jonathan"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">Jonathan</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Verified Purchase
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-green-600 fill-green-600"
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;Fast delivery and exactly as described. Will definitely
                shop here again!&quot;
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src="/users/user-4.jpg"
                  alt="Bryan"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">Bryan</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Verified Purchase
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
