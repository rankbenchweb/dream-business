import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Editorial policy",
  description: "How The Dream Business researches, writes, reviews and updates its guides, comparisons and recommendations, independently of advertisers.",
  path: "/editorial-policy",
});

export default function Page() {
  return (
    <PolicyPage
      path="/editorial-policy"
      title="Editorial policy"
      lead="How our guides, comparisons and recommendations are made, and how we keep them independent of the businesses that advertise here."
      updated="9 October 2026"
    >
      <h2>Independence</h2>
      <p>
        Editorial content is written and maintained separately from advertising. Advertisers and affiliate partners cannot review, approve or change it
        before publication, and paying for promotion does not affect whether or how a business appears in editorial content.
      </p>

      <h2>How we research</h2>
      <ul>
        <li>We use primary sources wherever possible: official guidance, provider documentation, published data.</li>
        <li>We cite our sources and date them.</li>
        <li>Country-specific guidance says which country it applies to.</li>
        <li>We separate fact, estimate and opinion, and label each.</li>
      </ul>

      <h2>Use of AI</h2>
      <p>
        We may use AI tools to help research, draft or check content. A person reviews anything we publish, and AI-generated assessments shown in tools
        are labelled as such.
      </p>

      <h2>Keeping content current</h2>
      <p>
        Guides show when they were last reviewed. We revisit content when rules, fees or products change, and we remove content we can no longer keep
        accurate rather than leave it to go stale.
      </p>

      <h2>Corrections</h2>
      <p>
        Spotted something wrong? <Link href="/contact">Contact us</Link> and we&apos;ll look into it.
      </p>
    </PolicyPage>
  );
}
