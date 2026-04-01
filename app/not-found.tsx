import { Button } from "@/components/forms/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone">404</p>
        <h1 className="mt-4 font-serif text-5xl text-ink sm:text-6xl">That page could not be found.</h1>
        <p className="mt-6 text-sm leading-7 text-stone sm:text-base">
          The collection may have moved, or the link may no longer be available.
        </p>
        <Button href="/" className="mt-8">
          Return home
        </Button>
      </Container>
    </section>
  );
}

