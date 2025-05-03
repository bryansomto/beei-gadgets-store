"use client";

import useUser from "@/lib/userSession";
import { withTimeout } from "@/lib/withTimeout";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  }) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

interface ProductPreview {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, status } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart from db & localStorage with timeout
  useEffect(() => {
    const syncCart = async () => {
      try {
        setIsLoading(true);
        if (status === "authenticated") {
          const localCart = localStorage.getItem("cart");
          console.log("Local cart before sync:", localCart);
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                await fetch("/api/cart/merge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ guestItems: parsedCart }),
                });
                localStorage.removeItem("cart");
              } else {
                console.log("Local cart is empty; no merge necessary.");
              }
            } catch (err) {
              console.error("Failed to sync local cart:", err);
            }
          }

          const res = await fetch("/api/cart");
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error("Error syncing cart:", err);
        setError("Failed to load cart.");
      } finally {
        setIsLoading(false); // Ensure this is always called
      }
    };

    syncCart();
  }, [status]);

  // Save cart to localStorage with timeout
  useEffect(() => {
    if (isLoading) return;
    try {
      console.log("Saving to localStorage:", cartItems);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [cartItems, isLoading]);

  const addToCart = useCallback(
    async (product: ProductPreview) => {
      try {
        await withTimeout(
          new Promise<void>((resolve) => {
            setCartItems((prevItems) => {
              const existingItem = prevItems.find(
                (item) => item.productId === product._id
              );

              const newItems = existingItem
                ? prevItems.map((item) =>
                    item.productId === product._id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  )
                : [
                    ...prevItems,
                    {
                      productId: product._id,
                      price: product.price,
                      quantity: 1,
                      name: product.name,
                      image: product.images[0] || "",
                    },
                  ];

              // ✅ only sync to DB if logged in
              if (user) {
                syncCartToDB(newItems);
              }

              resolve();
              return newItems;
            });
          }),
          3000,
          "Add to cart operation timed out"
        );
      } catch (error) {
        console.error("Failed to add to cart:", error);
        setError("Failed to add item to cart");
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      try {
        await withTimeout(
          new Promise<void>((resolve) => {
            setCartItems((prevItems) => {
              resolve();
              const newItems = prevItems.filter(
                (item) => item.productId !== productId
              );

              // ✅ only sync to DB if logged in
              if (user) {
                syncCartToDB(newItems);
              }

              resolve();
              return newItems;
            });
          }),
          3000,
          "Remove from cart operation timed out"
        );
      } catch (error) {
        console.error("Failed to remove from cart:", error);
      }
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<void> => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      return new Promise<void>((resolve) => {
        setCartItems((prevItems) => {
          resolve();
          const newItems = prevItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          // ✅ only sync to DB if logged in
          if (user) {
            syncCartToDB(newItems);
          }

          resolve();
          return newItems;
        });
      });
    },
    [removeFromCart, user]
  );

  const clearCart = useCallback(async () => {
    return new Promise<void>((resolve) => {
      setCartItems([]);

      // ✅ only sync to DB if logged in
      if (user) {
        syncCartToDB([]);
      }
      resolve();
    });
  }, [user]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const syncCartToDB = useCallback(
    async (items: CartItem[]) => {
      if (user) {
        try {
          await fetch("/api/cart/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems: items }),
          });
        } catch (err) {
          console.error("Failed to sync cart to DB:", err);
        }
      }
    },
    [user]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
