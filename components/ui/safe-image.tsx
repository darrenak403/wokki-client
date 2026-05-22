"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/lib/utils/format-image-url";

export type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const resolved = formatImageUrl(src ?? undefined);

  if (!resolved || error) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-xs",
          className,
          fallbackClassName
        )}
      >
        {alt?.slice(0, 2)?.toUpperCase() || "—"}
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
