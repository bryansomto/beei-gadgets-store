// utils/cartStorage.ts
export const getGuestCart = () => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("guestCart") || "[]");
    } catch {
      return [];
    }
  };
  
  export const saveGuestCart = (cart: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  };
  
  export const clearGuestCart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("guestCart");
    }
  };
  