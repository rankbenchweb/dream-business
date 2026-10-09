import { AutomationPlanner } from "@/components/tools/AutomationPlanner";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Automation planner: find the tasks worth automating",
  description:
    "List repetitive business tasks and see how many hours a month automation could free, what that time is worth, and which task to automate first.",
  path: "/tools/automation-planner",
});

export default function Page() {
  return (
    <ToolPage
      slug="workflow-planner"
      title="Automation planner"
      lead="Small repeated tasks add up to days each month. List them, and see which ones are worth automating first and what the time you get back is worth."
      guide={
        <>
          <h2>What automates well</h2>
          <ul>
            <li>Moving information between tools: orders into spreadsheets, form entries into a CRM.</li>
            <li>Sending messages triggered by an event: order confirmations, shipping updates, reminders.</li>
            <li>Building regular reports from the same sources each week.</li>
          </ul>
          <h2>What to keep human</h2>
          <p>
            Judgement calls, unusual customer problems and anything where a mistake is costly. Partial automation often works best: a tool drafts the
            reply or collects the data, and a person checks it.
          </p>
          <h2>Start small</h2>
          <p>
            Automate the task at the top of your list, run it alongside the manual process for a week, then switch over. One reliable automation is
            worth more than five fragile ones.
          </p>
        </>
      }
    >
      <AutomationPlanner />
    </ToolPage>
  );
}
