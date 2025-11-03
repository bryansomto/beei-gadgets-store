"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Package,
  Eye,
  Calendar,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const },
  confirmed: { label: "Confirmed", variant: "default" as const },
  shipped: { label: "Shipped", variant: "default" as const },
  delivered: { label: "Delivered", variant: "success" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

const OrderStatusBadge = ({ status }: { status: Order["status"] }) => {
  const config = statusConfig[status] ?? {
    label: status ?? "Unknown",
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders/user", {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          console.error("Failed to fetch orders");
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.items?.some((item) => item.name.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: number | string, bValue: number | string;

      if (sortBy === "date") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.total;
        bValue = b.total;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: "date" | "total") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 dark:bg-zinc-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Order History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t placed any orders yet. Start shopping to see your
              order history here.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("total")}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No orders found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium truncate">
                              {order.items[0]?.name}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.items.length - 1} more item(s)
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.total.toFixed(2))}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/orders/confirmation/${order._id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {orders.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter((o) => o.status === "shipped").length}
                </p>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {
                    orders.filter(
                      (o) => o.status === "pending" || o.status === "confirmed"
                    ).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
