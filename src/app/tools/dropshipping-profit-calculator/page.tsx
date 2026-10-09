import { DropshippingCalculator } from "@/components/tools/DropshippingCalculator";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dropshipping profit calculator: real profit per order",
  description:
    "Calculate dropshipping profit per order after supplier cost, shipping, payment fees, advertising and refunds, plus monthly profit after subscriptions.",
  path: "/tools/dropshipping-profit-calculator",
});

export default function Page() {
  return (
    <ToolPage
      slug="dropshipping-profit"
      title="Dropshipping profit calculator"
      lead="The gap between what the supplier charges and what you sell for is not your profit. Include fees, advertising and refunds to see what each order really earns."
      guide={
        <>
          <h2>Where dropshipping profit goes</h2>
          <p>
            Dropshipping margins look generous until every cost is counted. Payment fees take a share of each sale, refunds cost you the product and
            shipping as well as the revenue, and advertising is often the single largest cost per order.
          </p>
          <h2>Advertising cost per order</h2>
          <p>
            Divide what you spend on ads by the number of orders they bring. If you don&apos;t know it yet, start with a cautious estimate and replace it
            with real figures after your first campaigns.
          </p>
          <h2>Before you scale</h2>
          <ul>
            <li>Test order a sample yourself to check quality and delivery time.</li>
            <li>Check whether the supplier&apos;s shipping time meets what customers in your market expect.</li>
            <li>Make sure profit per order survives a higher refund rate than you expect.</li>
          </ul>
        </>
      }
    >
      <DropshippingCalculator />
    </ToolPage>
  );
}
