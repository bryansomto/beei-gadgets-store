import { Suspense } from "react";
import CartPageClient from "./CartPageClient";

export default function CartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CartPageClient />
    </Suspense>
  );
}
