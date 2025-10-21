import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";
import { Product } from "@/types";

export const dynamicParams = true;
export const revalidate = 3600;

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?id=${id}`,
      { next: { tags: ["products", `product-${id}`] } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      next: { tags: ["products"] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = Array.isArray(data) ? data : data.products || [];
    return products.map((product: Product) => ({ id: product._id }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return {
    title: product?.name || "Product Not Found",
    description: product?.description || "View product details",
    openGraph: {
      images: product?.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) return notFound();
  return <ProductPageClient product={product} />;
}
