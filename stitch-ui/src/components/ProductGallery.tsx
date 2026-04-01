import { useState } from "react";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-sm border border-primary/10 bg-ivory">
        <img src={activeImage} alt={alt} className="aspect-[4/5] w-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setActiveImage(image)}
            className={`overflow-hidden rounded-sm border ${activeImage === image ? "border-accent" : "border-primary/10"}`}
          >
            <img src={image} alt={alt} className="aspect-[4/5] w-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </div>
  );
}
