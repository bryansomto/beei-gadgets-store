export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN", // Modify the currency code based on your requirements
    }).format(price);
  }