import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";

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
  products: any[];
}

export default function ProductGrid({
  products: initialProducts,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get<Product[]>("/api/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="p-4 flex flex-col gap-2">
            <Link href={`/products/${product._id}`}>
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h2 className="font-medium text-lg truncate">{product.name}</h2>
                {product.price !== undefined && (
                  <p className="text-green-600 font-semibold text-sm">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
              <Button size="sm" className="mt-auto">
                Add to Cart
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
