import { CacLtvCalculator } from "@/components/tools/CacLtvCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Customer acquisition cost and lifetime value calculator",
  description:
    "Calculate customer acquisition cost (CAC), customer lifetime value (LTV), the LTV to CAC ratio and how many months it takes to earn back acquisition spend.",
  path: "/tools/customer-lifetime-value-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="cac-ltv"
      title="Customer acquisition and lifetime value"
      lead="Compare what it costs to win a customer with what that customer is worth over time, and see how long it takes to earn the cost back."
      guide={
        <>
          <h2>Why the ratio matters</h2>
          <p>
            If a customer is worth less than it costs to win them, growing faster only loses money faster. Comparing lifetime value with acquisition cost
            tells you whether paid growth is sustainable and how much you can afford to spend on marketing.
          </p>
          <h2>Be honest about lifespan</h2>
          <p>
            Lifetime value is very sensitive to how long you assume customers stay. Use real repeat-purchase data where you have it. A new business
            should use a short, cautious lifespan until customers prove otherwise.
          </p>
          <h2>Payback period and cash</h2>
          <p>
            Even with a healthy ratio, a long payback period means you spend cash today and recover it over months. Check the cash-flow planner before
            increasing acquisition spend.
          </p>
        </>
      }
    >
      <CacLtvCalculator />
    </ToolPage>
  );
}
