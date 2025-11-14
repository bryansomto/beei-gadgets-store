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
  useRef,
} from "react";
import { CartItem } from "@/types/cart";
import { useToast } from "@/components/ui/use-toast";

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
  syncCartToDB: (items: CartItem[]) => Promise<void>;
}

interface ProductPreview {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedItems = useRef<CartItem[]>([]);
  const { user, status } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const syncCartToDB = useCallback(
    async (items: CartItem[]): Promise<void> => {
      if (!user || items.length === 0) return;

      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }

      syncTimeout.current = setTimeout(() => {
        (async () => {
          try {
            const deduplicated = Object.values(
              items.reduce<Record<string, CartItem>>((acc, item) => {
                if (acc[item.productId]) {
                  acc[item.productId].quantity += item.quantity;
                } else {
                  acc[item.productId] = { ...item };
                }
                return acc;
              }, {})
            );

            const shouldSync =
              JSON.stringify(deduplicated) !==
              JSON.stringify(lastSyncedItems.current);

            if (shouldSync) {
              await fetch("/api/cart/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItems: deduplicated }),
              });

              lastSyncedItems.current = deduplicated;
            }
          } catch (err) {
            console.error("Debounced sync failed:", err);
          }
        })();
      }, 500);

      return Promise.resolve(); // explicitly return a resolved Promise
    },
    [user]
  );

  useEffect(() => {
    return () => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
    };
  }, []);

  useEffect(() => {
    const syncCart = async () => {
      try {
        setIsLoading(true);
        if (status === "authenticated") {
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                const deduplicated = Object.values(
                  parsedCart.reduce<Record<string, CartItem>>((acc, item) => {
                    if (acc[item.productId]) {
                      acc[item.productId].quantity += item.quantity;
                    } else {
                      acc[item.productId] = { ...item };
                    }
                    return acc;
                  }, {})
                );

                await fetch("/api/cart/merge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ guestItems: deduplicated }),
                });
                localStorage.removeItem("cart");
              }
            } catch (err) {
              console.error("Failed to sync local cart:", err);
            }
          }
          const res = await fetch("/api/cart");
          if (!res.ok) throw new Error("Failed to fetch cart");

          const data = await res.json();

          // Ensure the response matches our expected type
          if (data && Array.isArray(data.items)) {
            setCartItems(
              data.items.map(
                (item: {
                  productId: string;
                  name: string;
                  price: number;
                  image: string;
                  quantity: number;
                }): CartItem => ({
                  productId: item.productId,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  quantity: item.quantity,
                })
              )
            );
          } else {
            setCartItems([]);
          }
        }
      } catch (err) {
        console.error("Error syncing cart:", err);
        setError("Failed to load cart.");
      } finally {
        setIsLoading(false);
      }
    };

    syncCart();
  }, [status]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  }, [cartItems, isLoading]);

  const addToCart = useCallback(
    async (product: ProductPreview) => {
      try {
        let newItems: CartItem[] = [];

        await withTimeout(
          new Promise<void>((resolve) => {
            setCartItems((prevItems) => {
              const existingItemIndex = prevItems.findIndex(
                (item) => item.productId === product._id
              );

              if (existingItemIndex !== -1) {
                newItems = [...prevItems];
                newItems[existingItemIndex] = {
                  ...newItems[existingItemIndex],
                  quantity: newItems[existingItemIndex].quantity + 1,
                };
              } else {
                newItems = [
                  ...prevItems,
                  {
                    productId: product._id,
                    price: product.price,
                    quantity: 1,
                    name: product.name,
                    image: product.images[0] || "",
                  },
                ];
              }

              resolve();
              return newItems;
            });
          }),
          3000,
          "Add to cart operation timed out"
        );
        toast({
          title: "Success",
          description: `${product.name} added to cart.`,
        });

        await syncCartToDB(newItems);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        setError("Failed to add item to cart");
      }
    },
    [syncCartToDB]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      try {
        await withTimeout(
          new Promise<void>((resolve) => {
            setCartItems((prevItems) => {
              const newItems = prevItems.filter(
                (item) => item.productId !== productId
              );

              (async () => {
                await syncCartToDB(newItems);
                resolve();
              })();

              return newItems;
            });
          }),
          3000,
          "Remove from cart operation timed out"
        );
        toast({
          title: "Success",
          description: "Item removed from cart.",
        });
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        setError("Failed to remove item from cart");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove item from cart.",
        });
      }
    },
    [syncCartToDB]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      await new Promise<void>((resolve) => {
        setCartItems((prevItems) => {
          const newItems = prevItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          (async () => {
            await syncCartToDB(newItems);
            resolve();
          })();

          return newItems;
        });
      });
    },
    [removeFromCart, syncCartToDB]
  );

  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      localStorage.removeItem("cart");

      if (user) {
        await fetch("/api/cart/clear", {
          method: "DELETE",
        });
      }
      toast({
        title: "Success",
        description: `Cart cleared`,
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      setError("Failed to clear cart");
    }
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
        syncCartToDB,
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
