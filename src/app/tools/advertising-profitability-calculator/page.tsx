import { AdProfitabilityCalculator } from "@/components/tools/AdProfitabilityCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Advertising profitability calculator: break-even ROAS and CPA",
  description:
    "Find your break-even ROAS, the most you can pay per sale, and whether a campaign's cost per click and conversion rate make a profit. Free calculator.",
  path: "/tools/advertising-profitability-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="ad-profitability"
      title="Advertising profitability calculator"
      lead="Know your limits before you spend: the return on ad spend you need to break even, the most you can pay for a sale, and whether a campaign actually makes money."
      guide={
        <>
          <h2>ROAS and cost per sale</h2>
          <p>
            <strong>ROAS</strong> (return on ad spend) is revenue divided by ad spend: a ROAS of 3x means every 1 spent brought 3 of sales.{" "}
            <strong>Cost per sale</strong>, also called cost per acquisition or CPA, is ad spend divided by the number of orders. Both describe the same
            campaign; this calculator works out the limits for each from your own costs.
          </p>
          <h2>Why your break-even ROAS is personal</h2>
          <p>
            A ROAS that is profitable for one business loses money for another. It depends entirely on how much profit each order leaves after product
            and delivery costs. The thinner your margin, the higher the ROAS you need, which is why low-margin products struggle with paid advertising.
          </p>
          <h2>Improving the numbers</h2>
          <ul>
            <li>Raise order value with bundles or minimum-order offers.</li>
            <li>Lower product cost by checking landed cost and supplier pricing.</li>
            <li>Improve conversion with better product pages before spending more on clicks.</li>
          </ul>
        </>
      }
    >
      <AdProfitabilityCalculator />
    </ToolPage>
  );
}
