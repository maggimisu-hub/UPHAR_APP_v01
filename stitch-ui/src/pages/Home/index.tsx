import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductGrid from "../../components/ProductGrid";
import SectionTitle from "../../components/SectionTitle";
import { useStore } from "../../context/StoreContext";
import { testimonials } from "../../data/catalog";
import { fetchActiveHero } from "../../services/adminHeroService";
import type { HeroItem } from "../../services/adminHeroService";

const defaultHero = {
  eyebrow: "Uphar",
  headline: "The Signature of Style",
  body_copy:
    "Premium Indian jewellery designed for weddings, festive gatherings, and meaningful gifting with a refined, minimal presentation.",
  cta_label: "Shop New Arrivals",
  cta_link: "/shop",
  media_url:
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80",
  is_video: false,
};

const categories = [
  {
    title: "Bridal Sets",
    href: "/women",
    description:
      "Wedding necklaces, chandelier earrings, and ceremonial sets chosen for the grandest occasions.",
    image:
      "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Festive Classics",
    href: "/men",
    description:
      "Polki chokers, temple bangles, and signature earrings for celebrations, gifting, and family rituals.",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
  },
];

const promos = [
  {
    title: "Complimentary gift packaging",
    description:
      "Hand-finished presentation for bridal orders, festive gifting, and private appointments.",
  },
  {
    title: "Wedding & festive consultations",
    description:
      "Book a guided jewellery edit for ceremonies, gifting moments, and family celebrations.",
  },
];

export default function Home() {
  const { getFeaturedProducts, getNewArrivals } = useStore();
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const newArrivals = getNewArrivals().slice(0, 4);

  const [hero, setHero] = useState<HeroItem | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    fetchActiveHero()
      .then((h) => {
        setHero(h);
        setHeroLoaded(true);
      })
      .catch(() => setHeroLoaded(true));
  }, []);

  const h = hero ?? defaultHero;
  const heroMedia = h.media_url || defaultHero.media_url;
  const heroIsVideo = hero ? h.is_video : false;

  return (
    <div>
      <section className="relative overflow-hidden bg-primary text-ivory">
        <div className="absolute inset-0">
          {heroIsVideo && heroMedia ? (
            <video
              src={heroMedia}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-50"
            />
          ) : (
            <img
              src={heroMedia}
              alt="Uphar jewellery hero"
              className="h-full w-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#003D3B]/70 via-[#003D3B]/40 to-transparent" />
        </div>

        <div className={`container-shell relative grid min-h-[72vh] items-center py-16 sm:min-h-[82vh] sm:py-20 transition-opacity duration-500 ${heroLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="mx-auto max-w-2xl text-center">
            {h.eyebrow && (
              <p className="mb-3 text-[13px] uppercase tracking-[0.45em] text-[#F7F5F2]">{h.eyebrow}</p>
            )}
            <h1 className="font-display text-5xl leading-none tracking-tight sm:text-6xl lg:text-7xl">
              {h.headline || defaultHero.headline}
            </h1>
            {h.body_copy && (
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ivory/85 sm:text-base">
                {h.body_copy}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
              <Link
                to={h.cta_link || "/shop"}
                className="inline-flex items-center justify-center rounded-sm bg-[#B76E79] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white transition duration-300 hover:bg-[#9f5963]"
              >
                {h.cta_label || defaultHero.cta_label}
              </Link>
              <Link
                to="/women"
                className="inline-flex items-center justify-center rounded-sm border border-[#B76E79] px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-[#B76E79] transition duration-300 hover:bg-white/5"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20 sm:py-24">
        <SectionTitle
          eyebrow="Featured Collections"
          title="Jewellery sets chosen for ceremonies and celebration."
          body="Explore signature necklace sets, bridal bangles, and heirloom-inspired pairings presented with quiet elegance."
        />
        <div className="mt-12">
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="bg-ivory py-20 sm:py-24">
        <div className="container-shell">
          <SectionTitle
            eyebrow="New Arrivals"
            title="Bangles, necklaces, and earrings in a fresh seasonal edit."
            body="New arrivals with polished finishes, ceremonial detailing, and a refined Uphar presentation."
          />
          <div className="mt-12">
            <ProductGrid products={newArrivals} />
          </div>
        </div>
      </section>

      <section className="container-shell py-20 sm:py-24">
        <SectionTitle
          eyebrow="Trending"
          title="Wedding and festive styles with lasting elegance."
          body="Browse refined jewellery categories designed for bridal moments, festive dressing, and heirloom gifting."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.title}
              to={category.href}
              className="group relative overflow-hidden rounded-sm border border-primary/15 bg-primary text-ivory"
            >
              <img
                src={category.image}
                alt={category.title}
                className="h-[420px] w-full object-cover opacity-70 transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/55" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Collection</p>
                <h3 className="mt-3 font-display text-4xl">{category.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-ivory/85">
                  {category.description}
                </p>
                <span className="mt-6 inline-flex text-[11px] uppercase tracking-[0.32em] text-accent">
                  Discover now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {promos.map((promo) => (
            <div key={promo.title} className="rounded-sm border border-primary/15 bg-ivory p-8 sm:p-10">
              <p className="text-[11px] uppercase tracking-[0.3em] text-charcoal/70">Service</p>
              <h3 className="mt-4 font-display text-3xl text-primary">{promo.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-charcoal/80">
                {promo.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ivory py-20 sm:py-24">
        <div className="container-shell">
          <SectionTitle
            eyebrow="Testimonials"
            title="Loved for thoughtful presentation and refined craftsmanship."
            body="Elegant client notes from jewellery orders placed for gifting, ceremony, and festive dressing."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.slice(0, 4).map((testimonial) => (
              <article key={testimonial.id} className="rounded-sm border border-primary/15 bg-ivory p-6">
                <p className="text-[18px] font-semibold leading-[1.5] text-primary">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 text-sm text-charcoal/80">
                  <p className="font-medium text-primary">{testimonial.name}</p>
                  <p>{testimonial.city}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
