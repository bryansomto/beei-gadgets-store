// app/order/confirmation/[orderId]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck, Home, ArrowRight } from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderAddress {
  name: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  total: number;
  address: OrderAddress;
  paymentMethod: "debit_card" | "bank_transfer" | "call_rep";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/orders/${orderId}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.order || data;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

const OrderStatusBadge = ({ status }: { status: Order["status"] }) => {
  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const },
    confirmed: { label: "Confirmed", variant: "default" as const },
    shipped: { label: "Shipped", variant: "default" as const },
    delivered: { label: "Delivered", variant: "default" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };

  const config = statusConfig[status] ?? {
    label: status ?? "Unknown",
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className="text-sm">
      {config.label}
    </Badge>
  );
};

const PaymentMethodDisplay = ({
  method,
}: {
  method: Order["paymentMethod"];
}) => {
  const paymentMethods = {
    debit_card: "Debit Card",
    bank_transfer: "Bank Transfer",
    call_rep: "Phone Order",
  };

  return <span className="font-medium">{paymentMethods[method]}</span>;
};

const OrderTimeline = ({ status }: { status: Order["status"] }) => {
  const steps = [
    { key: "confirmed", label: "Order Confirmed", icon: CheckCircle },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Package },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index <= currentStepIndex;
        // const isCurrent = index === currentStepIndex;

        return (
          <div key={step.key} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <StepIcon className="h-5 w-5" />
            </div>
            <span
              className={`text-xs mt-2 ${
                isCompleted
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default async function OrderConfirmationPage(props: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await props.params; // ✅ await here
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-slate-50 dark:bg-zinc-900 min-h-screen">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Thank you for your purchase. Your order has been received.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Order #: {order.orderNumber}
          </span>
        </div>
      </div>

      {/* Order Timeline */}
      <OrderTimeline status={order.status} />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice((item.price * item.quantity).toFixed(2))}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.total.toFixed(2))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Shipping Information</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {order.address.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {order.address.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.address.phoneNumber}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-900 dark:text-gray-100">
                  {order.address.streetAddress}
                </p>
                <p className="text-muted-foreground">
                  {order.address.state}, {order.address.postalCode}
                </p>
                <p className="text-muted-foreground">{order.address.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Payment Information</h2>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method:</span>
                <PaymentMethodDisplay method={order.paymentMethod} />
              </div>
              {order.paymentMethod === "call_rep" && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our representative will contact you shortly to complete your
                    order.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Actions & Info */}
        <div className="space-y-6">
          {/* Order Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Order Actions</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100 "
              >
                <Link href="/products">
                  <Home className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full gap-2">
                <Link href="/orders">
                  View Order History
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Order Information</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {order.userEmail}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Need Help?</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                If you have any questions about your order, our customer service
                team is here to help.
              </p>
              <div className="space-y-2">
                <p className="font-medium">Customer Support</p>
                <p className="text-muted-foreground">
                  Email: support@beeigadgets.com
                </p>
                <p className="text-muted-foreground">
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">What&apos;s Next?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium mb-1">Order Processing</h4>
              <p className="text-muted-foreground">
                We&apos;ll prepare your items for shipping within 24 hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium mb-1">Shipping</h4>
              <p className="text-muted-foreground">
                You&apos;ll receive tracking information once your order ships.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium mb-1">Delivery</h4>
              <p className="text-muted-foreground">
                Expect your delivery within 3-5 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
