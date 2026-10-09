import { CashFlowPlanner } from "@/components/tools/CashFlowPlanner";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cash-flow planner: month-by-month cash projection",
  description:
    "Project your cash month by month for up to two years. See your lowest balance, when cash could run out, and how much funding you need. Free cash-flow planner.",
  path: "/tools/cash-flow-planner",
});

export default function Page() {
  return (
    <ToolPage
      slug="cash-flow"
      title="Cash-flow planner"
      lead="Profitable businesses still fail when cash runs out. Project your bank balance month by month, see the low point coming, and plan for it in time."
      guide={
        <>
          <h2>Profit and cash are different</h2>
          <p>
            A business can be profitable on paper and still run out of money: customers pay late, stock is paid for before it sells, and large bills
            arrive in a single month. Cash-flow planning tracks when money actually moves, so you can see a shortfall before it happens.
          </p>
          <h2>What to do about a gap</h2>
          <ul>
            <li>Arrange funding before you need it; lenders are slower and stricter when you are already short.</li>
            <li>Move large one-off purchases to a month with more headroom.</li>
            <li>Ask for deposits or faster payment terms from customers, and longer terms from suppliers.</li>
          </ul>
          <h2>Keep it current</h2>
          <p>
            Replace estimates with actual figures each month and extend the plan forward. A cash-flow forecast is most useful when it is updated
            regularly, not made once.
          </p>
        </>
      }
    >
      <CashFlowPlanner />
    </ToolPage>
  );
}
