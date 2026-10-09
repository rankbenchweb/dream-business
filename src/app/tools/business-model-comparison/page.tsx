import { BusinessModelComparison } from "@/components/tools/BusinessModelComparison";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Business model comparison: choose the right model",
  description:
    "Compare dropshipping, private label, marketplaces, wholesale, digital products, services, SaaS and more on capital, risk, margin, speed, control and scalability.",
  path: "/tools/business-model-comparison",
});

export default function Page() {
  return (
    <ToolPage
      slug="business-model-comparison"
      title="Business model comparison"
      lead="Nine ways to build a business, compared on the trade-offs that matter: money needed, stock risk, margins, speed, control and how far each can grow beyond your own time."
      guide={
        <>
          <h2>There is no best model, only trade-offs</h2>
          <p>
            Models that need little money usually leave thin margins and little control. Models with strong margins and a brand of your own usually need
            more capital and patience. Choose the trade-off you can live with, given your money, time and skills.
          </p>
          <h2>How to read the ratings</h2>
          <p>
            Each rating describes how the model <strong>typically</strong> behaves compared with the others. They are editorial judgements drawn from how
            these models generally work, not measurements, and a well-run business can beat them. Use them to narrow your options, then test the
            shortlist with real numbers in the calculators.
          </p>
          <h2>Combining models</h2>
          <p>
            Many businesses move between models: testing products by dropshipping before ordering private-label stock, or adding digital products to a
            service business. Choose a starting point, not a permanent identity.
          </p>
        </>
      }
    >
      <BusinessModelComparison />
    </ToolPage>
  );
}
