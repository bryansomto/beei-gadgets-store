"use client";

import React, { useEffect, useState } from "react";
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
import { Check, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatPrice";

// --- Interfaces ---
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderAddress {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  postalCode: string;
  streetAddress: string;
  country: string;
}

interface Order {
  _id: string;
  id: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: string;
  paid: boolean;
  address: OrderAddress;
  createdAt: string;
  updatedAt: string;
  createdAtFormatted?: string;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Order[]>("/api/orders");

      // Validate and ensure each order has a proper ID
      const validatedOrders = data.map((order) => ({
        ...order,
        _id:
          order._id ||
          order.id ||
          `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));

      setOrders(validatedOrders);
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

  async function toggleOrderStatus(orderId: string, currentPaid: boolean) {
    if (!orderId) {
      console.error("Cannot toggle status: orderId is undefined");
      return;
    }

    try {
      setUpdatingOrder(orderId);
      const newPaidStatus = !currentPaid;
      const newStatus = newPaidStatus ? "processing" : "pending";

      await axios.put("/api/orders", {
        orderId,
        paid: newPaidStatus,
        status: newStatus,
      });

      toast({
        title: "Success",
        description: `Order marked as ${newPaidStatus ? "paid" : "unpaid"}`,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, paid: newPaidStatus, status: newStatus }
            : order
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

  const toggleOrderExpand = (orderId: string) => {
    if (!orderId) {
      console.error("Cannot expand: orderId is undefined");
      return;
    }

    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const isOrderExpanded = (orderId: string) => {
    return orderId ? expandedOrders.has(orderId) : false;
  };

  const getOrderId = (order: Order): string => {
    return (
      order._id || order.id || `fallback-${order.createdAt}-${order.userEmail}`
    );
  };

  const OrderStatusBadge = ({
    paid,
    status,
  }: {
    paid: boolean;
    status: string;
  }) => (
    <Badge
      variant={paid ? "default" : "secondary"}
      className={`flex items-center gap-1 w-fit ${
        paid
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-red-100 text-red-800 hover:bg-red-100"
      }`}
    >
      {paid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </Badge>
  );

  const MobileOrderCard = ({ order }: { order: Order }) => {
    const orderId = getOrderId(order);

    return (
      <Card className="p-4 mb-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "Unknown Date"}
              </p>
              <p className="font-medium">
                {order.address?.name || "Unknown Customer"}
              </p>
            </div>
            <OrderStatusBadge paid={order.paid} status={order.status} />
          </div>

          {/* Order Items Preview */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Items:</p>
            {order.items?.slice(0, 2).map((item, index) => (
              <p
                key={item.productId || `item-${index}`}
                className="text-sm text-muted-foreground"
              >
                {item.name} × {item.quantity}
              </p>
            ))}
            {order.items && order.items.length > 2 && (
              <p className="text-sm text-muted-foreground">
                +{order.items.length - 2} more items
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {formatPrice(order.total?.toFixed(2) || "0.00")}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleOrderStatus(orderId, order.paid)}
                disabled={updatingOrder === orderId || !orderId}
              >
                {updatingOrder === orderId ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : order.paid ? (
                  "Mark Unpaid"
                ) : (
                  "Mark Paid"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleOrderExpand(orderId)}
                disabled={!orderId}
              >
                {isOrderExpanded(orderId) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          {isOrderExpanded(orderId) && (
            <div className="pt-3 border-t space-y-3">
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm text-muted-foreground">
                  {order.address?.email || "No email"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.address?.phone || "No phone"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Shipping Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.address?.streetAddress || "No address"},{" "}
                  {order.address?.city || ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.address?.state || ""},{" "}
                  {order.address?.postalCode || ""},{" "}
                  {order.address?.country || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">All Items</p>
                {order.items?.map((item, index) => (
                  <div
                    key={item.productId || `item-${index}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      {formatPrice((item.price * item.quantity).toFixed(2))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const DesktopOrderRow = ({ order }: { order: Order }) => {
    const orderId = getOrderId(order);

    return (
      <React.Fragment key={orderId}>
        <TableRow
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => toggleOrderExpand(orderId)}
        >
          <TableCell className="whitespace-nowrap">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "Unknown Date"}
            <br />
            <span className="text-xs text-muted-foreground">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString()
                : ""}
            </span>
          </TableCell>

          <TableCell>
            <OrderStatusBadge paid={order.paid} status={order.status} />
          </TableCell>

          <TableCell>
            <div className="space-y-1 min-w-0">
              <p className="font-medium truncate">
                {order.address?.name || "Unknown Customer"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {order.address?.email || "No email"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {order.address?.city || ""}, {order.address?.state || ""}
              </p>
            </div>
          </TableCell>

          <TableCell>
            <div className="space-y-1 max-w-[200px]">
              {order.items?.slice(0, 2).map((item, index) => (
                <p
                  key={item.productId || `item-${index}`}
                  className="text-sm truncate"
                >
                  {item.name} × {item.quantity}
                </p>
              ))}
              {order.items && order.items.length > 2 && (
                <p className="text-sm text-muted-foreground">
                  +{order.items.length - 2} more
                </p>
              )}
            </div>
          </TableCell>

          <TableCell className="text-right font-medium">
            {formatPrice(order.total?.toFixed(2) || "0.00")}
          </TableCell>

          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrderStatus(orderId, order.paid);
                }}
                disabled={updatingOrder === orderId || !orderId}
              >
                {updatingOrder === orderId ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : order.paid ? (
                  "Unpay"
                ) : (
                  "Pay"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrderExpand(orderId);
                }}
                disabled={!orderId}
              >
                {isOrderExpanded(orderId) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {/* Expanded Row for Desktop */}
        {isOrderExpanded(orderId) && (
          <TableRow className="bg-muted/30">
            <TableCell colSpan={6} className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items Details */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div
                        key={item.productId || `item-${index}`}
                        className="flex justify-between items-center p-2 bg-background rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(item.price.toFixed(2))}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(
                              (item.price * item.quantity).toFixed(2)
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer & Shipping Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {order.address?.name || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {order.address?.email || "No email"}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {order.address?.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      <p>{order.address?.streetAddress || "No address"}</p>
                      <p>
                        {order.address?.city || ""},{" "}
                        {order.address?.state || ""}{" "}
                        {order.address?.postalCode || ""}
                      </p>
                      <p>{order.address?.country || ""}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Items Total:</span>
                        <span>
                          {formatPrice(order.total?.toFixed(2) || "0.00")}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Grand Total:</span>
                        <span>
                          {formatPrice(order.total?.toFixed(2) || "0.00")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <Layout requiresAuth>
      <div className="container mx-auto p-4 max-w-7xl">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Orders</h1>
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={`mobile-skeleton-${i}`} className="p-4 mb-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </Card>
              ))
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              orders.map((order) => (
                <MobileOrderCard key={getOrderId(order)} order={order} />
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="rounded-lg border shadow-sm overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[200px]">Customer</TableHead>
                    <TableHead className="min-w-[180px]">Products</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Total
                    </TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px] ml-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-20" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <DesktopOrderRow key={getOrderId(order)} order={order} />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
