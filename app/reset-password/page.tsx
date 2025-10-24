import { Suspense } from "react";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
