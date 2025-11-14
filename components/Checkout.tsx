"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import { Loader2, Phone, CreditCard, Banknote } from "lucide-react";
import { toast } from "react-hot-toast";
import useUser from "@/lib/userSession";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { phoneSchema } from "@/lib/phoneSchema";
import { formatPrice } from "@/lib/formatPrice";
import Script from "next/script";

// Define your form schema
const addressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: phoneSchema,
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

type PaymentMethod = "debit_card" | "bank_transfer" | "call_rep";

const CheckoutSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4">
    <Skeleton className="h-9 w-48 mb-6" />
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
        <div className="pt-4 space-y-2">
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  </div>
);

const OrderSummary = ({
  cartItems,
  cartTotal,
}: {
  cartItems: CartItem[];
  cartTotal: number;
}) => (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">Order Summary</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      {cartItems.map((item) => (
        <div
          key={item.productId}
          className="flex justify-between pb-2 border-b"
        >
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Qty: {item.quantity}
            </p>
          </div>
          <div className="font-medium">
            {formatPrice((item.price * item.quantity).toFixed(2))}
          </div>
        </div>
      ))}
      <div className="pt-4 border-t">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(cartTotal.toFixed(2))}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Check if current time is within work hours (9 AM to 5 PM)
const isWithinWorkHours = () => {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 9 && hours < 17;
};

export default function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    clearCart,
    isLoading: isCartLoading,
  } = useCart();
  const {
    user,
    loading: isUserLoading,
    authenticated: isAuthenticated,
  } = useUser();
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isWorkHours, setIsWorkHours] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const [isAddressLoading, setIsAddressLoading] = useState(true);

  // Check work hours on component mount
  useEffect(() => {
    setIsWorkHours(isWithinWorkHours());
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isUserLoading, isAuthenticated, router]);

  useEffect(() => {
    const initializeForm = async () => {
      if (!user?.email) return;

      try {
        // Fetch existing address (if any)
        const { data: addressData } = await axios.get<AddressFormData>(
          "/api/address",
          {
            params: { userEmail: user.email },
          }
        );

        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ");

        // Combine fetched address and fallback to user info
        const initialValues: AddressFormData = {
          name: addressData?.name || fullName || "",
          email: addressData?.email || user.email || "",
          phone: addressData?.phone || "",
          streetAddress: addressData?.streetAddress || "",
          city: addressData?.city || "",
          state: addressData?.state || "",
          postalCode: addressData?.postalCode || "",
          country: addressData?.country || "",
        };

        reset(initialValues);
      } catch (err) {
        console.error("Failed to load address:", err);
      } finally {
        setIsAddressLoading(false);
      }
    };

    initializeForm();
  }, [user, reset]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const verifyPaymentWithServer = async (
    reference: string,
    orderId: string
  ) => {
    const verifyingToast = toast.loading("Verifying payment...");

    try {
      const verifyRes = await axios.post("/api/payment/paystack/verify", {
        reference,
        orderId,
      });

      if (verifyRes.data.success) {
        toast.dismiss(verifyingToast);
        toast.success("Payment verified! 🎉");
        await clearCart();
        router.push(`/orders/confirmation/${orderId}`);
      } else {
        toast.dismiss(verifyingToast);
        toast.error(verifyRes.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.dismiss(verifyingToast);
      toast.error("Unable to verify payment. Please contact support.");
    }
  };

  const processOrder = async (
    paymentMethod: PaymentMethod,
    data: AddressFormData
  ) => {
    if (!user?.email) {
      toast.error("Please sign in to complete your order");
      return;
    }

    try {
      // Save address
      await axios.post("/api/address", {
        userEmail: user.email,
        ...data,
      });

      // Create order
      const { data: orderData } = await axios.post("/api/checkout", {
        userEmail: user.email,
        userName: data.name,
        items: cartItems,
        total: cartTotal,
        address: data,
        paymentMethod,
      });

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      if (paymentMethod === "debit_card" || paymentMethod === "bank_transfer") {
        // Ensure Paystack is loaded
        if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
          toast.error("Payment configuration error. Please contact support.");
          return;
        }

        // Check if PaystackPop exists
        if (typeof window === "undefined" || !window.PaystackPop) {
          toast.error(
            "Payment system not loaded. Please refresh and try again."
          );
          return;
        }

        const paystack = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: data.email,
          amount: cartTotal * 100,
          ref: orderData.reference,
          currency: "NGN",
          callback: function (response: { reference: string }) {
            // ✅ Must be a plain function — not async
            console.log("Payment success response:", response);

            // Use an async IIFE inside to allow async/await safely
            (async () => {
              try {
                await verifyPaymentWithServer(
                  response.reference,
                  orderData.orderId
                );
              } catch (error) {
                console.error("Payment verification failed:", error);
                toast.error(
                  "Could not verify payment. Please contact support."
                );
              }
            })();
          },
          onClose: function () {
            toast.error("Payment window closed before completion.");
          },
        });

        // ✅ Use openIframe, not chargeCustomer
        paystack.openIframe();
      } else if (paymentMethod === "call_rep") {
        router.push(`/orders/confirmation/${orderData.orderId}`);
        toast.success(
          "Order placed successfully! Our representative will call you shortly."
        );
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to complete checkout"
          : "Failed to complete checkout"
      );
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    await processOrder(selectedPaymentMethod, data);
  });

  if (isCartLoading || isAddressLoading) {
    return <CheckoutSkeleton />;
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button
          onClick={() => router.push("/products")}
          className="text-sm lg:text-base gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Shipping Address Form */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <>
                    <Input id="name" {...field} required />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <>
                    <Input id="email" type="email" {...field} required />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <Input id="phone" {...field} required />
                    {errors.phone && (
                      <p className="text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Controller
                name="streetAddress"
                control={control}
                render={({ field }) => (
                  <>
                    <Input id="streetAddress" {...field} required />
                    {errors.streetAddress && (
                      <p className="text-sm text-red-500">
                        {errors.streetAddress.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">City</Label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input id="state" {...field} required />
                      {errors.city && (
                        <p className="text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input id="state" {...field} required />
                      {errors.state && (
                        <p className="text-sm text-red-500">
                          {errors.state.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input id="postalCode" {...field} required />
                      {errors.postalCode && (
                        <p className="text-sm text-red-500">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input id="country" {...field} required />
                      {errors.country && (
                        <p className="text-sm text-red-500">
                          {errors.country.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Payment Method</h3>

              <RadioGroup
                value={selectedPaymentMethod || ""}
                onValueChange={(value) =>
                  handlePaymentMethodSelect(value as PaymentMethod)
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="debit_card" id="debit_card" />
                  <Label
                    htmlFor="debit_card"
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Pay with Debit Card</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label
                    htmlFor="bank_transfer"
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <Banknote className="h-5 w-5" />
                    <span>Bank Transfer</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <RadioGroupItem
                    value="call_rep"
                    id="call_rep"
                    disabled={!isWorkHours}
                  />
                  <Label
                    htmlFor="call_rep"
                    className={`flex items-center space-x-2 cursor-pointer flex-1 ${
                      !isWorkHours ? "opacity-50" : ""
                    }`}
                  >
                    <Phone className="h-5 w-5" />
                    <div>
                      <span>Call to Place Order</span>
                      {!isWorkHours && (
                        <p className="text-sm text-muted-foreground">
                          Available 9 AM - 5 PM
                        </p>
                      )}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Method Buttons */}
            <div className="space-y-3 pt-4">
              {selectedPaymentMethod === "debit_card" && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay with Debit Card
                    </>
                  )}
                </Button>
              )}

              {selectedPaymentMethod === "bank_transfer" && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="h-4 w-4" />
                      Proceed to Bank Transfer
                    </>
                  )}
                </Button>
              )}

              {selectedPaymentMethod === "call_rep" && (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isWorkHours}
                  className="text-xs sm:text-sm lg:text-base w-full gap-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-gray-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Request Call Back
                    </>
                  )}
                </Button>
              )}
            </div>
            <Script
              src="https://js.paystack.co/v1/inline.js"
              strategy="afterInteractive"
            />
          </form>
        </div>

        <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
      </div>
    </div>
  );
}
