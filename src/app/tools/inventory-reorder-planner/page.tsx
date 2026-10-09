import { InventoryReorderPlanner } from "@/components/tools/InventoryReorderPlanner";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Inventory reorder planner: reorder point and safety stock",
  description:
    "Work out when to reorder stock, how much safety stock to hold and how much to order, from your sales rate and supplier lead time. Free reorder point calculator.",
  path: "/tools/inventory-reorder-planner",
});

export default function Page() {
  return (
    <ToolPage
      slug="inventory-planner"
      title="Inventory reorder planner"
      lead="Know when to reorder and how much, so you don't sell out while a shipment is on its way or tie up cash in stock you don't need yet."
      guide={
        <>
          <h2>The reorder point</h2>
          <p>
            The reorder point is the stock level at which you should place your next order. It covers the sales you expect while the order is in
            transit, plus a safety buffer. Reorder at that level and the new stock should arrive before you run out.
          </p>
          <h2>Why safety stock exists</h2>
          <p>
            Sales are rarely steady and suppliers are rarely perfectly on time. Safety stock covers busy days and late deliveries. More safety stock
            means fewer sell-outs but more cash tied up in inventory.
          </p>
          <h2>Using it well</h2>
          <ul>
            <li>Use sales from a recent, typical period, not your best week.</li>
            <li>Add the time it takes you to place and pay for an order to the lead time.</li>
            <li>Plan separately for seasonal peaks; this calculation assumes a steady sales rate.</li>
          </ul>
        </>
      }
    >
      <InventoryReorderPlanner />
    </ToolPage>
  );
}
