import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductsByCategory } from "@/lib/product-service";

export default function MenPage() {
  const products = getProductsByCategory("men");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Men"
          title="Minimal layers for a polished everyday wardrobe."
          description="Structured coats, refined knitwear, and relaxed tailoring designed with clarity and restraint."
        />
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </Container>
    </section>
  );
}

