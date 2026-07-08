import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { isUiOnlyMode } from "@/lib/ui-only";

export default async function HomePage() {
  if (isUiOnlyMode()) {
    redirect("/dashboard");
  }

  const user = await getUser();

  redirect(user ? "/dashboard" : "/login");
}
