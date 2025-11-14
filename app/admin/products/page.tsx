"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ProductForm from "../components/ProductForm";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus, X, Package, Search } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDeleteItem } from "@/hooks/useDeleteItem";

interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price?: number;
  category?: string;
  properties?: Record<string, string>;
  stock?: number;
  createdAt?: string;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<{ products: Product[] }>(
        "/api/products"
      );
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const { handleDelete, isDeleting } = useDeleteItem({
    resource: "products",
    onDeleted: fetchProducts,
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleEdit(product: Product) {
    setSelectedProduct(product);
    setShowForm(true);
  }

  function handleFormClose() {
    setSelectedProduct(null);
    setShowForm(false);
    fetchProducts();
  }

  function handleAddNew() {
    setSelectedProduct(null);
    setShowForm(true);
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockBadgeVariant = (stock?: number) => {
    if (stock === undefined) return "outline";
    if (stock === 0) return "destructive";
    if (stock < 10) return "secondary";
    return "default";
  };

  const getStockText = (stock?: number) => {
    if (stock === undefined) return "N/A";
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return `Low (${stock})`;
    return `In Stock (${stock})`;
  };

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your product inventory and listings
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="gap-2 text-sm lg:text-base bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Product Form Sidebar */}
          {showForm && (
            <Card className="xl:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {selectedProduct ? (
                      <>
                        <Edit className="h-5 w-5" />
                        Edit Product
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Add Product
                      </>
                    )}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFormClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProductForm
                  {...(selectedProduct || {})}
                  price={selectedProduct?.price ?? 0}
                  onSave={handleFormClose}
                />
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card className={showForm ? "xl:col-span-1" : "xl:col-span-2"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Products
                <Badge variant="secondary" className="ml-2">
                  {filteredProducts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Product</TableHead>
                      <TableHead className="w-[120px]">Price</TableHead>
                      <TableHead className="w-[140px]">Stock</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-3 w-[150px]" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[60px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-[80px] rounded-full" />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <div className="space-y-2">
                            <p className="text-muted-foreground font-medium">
                              {searchQuery
                                ? "No products found"
                                : "No products yet"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {searchQuery
                                ? "Try adjusting your search criteria"
                                : "Create your first product to get started"}
                            </p>
                            {!searchQuery && (
                              <Button
                                onClick={handleAddNew}
                                className="mt-2 gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add Product
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow
                          key={product._id}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1 truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {product.description}
                                </div>
                              )}
                              {product.createdAt && (
                                <div className="text-xs text-muted-foreground">
                                  Added{" "}
                                  {new Date(
                                    product.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {product.price ? formatPrice(product.price) : "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStockBadgeVariant(product.stock)}
                              className="text-xs"
                            >
                              {getStockText(product.stock)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(product)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  handleDelete(product._id, product.name)
                                }
                                disabled={isDeleting === product._id}
                                className="h-8 w-8"
                              >
                                {isDeleting === product._id ? (
                                  <div className="animate-spin">
                                    <X className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
