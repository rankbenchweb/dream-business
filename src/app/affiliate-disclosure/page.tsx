import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Affiliate disclosure",
  description: "How The Dream Business uses affiliate links, how they are labelled, and why commissions never influence rankings or recommendations.",
  path: "/affiliate-disclosure",
});

export default function Page() {
  return (
    <PolicyPage
      path="/affiliate-disclosure"
      title="Affiliate disclosure"
      lead="Some links on The Dream Business may earn us a commission. Here is how that works and how we keep it from affecting what we recommend."
      updated="9 October 2026"
    >
      <h2>What an affiliate link is</h2>
      <p>
        An affiliate link is a tracked link to another company&apos;s product or service. If you buy through it, that company may pay us a commission.
        The price you pay is the same.
      </p>
      <h2>How we label them</h2>
      <p>
        Affiliate links are marked with an <strong>Affiliate link</strong> label next to the link or at the top of the page where they appear. At the
        time of writing, the platform does not yet carry any affiliate links.
      </p>
      <h2>What commissions never change</h2>
      <ul>
        <li>Rankings, comparisons and &quot;best for&quot; recommendations.</li>
        <li>Which products appear in our tools and guides.</li>
        <li>What we say about a product&apos;s drawbacks.</li>
      </ul>
      <p>If an option without an affiliate program is better for you, we recommend it anyway.</p>
    </PolicyPage>
  );
}
