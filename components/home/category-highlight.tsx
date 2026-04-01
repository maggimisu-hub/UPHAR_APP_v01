import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";

const categories = [
  {
    title: "Women",
    href: "/women",
    description: "Fluid tailoring, satin textures, and sculpted essentials in a calm neutral palette.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Men",
    href: "/men",
    description: "Minimal layers, structured outerwear, and refined knitwear built for everyday rotation.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  },
];

export function CategoryHighlight() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Categories"
          title="Built around modern wardrobe foundations."
          description="Explore collections that stay minimal, elevated, and easy to style season after season."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group relative overflow-hidden rounded-[32px] bg-ink text-pearl"
            >
              <img
                src={category.image}
                alt={category.title}
                className="h-[420px] w-full object-cover opacity-75 transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <p className="text-xs uppercase tracking-[0.35em] text-pearl/70">Collection</p>
                <h3 className="mt-3 font-serif text-4xl">{category.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-pearl/75">{category.description}</p>
                <span className="mt-6 inline-flex text-xs uppercase tracking-[0.32em] text-pearl">Discover now</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

