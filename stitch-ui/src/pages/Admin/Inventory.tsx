import { useState, useEffect } from "react";

import { productService, type StorefrontProduct } from "../../services/productService";
import { adminInventoryService } from "../../services/adminInventoryService";
import Button from "../../components/Button";

export default function AdminInventory() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [localStock, setLocalStock] = useState<Record<string, number>>({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleStockChange = (variantId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setLocalStock((prev) => ({ ...prev, [variantId]: num }));
    } else if (value === "") {
      setLocalStock((prev) => ({ ...prev, [variantId]: 0 }));
    }
  };

  const currentStockFor = (variantId: string, originalStock: number) => {
    return localStock[variantId] !== undefined ? localStock[variantId] : originalStock;
  };

  const handleUpdate = async (variantId: string) => {
    const newStock = localStock[variantId];
    if (newStock === undefined) return;

    setUpdatingId(variantId);
    setErrorId(null);
    setSuccessId(null);

    try {
      await adminInventoryService.updateInventoryStock(variantId, newStock);
      setSuccessId(variantId);
      
      // Update local state and products list to reflect newly saved stock
      setProducts(current => current.map(p => ({
        ...p,
        variants: p.variants.map(v => v.id === variantId ? { ...v, stock: newStock } : v)
      })));
      setLocalStock((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      setErrorId(variantId);
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-[28px] border border-primary/15 bg-ivory p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Inventory</p>
        <Button 
          type="button" 
          variant="secondary" 
          className="px-3 py-1 text-[10px]" 
          onClick={() => void loadProducts()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {loading && products.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Loading inventory...</p>
      ) : products.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No products found.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {products.map((product) => (
            <div key={product.id} className="border-b border-primary/10 pb-6 last:border-b-0">
              <div className="mb-3">
                <p className="font-medium text-primary">{product.name}</p>
              </div>
              
              <div className="space-y-3 pl-4">
                {product.variants.map((variant) => {
                  const displayStock = currentStockFor(variant.id, variant.stock);
                  const isUpdating = updatingId === variant.id;
                  const hasError = errorId === variant.id;
                  const hasSuccess = successId === variant.id;
                  const hasChanges = localStock[variant.id] !== undefined && localStock[variant.id] !== variant.stock;

                  return (
                    <div key={variant.id} className="flex flex-wrap items-center justify-between gap-4 rounded-sm bg-background-light p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal">{variant.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-mono">{variant.id}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted">Stock:</label>
                          <input
                            type="number"
                            min="0"
                            value={displayStock}
                            onChange={(e) => handleStockChange(variant.id, e.target.value)}
                            className="w-20 rounded-sm border border-primary/20 bg-ivory px-2 py-1.5 text-sm outline-none focus:border-accent"
                            disabled={isUpdating}
                          />
                        </div>
                        <Button
                          type="button"
                          className="px-4 py-1.5 text-xs"
                          disabled={!hasChanges || isUpdating}
                          onClick={() => void handleUpdate(variant.id)}
                        >
                          {isUpdating ? "Saving..." : hasSuccess ? "Saved!" : "Save"}
                        </Button>
                      </div>
                      
                      {hasError && (
                        <p className="w-full text-xs text-accent">Failed to save inventory.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
