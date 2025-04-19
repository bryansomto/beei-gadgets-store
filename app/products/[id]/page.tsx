"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation"; // Hook to get the dynamic 'id' parameter
import { formatPrice } from "@/lib/formatPrice";

interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price?: number;
  category?: string;
  properties?: Record<string, string>;
}

export default function ProductCard() {
  const { id } = useParams(); // Get the product ID from the URL
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      axios.get(`/api/products?id=${id}`).then((res) => {
        setProduct(res.data);
      });
    }
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className="flex gap-6">
        <div className="w-1/3">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full object-cover"
            />
          ) : (
            <div>No Image</div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-2/3">
          <p>{product.description}</p>
          <p className="text-green-600 font-semibold">
            {formatPrice(product.price ?? 0)}
          </p>
          {/* Add more product details here */}
        </div>
      </div>
    </div>
  );
}
