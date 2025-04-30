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

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage with timeout
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await withTimeout(
          Promise.resolve(localStorage.getItem("cart")),
          2000, // 2 second timeout for localStorage read
          "Loading cart timed out"
        );

        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Optionally initialize with empty cart or error state
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage with timeout
  useEffect(() => {
    if (isLoading) return;

    const saveCart = async () => {
      try {
        await withTimeout(
          Promise.resolve(
            localStorage.setItem("cart", JSON.stringify(cartItems))
          ),
          2000, // 2 second timeout for localStorage write
          "Saving cart timed out"
        );
      } catch (error) {
        console.error("Failed to save cart:", error);
        // Optionally implement retry logic here
      }
    };

    saveCart();
  }, [cartItems, isLoading]);

  const addToCart = async (product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  }) => {
    if (!user) {
      router.push("/login?returnUrl=/products");
      return;
    }

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
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    quantity: 1,
                  },
                ];

            resolve();
            return newItems;
          });
        }),
        3000, // 3 second timeout for cart operation
        "Add to cart operation timed out"
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Optionally show error to user
    }
  };

  // Similar implementation for other operations
  const removeFromCart = async (productId: string) => {
    try {
      await withTimeout(
        new Promise<void>((resolve) => {
          setCartItems((prevItems) => {
            resolve();
            return prevItems.filter((item) => item.productId !== productId);
          });
        }),
        3000,
        "Remove from cart operation timed out"
      );
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number
  ): Promise<void> => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    return new Promise<void>((resolve) => {
      setCartItems((prevItems) => {
        resolve();
        return prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      });
    });
  };

  const clearCart = async () => {
    return new Promise<void>((resolve) => {
      setCartItems([]);
      resolve();
    });
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error: null, // You can add error state if needed
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
