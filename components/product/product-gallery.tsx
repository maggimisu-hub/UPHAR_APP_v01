"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-white">
        <Image src={activeImage} alt={alt} width={1200} height={1500} className="aspect-[4/5] h-auto w-full object-cover" priority />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setActiveImage(image)}
            className={cn(
              "overflow-hidden rounded-2xl border border-transparent bg-white",
              activeImage === image && "border-ink",
            )}
          >
            <Image src={image} alt={alt} width={300} height={375} className="aspect-[4/5] h-auto w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

