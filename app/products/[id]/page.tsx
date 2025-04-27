"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { useSwipeable } from "react-swipeable";

interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price?: number;
  category?: string;
  properties?: Record<string, string>;
}

interface ColorOption {
  name: string;
  images: string[];
}

export default function ProductCard() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      axios.get(`/api/products?id=${id}`).then((res) => {
        const productData: Product = res.data;

        // Simulate color grouping: group images by every 2 images
        const groupedColors: ColorOption[] = [];
        const images = productData.images ?? [];

        for (let i = 0; i < images.length; i += 1) {
          groupedColors.push({
            name: `Color ${i / 1 + 1}`,
            images: images.slice(i, i + 1),
          });
        }

        setProduct(productData);
        setColors(groupedColors);
        setSelectedColor(groupedColors[0]);
        setActiveImage(0);
      });
    }
  }, [id]);

  const nextImage = () => {
    setActiveImage((prev) =>
      selectedColor ? (prev + 1) % selectedColor.images.length : 0
    );
  };

  const prevImage = () => {
    setActiveImage((prev) =>
      selectedColor
        ? (prev - 1 + selectedColor.images.length) % selectedColor.images.length
        : 0
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (!product || !selectedColor) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 relative" {...swipeHandlers}>
          <div className="relative overflow-hidden">
            <img
              src={selectedColor.images[activeImage]}
              alt={`${product.name} - ${selectedColor.name}`}
              className="w-full h-auto object-contain rounded-lg shadow"
            />
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
            >
              ◀
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
            >
              ▶
            </button>
          </div>

          {/* Thumbnail carousel */}
          <div className="flex mt-2 gap-2 overflow-x-auto">
            {selectedColor.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx}`}
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-16 object-cover cursor-pointer border rounded ${
                  activeImage === idx ? "border-blue-500" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <p className="text-green-600 font-semibold text-lg">
            {formatPrice(product.price ?? 0)}
          </p>
          <p>{product.description}</p>

          {/* Color Switcher */}
          <div>
            <p className="font-semibold mb-1">Select Color:</p>
            <div className="flex gap-2">
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedColor(color);
                    setActiveImage(0);
                  }}
                  className={`px-3 py-1 rounded border ${
                    selectedColor.name === color.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
