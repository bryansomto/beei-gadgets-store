// lib/api/categories.ts
import { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { tags: ['categories'] }, // Optional: for revalidation
    });

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Optional: Get single category by ID
export async function getCategory(id: string): Promise<Category | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`);
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch category");
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
}