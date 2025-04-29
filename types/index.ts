export interface Category {
    _id: string;
    name: string;
    parent?: string;
    properties: Array<{
      name: string;
      values: string[];
    }>;
  }
  
  export interface Product {
    _id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    category: string | Category;
    properties: Record<string, string>;
    rating: number;
    reviews: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
  }

  export type SortOption = "newest" | "price-low-to-high" | "price-high-to-low" | "popular";