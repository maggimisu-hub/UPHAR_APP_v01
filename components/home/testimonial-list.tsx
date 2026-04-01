import { testimonials } from "@/data/products";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";

export function TestimonialList() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Client Notes"
          title="Loved for the details that feel effortless."
          description="A few words from clients who value clean construction, subtle luxury, and a fast mobile experience."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-[28px] border border-sand bg-pearl p-6">
              <p className="font-serif text-2xl leading-9 text-ink">“{testimonial.quote}”</p>
              <div className="mt-6 text-sm text-stone">
                <p className="font-medium text-ink">{testimonial.name}</p>
                <p>{testimonial.city}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

