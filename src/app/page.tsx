import { redirect } from "next/navigation";

import { rscTry } from "@/lib/rsc-debug";
import { isUiOnlyMode } from "@/lib/ui-only";

export default async function HomePage() {
  if (isUiOnlyMode()) {
    redirect("/intelligence");
  }

  const user = await rscTry("home/page:getUser", async () => {
    const { getUser } = await import("@/lib/auth");
    return getUser();
  });

  redirect(user ? "/intelligence" : "/login");
}
