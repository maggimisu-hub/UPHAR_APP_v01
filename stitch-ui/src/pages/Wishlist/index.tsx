import ProductGrid from "../../components/ProductGrid";
import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";

export default function Wishlist() {
  const { products, wishlist } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));

  return (
    <section className="container-shell py-16 sm:py-20">
      <SectionTitle
        eyebrow="Wishlist"
        title="Saved pieces."
        body="Keep a considered shortlist of jewellery you want to revisit before adding it to your order."
      />
      {items.length === 0 ? (
        <div className="mt-10 rounded-[32px] border border-dashed border-primary/20 bg-ivory p-8 text-center sm:p-12">
          <p className="text-[1.375rem] font-bold leading-[1.25] text-primary">No saved pieces yet.</p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Save jewellery here while you explore the collection.
          </p>
          <Button href="/shop" className="mt-8">
            Browse jewellery
          </Button>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={items} />
        </div>
      )}
    </section>
  );
}
