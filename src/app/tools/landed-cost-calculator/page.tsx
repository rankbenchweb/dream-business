import { LandedCostCalculator } from "@/components/tools/LandedCostCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Landed cost calculator: freight, duty and import tax",
  description:
    "Work out the true cost of imported products per unit, including freight, insurance, customs duty, import tax and fees. Supports CIF and FOB duty bases.",
  path: "/tools/landed-cost-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="landed-cost-calculator"
      title="Landed cost calculator"
      lead="The supplier price is only the start. Add freight, insurance, customs duty, import tax and fees to see what each unit really costs once it reaches you."
      guide={
        <>
          <h2>Why landed cost matters</h2>
          <p>
            Pricing from the supplier price alone is a common way to lose money on imported goods. Shipping, duty and fees can add a large share to
            each unit, and that share is highest on cheap, bulky products. Price from the landed cost instead.
          </p>
          <h2>CIF or FOB: what duty is charged on</h2>
          <p>
            Countries value imports differently for customs. On a <strong>CIF</strong> basis, duty applies to the goods plus the international freight
            and insurance. On an <strong>FOB</strong> basis, duty applies to the goods alone. Check which your destination uses; it can change the duty
            noticeably on heavy shipments.
          </p>
          <h2>Finding your duty rate</h2>
          <p>
            Duty rates depend on the product&apos;s <strong>HS code</strong>, an international classification number, and on where the goods were made.
            Your destination&apos;s customs authority publishes its tariff, and a customs broker can confirm the classification before you ship.
          </p>
          <h2>Import tax is often reclaimable</h2>
          <p>
            Many countries charge VAT or GST on imports. Businesses registered for that tax can usually reclaim it, so it affects cash flow rather than
            cost. If you can&apos;t reclaim it, count it as a cost.
          </p>
        </>
      }
    >
      <LandedCostCalculator />
    </ToolPage>
  );
}
