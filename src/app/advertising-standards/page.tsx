import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Advertising standards and advertiser information",
  description:
    "What The Dream Business accepts for promotion, how sponsored placements are reviewed and labelled, and what advertisers can and cannot buy.",
  path: "/advertising-standards",
});

export default function Page() {
  return (
    <PolicyPage
      path="/advertising-standards"
      title="Advertising standards"
      lead="The rules every promotion on The Dream Business follows, so readers can trust what they see and advertisers know exactly what they are buying."
      updated="9 October 2026"
    >
      <h2>What advertisers can buy</h2>
      <p>
        Advertisers buy <strong>visibility</strong>: a placement in an agreed location for an agreed period. Every paid placement is labelled
        <strong> Sponsored</strong>.
      </p>
      <p>Advertisers cannot buy:</p>
      <ul>
        <li>a Verified label, which is only granted after documented checks;</li>
        <li>an editorial recommendation, ranking position or favourable comparison;</li>
        <li>reviews, ratings or testimonials of any kind;</li>
        <li>the removal or softening of accurate information about their business.</li>
      </ul>

      <h2>Review before publication</h2>
      <p>Every campaign is reviewed by a person before it runs. We check that:</p>
      <ul>
        <li>the business and its offer are real and identifiable;</li>
        <li>claims about results, earnings or performance are supportable;</li>
        <li>important terms such as price, subscriptions and refunds are disclosed on the landing page;</li>
        <li>the destination link works and is the advertiser&apos;s own.</li>
      </ul>
      <p>We may ask for changes or decline a campaign. If we decline, we say why.</p>

      <h2>What we don&apos;t accept</h2>
      <ul>
        <li>Guaranteed-income, get-rich-quick or misleading earnings claims.</li>
        <li>Unlicensed financial, investment or lending products.</li>
        <li>Counterfeit, prohibited or unsafe products.</li>
        <li>Fabricated reviews, fake scarcity and undisclosed paid endorsements.</li>
        <li>Pyramid or multi-level schemes where income depends mainly on recruitment.</li>
        <li>Anything unlawful in the market the promotion targets.</li>
      </ul>

      <h2>Reporting</h2>
      <p>
        We report only what we can measure for a placement, such as impressions and clicks, and say how it was measured. We don&apos;t promise audience
        sizes, sales or conversions.
      </p>

      <h2>Start a campaign</h2>
      <p>
        Tell us what you want to promote through the <Link href="/promote#inquiry">promotion inquiry form</Link>.
      </p>
    </PolicyPage>
  );
}
