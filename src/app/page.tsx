import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { isUiOnlyMode } from "@/lib/ui-only";

export default async function HomePage() {
  if (isUiOnlyMode()) {
    redirect("/intelligence");
  }

  const user = await getUser();

  redirect(user ? "/intelligence" : "/login");
}
