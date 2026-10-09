import { RoiCalculator } from "@/components/tools/RoiCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "ROI calculator: return, annualised return and payback",
  description:
    "Calculate return on investment, annualised ROI and payback period for equipment, stock, campaigns or any business investment. Free and shows its formulas.",
  path: "/tools/roi-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="roi-calculator"
      title="Return on investment calculator"
      lead="See what an investment returns, how that compares year on year, and how long it takes to get your money back."
      guide={
        <>
          <h2>Why annualised ROI matters</h2>
          <p>
            A 40% return sounds better than a 30% return, until you notice the first took three years and the second took one. Annualised ROI converts
            any return into a yearly compound rate, so investments of different lengths can be compared fairly.
          </p>
          <h2>What to count as the amount back</h2>
          <ul>
            <li>For equipment: the extra profit it produces, plus anything you can sell it for at the end.</li>
            <li>For stock: the revenue from selling it, after per-sale costs such as fees and shipping.</li>
            <li>For a marketing campaign: the gross profit from the sales it brought in, not the revenue.</li>
          </ul>
          <h2>Payback is a planning figure</h2>
          <p>
            The payback period assumes returns arrive evenly. Many investments return slowly at first and faster later, so treat it as a guide and
            keep enough cash to cover the slower start.
          </p>
        </>
      }
    >
      <RoiCalculator />
    </ToolPage>
  );
}
