import { BreakEvenCalculator } from "@/components/tools/BreakEvenCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Break-even calculator: units and revenue to cover costs",
  description:
    "Find how many units you need to sell to cover fixed costs, the break-even revenue, and the volume needed for a profit target. Free and shows its formulas.",
  path: "/tools/break-even-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="break-even-calculator"
      title="Break-even calculator"
      lead="Find how many units you need to sell in a period to cover your fixed costs, and how many more it takes to reach a profit target."
      guide={
        <>
          <h2>What break-even tells you</h2>
          <p>
            Each sale contributes its price minus its variable cost towards your fixed costs. Break-even is the number of sales at which those
            contributions add up to the fixed costs for the period. Below it you are losing money; above it every unit adds its contribution to profit.
          </p>
          <h2>Fixed costs and variable costs</h2>
          <ul>
            <li>
              <strong>Fixed costs</strong> stay the same whether you sell one unit or a thousand: rent, salaries, software, insurance.
            </li>
            <li>
              <strong>Variable costs</strong> rise with each sale: the product, packaging, shipping, payment and marketplace fees.
            </li>
          </ul>
          <p>
            Use the same period for everything. If fixed costs are monthly, the result is units per month.
          </p>
          <h2>Limits of a simple break-even model</h2>
          <p>
            The model assumes your price and variable cost stay constant. In practice discounts, volume pricing and returns change both. Treat the result
            as a planning figure and rerun it with your realistic best and worst cases.
          </p>
        </>
      }
    >
      <BreakEvenCalculator />
    </ToolPage>
  );
}
