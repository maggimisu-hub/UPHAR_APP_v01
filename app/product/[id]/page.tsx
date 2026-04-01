import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { getProductById, getRelatedProducts } from "@/lib/product-service";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="py-10 sm:py-14 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <ProductGallery images={product.images} alt={product.name} />
          <ProductPurchasePanel product={product} />
        </div>
      </Container>

      <section className="pt-20">
        <Container>
          <SectionHeading
            eyebrow="Related"
            title="Complete the wardrobe story."
            description="Curated styles from the same edit, selected to pair naturally with this piece."
          />
          <div className="mt-10">
            <ProductGrid products={relatedProducts} />
          </div>
        </Container>
      </section>
    </div>
  );
}

