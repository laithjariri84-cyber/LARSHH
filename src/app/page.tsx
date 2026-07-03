import { redirect } from "next/navigation";

import { isUiOnlyMode } from "@/lib/ui-only";

export default async function HomePage() {
  if (isUiOnlyMode()) {
    redirect("/intelligence");
  }

  const { getUser } = await import("@/lib/auth");
  const user = await getUser();
  redirect(user ? "/intelligence" : "/login");
}
