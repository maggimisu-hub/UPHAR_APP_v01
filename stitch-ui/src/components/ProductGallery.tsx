import { useState } from "react";

type MediaItem = {
  url: string;
  isVideo: boolean;
  displayOrder: number;
};

type ProductGalleryProps = {
  media?: MediaItem[];
  images?: string[]; // Legacy fallback
  alt: string;
};

export default function ProductGallery({ media, images, alt }: ProductGalleryProps) {
  // Derive a unified items list: prefer media if available, else legacy images
  const items: MediaItem[] =
    media && media.length > 0
      ? [...media].sort((a, b) => a.displayOrder - b.displayOrder)
      : (images ?? []).map((url, i) => ({ url, isVideo: false, displayOrder: i }));

  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  if (!items.length) {
    return (
      <div className="overflow-hidden rounded-sm border border-primary/10 bg-ivory flex items-center justify-center aspect-[4/5]">
        <span className="text-sm text-muted">No media</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main display */}
      <div className="overflow-hidden rounded-sm border border-primary/10 bg-ivory">
        {active?.isVideo ? (
          <video
            key={active.url}
            src={active.url}
            controls
            className="aspect-[4/5] w-full object-contain bg-black"
          />
        ) : (
          <img
            src={active?.url}
            alt={alt}
            className="aspect-[4/5] w-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {items.map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`overflow-hidden rounded-sm border relative ${
                activeIndex === idx ? "border-accent" : "border-primary/10"
              }`}
            >
              {item.isVideo ? (
                <div className="aspect-[4/5] w-full bg-primary/5 flex flex-col items-center justify-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/60"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  <span className="text-[9px] text-muted">Video</span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={alt}
                  className="aspect-[4/5] w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
