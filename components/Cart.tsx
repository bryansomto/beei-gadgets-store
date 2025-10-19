"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";

export function Cart() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    syncCartToDB,
  } = useCart();

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Cart ({cartCount})</h2>
        {cartCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}
      </div>

      {cartCount === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <X className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Your cart is empty
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 80px, 96px"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-9 md:w-9"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium text-sm md:text-base">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 md:h-9 md:w-9"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>

                {/* Item Total & Remove */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="font-semibold text-sm md:text-base whitespace-nowrap">
                    {formatPrice((item.price * item.quantity).toFixed(2))}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      if (syncCartToDB && cartItems.length > 0) {
                        await syncCartToDB(cartItems);
                      }
                      await removeFromCart(item.productId);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Shipping & taxes calculated at checkout</span>
            </div>

            <div className="space-y-3">
              <Button className="w-full h-12 text-base font-semibold" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
