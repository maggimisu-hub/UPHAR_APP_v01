import ProductGrid from "../../components/ProductGrid";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function Men() {
  const { getProductsByCategory } = useStore();
  const products = getProductsByCategory("men");

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Festive Edit"
        title="Wedding and ceremonial jewellery with presence."
        body="A focused edit of chokers, statement earrings, and bridal bangles selected for ceremony and celebration."
      />
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
