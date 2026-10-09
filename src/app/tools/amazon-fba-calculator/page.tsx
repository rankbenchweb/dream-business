import { AmazonFbaCalculator } from "@/components/tools/AmazonFbaCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Amazon FBA calculator: profit per unit, FBA vs FBM",
  description:
    "Calculate Amazon FBA profit per unit after referral, fulfilment and storage fees and advertising, and compare it with fulfilling orders yourself (FBM).",
  path: "/tools/amazon-fba-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="amazon-fba-profit"
      title="Amazon FBA calculator"
      lead="See what each unit really earns on Amazon after every fee and your advertising, and whether letting Amazon fulfil orders beats doing it yourself."
      guide={
        <>
          <h2>Enter Amazon&apos;s current fees</h2>
          <p>
            Amazon&apos;s fees differ by marketplace, product category, size, weight and season, and they change. The calculator starts with example
            values only. Replace them with the referral percentage for your category and the fulfilment fee for your product from Amazon&apos;s fee
            schedule in Seller Central.
          </p>
          <h2>FBA or FBM</h2>
          <ul>
            <li>
              <strong>FBA</strong>: Amazon stores, packs and delivers. You pay fulfilment and storage fees, and your listings usually qualify for
              Amazon&apos;s faster delivery promises.
            </li>
            <li>
              <strong>FBM</strong>: you store and ship orders yourself. You avoid Amazon&apos;s fulfilment and storage fees but take on delivery costs,
              packing time and Amazon&apos;s delivery standards.
            </li>
          </ul>
          <h2>Costs sellers forget</h2>
          <ul>
            <li>Storage for stock that sells slowly, which grows with time in the warehouse.</li>
            <li>Returns, damaged units and removal fees.</li>
            <li>Advertising: on Amazon it is often needed to rank, so count it per unit.</li>
          </ul>
        </>
      }
    >
      <AmazonFbaCalculator />
    </ToolPage>
  );
}
