import { Product } from "@/types";

interface GetProductsParams {
  query?: string;
  categoryId?: string;
  sort?: "newest" | "price-low-to-high" | "price-high-to-low" | "popular";
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

interface GetProductsResponse {
  success: boolean;
  products: Product[];
  totalProducts: number;
  page: number;
  totalPages: number;
}

const DEFAULT_LIMIT = 12;
// const MAX_RETRIES = 2;
// const RETRY_DELAY = 1000; // 1 second

/**
 * Fetches products from the API with advanced filtering, sorting, and pagination
 * @param params - Query parameters for filtering products
 * @returns Promise<GetProductsResponse>
 * @throws Error when fetch fails after retries
 */
export async function getProducts({
  query = "",
  categoryId = "",
  sort = "newest",
  page = 1,
  limit = DEFAULT_LIMIT,
  minPrice,
  maxPrice,
  inStock,
}: GetProductsParams = {}): Promise<GetProductsResponse> {
  // Use relative path for API routes in the same application
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const apiPath = '/api/products';
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
  });

  if (query) params.append("search", query);
  if (categoryId) params.append("categoryId", categoryId);
  if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
  if (inStock) params.append("inStock", "true");

  try {
    const response = await fetch(`${baseUrl}${apiPath}?${params.toString()}`, {
      next: { revalidate: 300, tags: ['products'] }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.products || !Array.isArray(data.products)) {
      throw new Error("Invalid products data structure");
    }

    return {
      success: true,
      products: data.products,
      totalProducts: data.totalProducts || 0,
      page: data.page || page,
      totalPages: data.totalPages || Math.ceil((data.totalProducts || 0) / limit),
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch products'
    );
  }
}

// Utility function for React Query or similar libraries
export const productsQueryKey = (params: GetProductsParams) => [
  'products',
  params.query,
  params.categoryId,
  params.sort,
  params.page,
  params.limit,
  params.minPrice,
  params.maxPrice,
  params.inStock,
];