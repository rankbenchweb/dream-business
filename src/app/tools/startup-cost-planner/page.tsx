import { StartupCostPlanner } from "@/components/tools/StartupCostPlanner";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Startup cost planner: launch costs and runway",
  description:
    "List one-off launch costs and monthly running costs, compare them with your budget, and see how many months your money lasts. Free startup cost planner.",
  path: "/tools/startup-cost-planner",
});

export default function Page() {
  return (
    <ToolPage
      slug="startup-cost-planner"
      title="Startup cost planner"
      lead="List what it costs to launch and to keep running, set your budget, and see how long the money lasts before the business has to pay its own way."
      guide={
        <>
          <h2>One-off costs and running costs</h2>
          <p>
            <strong>One-off costs</strong> are paid once to get started: registration, a website, opening stock, equipment. <strong>Running costs</strong>{" "}
            repeat every month whether or not you sell anything: software, marketing, workspace, salaries. Keeping them separate shows both what you
            need to open and how long you can stay open.
          </p>
          <h2>What runway means</h2>
          <p>
            Runway is the number of months your remaining money covers your net monthly spend. It is the time you have to reach enough sales. If you
            expect some revenue early, add it; the planner subtracts it from your monthly costs.
          </p>
          <h2>Costs founders often miss</h2>
          <ul>
            <li>Payment processing and marketplace fees on every sale.</li>
            <li>Returns, damaged stock and samples.</li>
            <li>Accounting, tax registration and banking fees.</li>
            <li>Your own living costs, if the business has to cover them.</li>
          </ul>
        </>
      }
    >
      <StartupCostPlanner />
    </ToolPage>
  );
}
