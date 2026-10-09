import type { Metadata } from "next";
import { ButtonLink, Container, GridTexture } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="on-dark relative overflow-hidden bg-midnight py-24 text-fog sm:py-32">
      <GridTexture />
      <Container className="relative">
        <p className="text-sm text-mist">Error 404</p>
        <h1 className="mt-3 max-w-[40rem] text-3xl text-white sm:text-4xl">This page isn&apos;t on the route.</h1>
        <p className="mt-5 max-w-[36rem] text-lg text-mist">
          The address may be mistyped, or the page may have moved. Search with the button in the header, or continue from one of these.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="onDark">
            Go to the homepage
          </ButtonLink>
          <ButtonLink href="/tools" variant="onDarkSecondary">
            Browse business tools
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
