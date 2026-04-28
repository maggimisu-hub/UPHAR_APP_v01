import { useParams } from "react-router-dom";
import ProductGrid from "../../components/ProductGrid";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { formatTaxonomy } from "../../lib/format";

export default function Shop() {
  const { collection, type } = useParams();
  const { products, getProductsByCollection, getProductsByType } = useStore();

  const filteredProducts = collection
    ? getProductsByCollection(collection as any)
    : type
    ? getProductsByType(type as any)
    : products;

  const title = collection
    ? `${formatTaxonomy(collection)} Collection`
    : type
    ? `${formatTaxonomy(type)}`
    : "All Jewellery";

  const subtitle = collection
    ? `Explore our curated ${collection} range.`
    : type
    ? `Browse our wide selection of ${type}.`
    : "Browse the complete Uphar collection.";

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Shop"
        title={title}
        body={subtitle}
      />
      <div className="mt-12">
        <ProductGrid products={filteredProducts} />
      </div>
    </section>
  );
}
