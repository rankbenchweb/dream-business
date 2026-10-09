import { SupplierComparison } from "@/components/tools/SupplierComparison";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Supplier comparison worksheet: compare quotes side by side",
  description:
    "Compare up to four supplier quotes on cost per unit, minimum order cash, lead time, quality and reliability, weighted by what matters to your business.",
  path: "/tools/supplier-comparison",
});

export default function Page() {
  return (
    <ToolPage
      slug="supplier-comparison"
      title="Supplier comparison worksheet"
      lead="The cheapest quote is not always the best supplier. Compare up to four side by side on cost, cash needed, speed, quality and reliability."
      guide={
        <>
          <h2>Compare the true cost</h2>
          <p>
            Compare cost per unit including shipping, not the unit price alone. For imports, use the landed cost calculator to add duty and fees
            before you compare.
          </p>
          <h2>Minimum orders and cash</h2>
          <p>
            A lower unit price often comes with a larger minimum order. The cash for the minimum order shows how much money each supplier ties up
            before you sell anything; weigh that against your budget and how sure you are the product will sell.
          </p>
          <h2>Rating quality and reliability</h2>
          <ul>
            <li>Order samples from your shortlist and judge them side by side.</li>
            <li>Ask for references from existing customers and check how quickly suppliers answer questions.</li>
            <li>Agree quality standards, inspection and what happens with defective goods in writing.</li>
          </ul>
        </>
      }
    >
      <SupplierComparison />
    </ToolPage>
  );
}
