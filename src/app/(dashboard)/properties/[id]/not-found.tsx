import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="bg-card max-w-md rounded-xl border px-8 py-10 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <Building2 className="text-muted-foreground size-7" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Property not found
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This property may have been removed or the link is incorrect.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/search">
            <ArrowLeft className="size-4" />
            Back to search
          </Link>
        </Button>
      </div>
    </div>
  );
}
