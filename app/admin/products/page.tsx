"use client";

import { useEffect, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus, X } from "lucide-react";
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

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Product[]>("/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

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

  async function handleDelete(product: Product) {
    try {
      setIsDeleting(product._id);
      const confirmed = await confirmDelete(product.name);

      if (confirmed) {
        await axios.delete(`/api/products?id=${product._id}`);
        toast({
          title: "Success",
          description: `"${product.name}" deleted successfully`,
        });
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  async function confirmDelete(productName: string): Promise<boolean> {
    return new Promise((resolve) => {
      toast({
        title: `Delete "${productName}"?`,
        description: "This action cannot be undone.",
        action: (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resolve(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                resolve(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      });
    });
  }

  return (
    <Layout requiresAuth>
      <div className="flex flex-col lg:flex-row gap-6">
        {showForm && (
          <Card className="p-4 w-full lg:w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedProduct ? "Edit Product" : "Add Product"}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFormClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ProductForm
              {...(selectedProduct || {})}
              price={selectedProduct?.price ?? 0}
              onSave={handleFormClose}
            />
          </Card>
        )}

        <Card className="p-4 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">All Products</h2>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.price ? `${formatPrice(product.price)}` : "-"}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting === product._id}
                        >
                          {isDeleting === product._id ? (
                            <div className="animate-spin">
                              <X className="h-4 w-4" />
                            </div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
