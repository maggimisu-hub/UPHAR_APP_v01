import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getProductsByCategory } from "@/lib/product-service";

export default function WomenPage() {
  const products = getProductsByCategory("women");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Women"
          title="Quietly expressive pieces with fluid movement and clean lines."
          description="Discover elevated tailoring, premium dresses, and modern outerwear grounded in a calm neutral palette."
        />
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </Container>
    </section>
  );
}

