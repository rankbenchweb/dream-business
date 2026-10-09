import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Data and verification standards",
  description:
    "How The Dream Business sources and dates information, labels estimates, and verifies businesses. Verification is never sold.",
  path: "/verification-standards",
});

export default function Page() {
  return (
    <PolicyPage
      path="/verification-standards"
      title="Data and verification standards"
      lead="What a label means on The Dream Business, and the checks behind it."
      updated="9 October 2026"
    >
      <h2>Information and data</h2>
      <p>Every figure we publish carries:</p>
      <ul>
        <li>its <strong>source</strong>, linked where the source is public;</li>
        <li>the <strong>date we collected it</strong>;</li>
        <li>its <strong>coverage</strong>: the country, period and population it describes;</li>
        <li>its <strong>type</strong>: verified fact, estimate, or AI-assisted assessment.</li>
      </ul>
      <p>
        Calculator results are estimates based on the numbers you enter, and each calculator shows its formula. We don&apos;t present information as
        live unless it refreshes automatically and shows when it last did.
      </p>

      <h2>Business verification</h2>
      <p>
        A <strong>Verified</strong> label means we completed a documented set of checks on a business, and when. The checks will include confirming the
        business is registered where it says it is, that the person listing it is authorised to do so, and that its website and contact details are
        genuine. The full checklist will be published here before the first business is verified.
      </p>
      <p>Verification:</p>
      <ul>
        <li>is never sold and is not included in any advertising package;</li>
        <li>confirms identity and legitimacy, not the quality of a product or service;</li>
        <li>expires and is re-checked periodically;</li>
        <li>can be withdrawn if we learn the checks no longer hold.</li>
      </ul>

      <h2>Corrections</h2>
      <p>
        If you find an error, <Link href="/contact">tell us</Link>. We correct material errors promptly and note the change on the page.
      </p>
    </PolicyPage>
  );
}
