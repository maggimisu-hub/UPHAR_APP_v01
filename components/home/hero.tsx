import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";

const heroVideo = "https://cdn.coverr.co/videos/coverr-model-walking-through-a-modern-space-1561195733575?download=1080p";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-pearl">
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover opacity-45">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,14,12,0.82),rgba(16,14,12,0.34),rgba(16,14,12,0.6))]" />
      </div>

      <Container className="relative grid min-h-[78vh] items-end py-16 sm:min-h-[86vh] sm:py-20 lg:items-center">
        <div className="max-w-2xl animate-fade-up">
          <p className="text-xs uppercase tracking-[0.4em] text-pearl/70">Spring 2026 Collection</p>
          <h1 className="mt-5 font-serif text-5xl leading-none tracking-tight sm:text-6xl lg:text-7xl">
            Modern tailoring with a quieter kind of confidence.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-pearl/75 sm:text-base">
            Discover premium fashion essentials designed for movement, contrast, and everyday polish across men and women.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/women" size="lg">
              Explore collection
            </Button>
            <Button href="/men" variant="secondary" size="lg" className="border-pearl text-pearl hover:bg-pearl hover:text-ink">
              Shop men
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

