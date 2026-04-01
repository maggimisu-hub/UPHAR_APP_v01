import { CategoryHighlight } from "@/components/home/category-highlight";
import { Hero } from "@/components/home/hero";
import { PromoBanner } from "@/components/home/promo-banner";
import { TestimonialList } from "@/components/home/testimonial-list";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts, getNewArrivals } from "@/lib/product-service";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  return (
    <>
      <Hero />
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Featured"
            title="A premium edit of best-selling wardrobe essentials."
            description="Refined silhouettes, neutral tones, and high-rotation pieces chosen to anchor the season."
          />
          <div className="mt-10">
            <ProductGrid products={featuredProducts} />
          </div>
        </Container>
      </section>
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="New Arrivals"
            title="Fresh additions built for the modern everyday uniform."
            description="Explore recent arrivals with clean structure, polished fabric selection, and understated luxury."
          />
          <div className="mt-10">
            <ProductGrid products={newArrivals} />
          </div>
        </Container>
      </section>
      <CategoryHighlight />
      <PromoBanner />
      <TestimonialList />
    </>
  );
}

