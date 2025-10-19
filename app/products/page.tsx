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
import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { Category, Product, SortOption } from "@/types";
import {
  FilterX,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type ViewMode = "grid" | "list";

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search input with debounce
  const [searchInput, setSearchInput] = useState(queryParam);
  const [debouncedSearchInput] = useDebounce(searchInput, 300);

  // Calculate pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Active filters count
  const activeFiltersCount = [
    queryParam ? 1 : 0,
    categoryId ? 1 : 0,
    sort !== "newest" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

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

  const getSelectedCategoryName = () => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.name || null;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Our Products
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {totalProducts.toLocaleString()}{" "}
                {totalProducts === 1 ? "product" : "products"} found
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount} filter
                  {activeFiltersCount !== 1 ? "s" : ""} active
                </Badge>
              )}
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center gap-3 lg:hidden w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 w-9 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop View Mode Toggle */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 w-9 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Categories</h3>
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

              {/* Sort */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Sort By</h3>
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

              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
              >
                <FilterX className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-background p-6 shadow-lg overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Search</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Categories</h3>
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
                            {cat.name.charAt(0).toUpperCase() +
                              cat.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Sort By</h3>
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
                    onClick={() => {
                      handleClearFilters();
                      setShowMobileFilters(false);
                    }}
                    disabled={activeFiltersCount === 0}
                  >
                    <FilterX className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {(queryParam || categoryId) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {queryParam && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{queryParam}"
                    <button
                      onClick={() => setSearchInput("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ✕
                    </button>
                  </Badge>
                )}
                {categoryId && getSelectedCategoryName() && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {getSelectedCategoryName()}
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      ✕
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
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
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                <Search className="h-16 w-16 text-muted-foreground/60" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No products found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {queryParam || categoryId
                      ? "Try adjusting your search or filter criteria"
                      : "No products available at the moment"}
                  </p>
                </div>
                {(queryParam || categoryId) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
