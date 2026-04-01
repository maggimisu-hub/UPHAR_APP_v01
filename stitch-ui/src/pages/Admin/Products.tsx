import { useStore } from "../../context/StoreContext";
import { formatCollection, formatPrice } from "../../lib/format";

export default function AdminProducts() {
  const { products } = useStore();

  return (
    <div className="rounded-[28px] border border-primary/15 bg-ivory p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Products</p>
      <div className="mt-4 space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 border-b border-primary/10 pb-4 text-sm last:border-b-0">
            <div>
              <p className="text-primary">{product.name}</p>
              <p className="mt-1 text-muted">{formatCollection(product.category)}</p>
            </div>
            <span className="text-charcoal">{formatPrice(product.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
