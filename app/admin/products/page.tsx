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
import Swal from "sweetalert2";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    axios.get<Product[]>("/api/products").then((response) => {
      setProducts(response.data);
    });
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
    const result = await Swal.fire({
      title: `Delete "${product.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products?id=${product._id}`);
        fetchProducts();
        Swal.fire("Deleted!", `"${product.name}" has been deleted.`, "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete product.", "error");
      }
    }
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        {showForm && (
          <Card className="p-4 w-full lg:w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {selectedProduct ? "Edit Product" : "Add Product"}
              </h2>
              <Button size="sm" variant="ghost" onClick={handleFormClose}>
                Cancel
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
            <Button onClick={handleAddNew}>Add Product</Button>
          </div>

          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
