"use client";

import { useEffect } from "react";
import { Button, ButtonLink, Container, GridTexture } from "@/components/ui";

/** Shown when a page fails to render. Explains what happened and offers a way forward. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="on-dark relative overflow-hidden bg-midnight py-24 text-fog sm:py-32">
      <GridTexture />
      <Container className="relative">
        <p className="text-sm text-mist">Something went wrong</p>
        <h1 className="mt-3 max-w-[40rem] text-3xl text-white sm:text-4xl">This page didn&apos;t load properly.</h1>
        <p className="mt-5 max-w-[36rem] text-lg text-mist">
          The problem is on our side, not yours. Try again, and if it keeps happening, let us know which page you were on.
        </p>
        {error.digest ? <p className="mt-3 text-xs text-mist">Reference: {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="onDark" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="onDarkSecondary">
            Go to the homepage
          </ButtonLink>
          <ButtonLink href="/contact" variant="onDarkSecondary">
            Report the problem
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
