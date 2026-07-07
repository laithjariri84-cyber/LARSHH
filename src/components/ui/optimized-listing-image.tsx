import Image from "next/image";

import { cn } from "@/lib/utils";

type OptimizedListingImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

const DEFAULT_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw";

export function OptimizedListingImage({
  src,
  alt,
  className,
  priority = false,
  sizes = DEFAULT_SIZES,
}: OptimizedListingImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
