import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoadingBrand } from "@/components/layout/loading-brand";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingBrand />}>
      <LoginForm />
    </Suspense>
  );
}
