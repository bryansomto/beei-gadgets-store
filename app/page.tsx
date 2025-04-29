"use client";

import { Icons } from "@/components/Icons";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Phone from "@/components/Phone";
import { Reviews } from "@/components/Reviews";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products on component mount (or use getServerSideProps for server-side)
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        setProducts(response.data); // assuming response is an array of products
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-slate-50 flex flex-col space-y-24 sm:space-y-30 pt-12 md:pt-20">
      {/* <h2 className="absolute top-1/2 left1/2 transform -translate-x-1/2 -translate-y-1/2 order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
          Featured Products
        </h2> */}
      <MaxWidthWrapper>
        <div className="relative mx-auto text-center lg:text-left flex flex-col items-center lg:items-start">
          {/* <div className="absolute w-28 left-0 -top-20 hidden lg:block">
                <img src="/beei-1.png" className="w-full" />
              </div> */}
          <h1 className="relative w-fit tracking-tight text-balance font-bold !leading-tight text-gray-900 text-5xl md:text-6xl lg:text-7xl">
            Your one-stop{" "}
            <span className="bg-green-600 px-2 text-white">Gadget</span> shop
            for mobile and home devices.
          </h1>
          <p className="mt-8 text-lg lg:pr-10 max-w-prose text-center lg:text-left text-balance md:text-wrap">
            Make your space smart and fun with{" "}
            <span className="font-semibold">our excellent</span> device deals.
            BeeiGadgets provides you with the best deals on mobile or home
            gadgets.
          </p>
          <ul className="mt-8 space-y-2 text-left font-medium flex flex-col items-center sm:items-start">
            <div className="space-y-2">
              <li className="flex gap-1.5 items-center text-left">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                High-quality, durable device
              </li>
              <li className="flex gap-1.5 items-center text-left">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Best prices, fast deliveries
              </li>
            </div>
          </ul>
          <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex -space-x-4">
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                src="/users/user-1.png"
                alt="user image"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                src="/users/user-2.png"
                alt="user image"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                src="/users/user-3.png"
                alt="user image"
              />
              <img
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-100"
                src="/users/user-4.jpg"
                alt="user image"
              />
              <img
                className="inline-block object-cover h-10 w-10 rounded-full ring-2 ring-slate-100"
                src="/users/user-5.jpg"
                alt="user image"
              />
            </div>
            <div className="flex flex-col justify-between items-center sm:items-start">
              <div className="flex gap-0.5">
                <Star className="h-4 w-4 text-green-600 fill-green-600" />
                <Star className="h-4 w-4 text-green-600 fill-green-600" />
                <Star className="h-4 w-4 text-green-600 fill-green-600" />
                <Star className="h-4 w-4 text-green-600 fill-green-600" />
                <Star className="h-4 w-4 text-green-600 fill-green-600" />
              </div>
              <p>
                <span className="font-semibold">1,250</span> happy customers
              </p>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      <div className="flex flex-col">
        {/* Displaying the ProductGrid with the fetched products */}
        <section>
          <MaxWidthWrapper>
            <ProductGrid products={products} title="New arrivals" limit={4} />
          </MaxWidthWrapper>
        </section>

        <section>
          <MaxWidthWrapper>
            <ProductGrid
              products={products}
              title="Mobile phones"
              limit={4}
              category="mobile phones"
            />
          </MaxWidthWrapper>
        </section>

        <section>
          <MaxWidthWrapper>
            <ProductGrid
              products={products}
              title="Gaming consoles"
              limit={4}
              category="gaming consoles"
            />
          </MaxWidthWrapper>
        </section>

        <section>
          <MaxWidthWrapper>
            <ProductGrid
              products={products}
              title="Mobile phone accessories"
              limit={4}
              category="mobile phone accessories"
            />
          </MaxWidthWrapper>
        </section>
        <section>
          <MaxWidthWrapper>
            <ProductGrid
              products={products}
              title="Gaming accessories"
              limit={4}
              category="gaming console accessories"
            />
          </MaxWidthWrapper>
        </section>
      </div>

      {/* value proposition section */}
      <section className="bg-slate-100">
        <MaxWidthWrapper className="flex flex-col items-center gap-16 md:gap-24">
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
            <h2 className="order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
              What our
              <span className="relative px-2">
                customers{" "}
                <Icons.underline className="hidden sm:block pointer-events-none absolute inset-x-0 -bottom-6 text-green-500" />
              </span>
              say
            </h2>
            {/* <img src="/beei-1.png" className="w-24 order-0 lg:order-2" /> */}
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 gap-y-16">
            <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
              <div className="flex gap-0.5 mb-2">
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
              <div className="text-lg leading-8">
                <p>
                  "Solid design, long-lasting battery. Applications runs smooth
                  withouts lags or heating up the device."
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                <img
                  className="rounded-full h-12 w-12 object-coover"
                  src="/users/user-1.png"
                  alt="user"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">Jonathan</p>
                  <div className="flex gap-1.5 items-center text-zinc-600">
                    <Check className="h-4 w-4 stroke-[3px] text-green-600" />
                    <p className="text-sm">Verified Purchase</p>
                  </div>
                </div>
              </div>
            </div>
            {/* second user review */}
            <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
              <div className="flex gap-0.5 mb-2">
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
                <Star className="h-5 w-5 text-green-600 fill-green-600" />
              </div>
              <div className="text-lg leading-8">
                <p>
                  I've always wanted to own the Samsung S series, and starting
                  off with the all new S25 ultra is a really big deal for me.
                  The Galaxy AI is so handy. It is practically the fastest
                  mobile device on the planet - LOL. I especially love how
                  seamless the process was, from purchase to delivery - thank
                  you BeeiGadgets.
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                {" "}
                <img
                  className="rounded-full h-12 w-12 object-coover"
                  src="/users/user-4.jpg"
                  alt="user"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">Bryan</p>
                  <div className="flex gap-1.5 items-center text-zinc-600">
                    <Check className="h-4 w-4 stroke-[3px] text-green-600" />
                    <p className="text-sm">Verified Purchase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </div>
  );
}
