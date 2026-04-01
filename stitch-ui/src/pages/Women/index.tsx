import ProductGrid from "../../components/ProductGrid";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function Women() {
  const { getProductsByCategory } = useStore();
  const products = getProductsByCategory("women");

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Bridal Edit"
        title="Heirloom-inspired jewellery for wedding dressing."
        body="Explore necklace sets, festive earrings, and elegant bangles selected for bridal moments and family celebrations."
      />
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
