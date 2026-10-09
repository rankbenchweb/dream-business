import { MarketingBudgetPlanner } from "@/components/tools/MarketingBudgetPlanner";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Marketing budget planner: split spend across channels",
  description:
    "Split a monthly marketing budget across channels and estimate new customers, blended cost per customer and first-order return from your own channel costs.",
  path: "/tools/marketing-budget-planner",
});

export default function Page() {
  return (
    <ToolPage
      slug="marketing-budget"
      title="Marketing budget planner"
      lead="Decide where your marketing money goes. Split a monthly budget across channels and see how many customers each is likely to bring at the costs you expect."
      guide={
        <>
          <h2>Start from cost per customer</h2>
          <p>
            The most useful number for each channel is what a new customer costs there. If you have run campaigns, use your real results. If not,
            start cautiously, spend a small test budget, and update the figure with what you learn.
          </p>
          <h2>Don&apos;t put everything in the cheapest channel</h2>
          <p>
            Costs usually rise as you spend more in one channel, because you reach less interested people. Spreading budget also protects you if a
            platform changes its rules or prices.
          </p>
          <h2>Look beyond the first order</h2>
          <p>
            First-order revenue is a cautious measure. If customers buy again, the customer lifetime value calculator shows what they are really worth,
            and how much you can afford to pay to win them.
          </p>
        </>
      }
    >
      <MarketingBudgetPlanner />
    </ToolPage>
  );
}
