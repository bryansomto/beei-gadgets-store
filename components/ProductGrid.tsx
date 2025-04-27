import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { Star, ImageOff } from "lucide-react";
import { FaCartPlus } from "react-icons/fa";
import Link from "next/link";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price?: number;
  category?: string;
  properties?: Record<string, string>;
}

interface ProductGridProps {
  title: string;
  limit?: number;
  category?: string;
  products: any[];
}

export default function ProductGrid({
  title,
  limit,
  category,
  products: initialProducts,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get<Product[]>("/api/products", {
        params: { limit, category },
      })
      .then((res) => {
        setProducts(res.data);
      });
  }, [limit, initialProducts]);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {title === "New arrivals" && (
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      {title === "New arrivals" ? (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              dynamicBullets: true,
              clickable: true,
              el: ".swiper-pagination",
            }}
            autoplay={{
              delay: 5000, // 5 seconds between slides
              disableOnInteraction: false, // Continue autoplay after user interactions
              pauseOnMouseEnter: true, // Pause when mouse hovers over carousel
            }}
            loop={true} // Enable infinite loop
            effect={"fade"}
            fadeEffect={{
              crossFade: true,
            }}
            breakpoints={{
              768: {
                slidesPerView: 1.5,
              },
              1024: {
                slidesPerView: 1,
              },
            }}
            className="mySwiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <Link
                    href={`/products/${product._id}`}
                    className="grid grid-cols-1 md:grid-cols-3"
                  >
                    <div className="md:order-1 col-span-1 relative aspect-square bg-gray-50">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageOff className="h-12 w-12" />
                        </div>
                      )}
                      {product.price !== undefined && (
                        <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded-md shadow-sm">
                          <p className="font-semibold text-lg">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 p-6 flex flex-col">
                      <div className="flex-1">
                        <h2 className="font-medium text-xl mb-2 line-clamp-2">
                          {product.name}
                        </h2>
                        <p className="text-gray-600 whitespace-pre-line line-clamp-4 mb-4">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                          <span className="mx-1">·</span>
                          <span>24 reviews</span>
                        </div>
                        <Button size="lg" className="gap-2">
                          <FaCartPlus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              </SwiperSlide>
            ))}

            {/* Custom navigation buttons */}
            <div className="swiper-button-prev !left-2 !text-primary after:!text-[24px]"></div>
            <div className="swiper-button-next !right-2 !text-primary after:!text-[24px]"></div>
            <div className="swiper-pagination !relative !mt-4"></div>
          </Swiper>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <Card
              key={product._id}
              className="group overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link
                href={`/products/${product._id}`}
                className="flex flex-col h-full"
              >
                <div className="relative aspect-square bg-gray-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-medium text-md line-clamp-1 sm:text-lg mb-1">
                    {product.name}
                  </h2>
                  {product.price !== undefined && (
                    <p className="text-sm sm:text-lg font-semibold mb-3">
                      {formatPrice(product.price)}
                    </p>
                  )}

                  <Button size="sm" className="mt-auto w-full gap-1">
                    <FaCartPlus className="h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
