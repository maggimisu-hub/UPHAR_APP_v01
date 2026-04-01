import ProductGrid from "../../components/ProductGrid";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function Shop() {
  const { products } = useStore();

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="All Jewellery"
        title="Browse the complete Uphar collection."
        body="A calm ivory gallery of necklaces, bangles, earrings, and jewellery sets arranged for easy discovery."
      />
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
