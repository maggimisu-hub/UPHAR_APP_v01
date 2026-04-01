import { Container } from "@/components/layout/container";

const promos = [
  {
    title: "Complimentary express delivery",
    description: "Across select cities on all prepaid orders above INR 8,000.",
  },
  {
    title: "Private styling support",
    description: "Book a guided wardrobe edit directly from your account dashboard.",
  },
];

export function PromoBanner() {
  return (
    <section className="pb-20">
      <Container className="grid gap-5 lg:grid-cols-2">
        {promos.map((promo) => (
          <div key={promo.title} className="rounded-[32px] border border-sand bg-white p-8 shadow-soft sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-stone">Service</p>
            <h3 className="mt-4 font-serif text-3xl text-ink">{promo.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-stone">{promo.description}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

