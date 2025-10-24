import { Suspense } from "react";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
