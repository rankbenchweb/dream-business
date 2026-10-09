import { ProfitMarginCalculator } from "@/components/tools/ProfitMarginCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Profit margin calculator: margin, markup and price",
  description:
    "Calculate gross margin, markup and profit per unit from cost and price, or find the selling price for a target margin. Free, shows its formulas, works in your currency.",
  path: "/tools/profit-margin-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="profit-margin-calculator"
      title="Profit margin calculator"
      lead="Enter what a unit costs you and what you sell it for to see your margin, markup and profit. Or start from the margin you need and get the price."
      guide={
        <>
          <h2>Margin and markup are not the same number</h2>
          <p>
            <strong>Margin</strong> is profit as a share of the selling price. <strong>Markup</strong> is profit as a share of the cost. A product that
            costs 40 and sells for 60 has a 50% markup but a 33.3% margin. Confusing the two is one of the most common pricing mistakes: adding a 30%
            markup does not give a 30% margin.
          </p>
          <h2>What to include in cost per unit</h2>
          <ul>
            <li>The product itself, including inbound shipping and duty.</li>
            <li>Packaging and labels.</li>
            <li>Per-sale fees: payment processing, marketplace commissions, fulfilment.</li>
          </ul>
          <p>
            Leave out fixed costs such as rent, salaries and software subscriptions. Those belong in a break-even calculation, which tells you how many
            units your margin has to pay for.
          </p>
          <h2>Using a target margin</h2>
          <p>
            If you know the margin your business needs, switch to <strong>Price for a target margin</strong>. The calculator divides cost by one minus
            the margin. A 100% margin is impossible because it would require an infinite price, so targets must be below 100%.
          </p>
        </>
      }
    >
      <ProfitMarginCalculator />
    </ToolPage>
  );
}
