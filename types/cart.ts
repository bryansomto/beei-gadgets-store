// types/cart.ts
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }
  
  export interface CartApiResponse {
    items: CartItem[];
    total: number;
  }