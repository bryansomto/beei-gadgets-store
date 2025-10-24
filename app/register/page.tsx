import { Suspense } from "react";
import RegisterPageClient from "./RegisterPageClient";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
