"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
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
import { Check, X, RefreshCw } from "lucide-react";

interface OrderItem {
  price_data?: {
    product_data?: {
      name: string;
    };
  };
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  paid: boolean;
  name: string;
  email: string;
  city: string;
  postalCode: string;
  country: string;
  streetAddress: string;
  line_items: OrderItem[];
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Order[]>("/api/orders");
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleOrderStatus(orderId: string, currentStatus: boolean) {
    try {
      setUpdatingOrder(orderId);
      const newStatus = !currentStatus;

      await axios.put("/api/orders", {
        OrderId: orderId,
        orderStatus: newStatus,
      });

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus ? "paid" : "unpaid"}`,
      });

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, paid: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <Layout requiresAuth>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.paid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={
                            order.paid ? "text-green-600" : "text-red-600"
                          }
                        >
                          {order.paid ? "Paid" : "Unpaid"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleOrderStatus(order._id, order.paid)
                          }
                          disabled={updatingOrder === order._id}
                          className="ml-2"
                        >
                          {updatingOrder === order._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            "Toggle"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{order.name}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                        <p className="text-sm">
                          {order.streetAddress}, {order.city},{" "}
                          {order.postalCode}, {order.country}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.line_items.map((item, index) => (
                          <p key={index} className="text-sm">
                            {item.price_data?.product_data?.name ||
                              "Unknown product"}{" "}
                            × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Layout>
  );
}
