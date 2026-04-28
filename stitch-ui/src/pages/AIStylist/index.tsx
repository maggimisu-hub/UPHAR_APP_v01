import { useMemo, useState } from "react";

import ProductCard from "../../components/ProductCard";
import { useStore } from "../../context/StoreContext";

const moods = [
  { label: "Bridal ceremony", collections: ["bridal"] as const, types: [] as string[] },
  { label: "Festive evening", collections: ["festive"] as const, types: [] as string[] },
  { label: "Gift edit", collections: [] as string[], types: ["bangles", "cosmetics"] },
];

export default function AIStylist() {
  const { products } = useStore();
  const [selectedMood, setSelectedMood] = useState(moods[0].label);

  const recommendations = useMemo(() => {
    const mood = moods.find((item) => item.label === selectedMood);
    if (!mood) return [];

    return products
      .filter((product) => {
        if (mood.collections.length > 0) {
          return (mood.collections as string[]).includes(product.product_collection);
        }
        if (mood.types.length > 0) {
          return mood.types.includes(product.product_type);
        }
        return false;
      })
      .slice(0, 3);
  }, [products, selectedMood]);

  return (
    <section className="container-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Jewellery Concierge</p>
        <h1 className="mt-3 text-[1.375rem] font-bold leading-[1.25] text-primary sm:text-[1.75rem]">Curated guidance</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Pick an occasion and receive a matching Uphar edit from the current collection.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => setSelectedMood(mood.label)}
            className={`rounded-sm px-4 py-3 text-xs uppercase tracking-[0.24em] transition duration-300 ${
              selectedMood === mood.label
                ? "bg-accent text-ivory"
                : "border border-primary/15 bg-ivory text-primary hover:border-accent"
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
