"use client";

import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { Category, Product, SortOption } from "@/types";
import { FilterX, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function ProductsPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Get URL params with defaults
  const queryParam = params.get("query") || "";
  const categoryId = params.get("categoryId") || "";
  const sort = (params.get("sort") as SortOption) || "newest";
  const page = Number(params.get("page") || 1);

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input with debounce
  const [searchInput, setSearchInput] = useState(queryParam);
  const [debouncedSearchInput] = useDebounce(searchInput, 300);

  // Calculate pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productData, categoryData] = await Promise.all([
          getProducts({
            query: debouncedSearchInput,
            categoryId,
            sort,
            page,
            limit: productsPerPage,
          }),
          getCategories(),
        ]);

        setProducts(productData.products);
        setTotalProducts(productData.totalProducts);
        setCategories(categoryData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchInput, categoryId, sort, page]);

  // Update URL when search changes
  useEffect(() => {
    const newParams = new URLSearchParams(params.toString());

    if (debouncedSearchInput) {
      newParams.set("query", debouncedSearchInput);
    } else {
      newParams.delete("query");
    }

    newParams.set("page", "1");
    router.push(`/products?${newParams.toString()}`);
  }, [debouncedSearchInput]);

  const handleCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value === "all") {
      newParams.delete("categoryId");
    } else {
      newParams.set("categoryId", value);
    }
    newParams.set("page", "1");
    router.replace(`/products?${newParams.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("sort", value);
    newParams.set("page", "1");
    router.replace(`/products?${newParams.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push("/products");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          {error}
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Our Products</h1>
        <div className="text-sm text-muted-foreground">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} found
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">Categories</h2>
            <Select
              value={categoryId || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium">Sort By</h2>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-low-to-high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high-to-low">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleClearFilters}
            disabled={!queryParam && !categoryId && sort === "newest"}
          >
            <FilterX className="h-4 w-4" />
            Clear Filters
          </Button>
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: productsPerPage }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Search className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
