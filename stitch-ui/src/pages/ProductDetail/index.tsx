import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Button from "../../components/Button";
import ProductGallery from "../../components/ProductGallery";
import ProductGrid from "../../components/ProductGrid";
import ProductPurchasePanel from "../../components/ProductPurchasePanel";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { getProductById, products } = useStore();
  const product = id ? getProductById(id) : undefined;

  const related = useMemo(
    () =>
      product
        ? products
            .filter((item) => item.category === product.category && item.id !== product.id)
            .slice(0, 4)
        : [],
    [product, products],
  );

  if (!product) {
    return (
      <div className="container-shell py-24 text-center">
        <h1 className="text-[1.75rem] font-bold leading-[1.25] text-primary">That piece could not be found.</h1>
        <p className="mt-4 text-sm leading-7 text-charcoal/80">
          The jewellery listing may have moved, or the link may no longer be available.
        </p>
        <div className="mt-8">
          <Button href="/">Return home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 lg:py-16">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <ProductGallery images={product.images} alt={product.name} />
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      <section className="pt-20">
        <div className="container-shell">
          <SectionTitle
            eyebrow="Related Jewellery"
            title="Complete the set."
            body="Related jewellery selected to complement this piece for gifting, ceremony, or festive dressing."
          />
          <div className="mt-12">
            <ProductGrid products={related} />
          </div>
        </div>
      </section>
    </div>
  );
}
