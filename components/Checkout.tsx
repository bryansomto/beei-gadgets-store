"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import useUser from "@/lib/userSession";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define your form schema
const addressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
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
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      ))}
      <div className="pt-4 border-t">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    clearCart,
    isLoading: isCartLoading,
  } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      email: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  const [isAddressLoading, setIsAddressLoading] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue(
        "name",
        [user.firstName, user.lastName].filter(Boolean).join(" ")
      );
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  // Load saved address
  useEffect(() => {
    if (!user?.email) {
      setIsAddressLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        const { data } = await axios.get<AddressFormData>("/api/address");
        if (data) {
          reset(data); // Reset form with saved address data
        }
      } catch (err) {
        console.error("Failed to load address:", err);
      } finally {
        setIsAddressLoading(false);
      }
    };

    fetchAddress();
  }, [user, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Save address
      await axios.post("/api/address", {
        userEmail: user?.email,
        ...data,
      });

      // Create order
      const { data: order } = await axios.post("/api/orders", {
        userEmail: user?.email,
        items: cartItems,
        total: cartTotal,
        address: data,
      });

      // Clear cart
      await clearCart();

      // Redirect to confirmation
      router.push(`/order/${order._id}`);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Checkout failed:", err);
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Failed to complete checkout"
        );
      } else {
        toast.error("Failed to complete checkout");
      }
    }
  });

  if (isCartLoading || isAddressLoading) {
    return <CheckoutSkeleton />;
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button onClick={() => router.push("/products")}>
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
                <Label htmlFor="city">City</Label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input id="city" {...field} required />
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </div>

        <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
      </div>
    </div>
  );
}
