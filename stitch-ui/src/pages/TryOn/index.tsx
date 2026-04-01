import { Camera, Sparkles } from "lucide-react";

import { useStore } from "../../context/StoreContext";

export default function TryOn() {
  const { products } = useStore();
  const featured = products[0];

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Jewellery Preview</p>
        <h1 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary sm:text-[1.75rem]">Preview the placement</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          This mock screen is ready to connect to a real camera or AR workflow for jewellery preview later.
        </p>
      </div>

      <div className="mt-10 rounded-[32px] border border-primary/15 bg-ivory p-5">
        <div className="flex aspect-[4/5] items-center justify-center rounded-[24px] border border-dashed border-primary/20 bg-background-light">
          <div className="text-center">
            <Camera className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 text-sm text-muted">Camera preview placeholder</p>
          </div>
        </div>

        {featured ? (
          <div className="mt-5 rounded-[24px] bg-background-light p-4">
            <div className="flex items-center gap-4">
              <img src={featured.images[0]} alt={featured.name} className="h-20 w-16 rounded-[18px] object-cover" />
              <div>
                <p className="text-sm text-primary">{featured.name}</p>
                <p className="mt-1 text-sm text-muted">Suggested for preview</p>
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-xs uppercase tracking-[0.24em] text-ivory transition duration-300 hover:opacity-90">
              <Sparkles className="h-4 w-4" />
              Start preview
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
