import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What information The Dream Business collects, why, how long it is kept, and your choices.",
  path: "/privacy",
});

export default function Page() {
  return (
    <PolicyPage
      path="/privacy"
      title="Privacy policy"
      lead="We collect as little as we can, use it only to provide the service, and never sell it."
      updated="9 October 2026"
      draft
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Inquiry and contact forms:</strong> your name, email address, business name, website, market and message. We use these only to
          reply to you and to handle the listing or promotion you asked about.
        </li>
        <li>
          <strong>Calculators:</strong> nothing. Calculations run in your browser and the numbers you enter are not sent to us.
        </li>
        <li>
          <strong>Your market preference:</strong> stored in your own browser&apos;s local storage so calculators use your currency. It is not sent to
          us and you can clear it at any time through your browser settings.
        </li>
        <li>
          <strong>Server logs:</strong> our hosting provider records technical information such as IP address and browser type to keep the service
          secure and working.
        </li>
      </ul>

      <h2>Cookies and analytics</h2>
      <p>
        The site does not currently set advertising or analytics cookies. If we add analytics, we will choose a privacy-respecting option, update this
        policy first, and ask for consent where the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Inquiries are kept for as long as needed to handle them and any resulting agreement, then deleted or anonymised. We will publish specific
        retention periods before accounts launch.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Only the service providers that run the platform for us, such as hosting and database providers, under agreements that limit their use of it.
        We do not sell personal information or share it with advertisers.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what we hold about you, ask us to correct it, or ask us to delete it through the <Link href="/contact">contact page</Link>.
      </p>
    </PolicyPage>
  );
}
