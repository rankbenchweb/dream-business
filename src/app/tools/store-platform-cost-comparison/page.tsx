import Link from "next/link";
import { StorePlatformComparison } from "@/components/tools/StorePlatformComparison";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Store platform cost comparison: Shopify, BigCommerce, Squarespace, WooCommerce",
  description:
    "Compare the monthly running cost of Shopify, BigCommerce, Squarespace and WooCommerce at your own sales and order volume, including platform fees and card processing, with sources and the date checked.",
  path: "/tools/store-platform-cost-comparison",
});

export default function Page() {
  return (
    <ToolPage
      slug="store-platform-cost"
      title="Store platform cost comparison"
      lead="The cheapest plan on a pricing page is not always the cheapest store to run. Enter your sales and orders to see subscription, platform fees and card processing side by side."
      guide={
        <>
          <h2>Where the money goes</h2>
          <ul>
            <li>
              <strong>Subscription:</strong> the monthly plan price. Paying yearly is usually cheaper.
            </li>
            <li>
              <strong>Platform fees:</strong> some platforms charge a percentage of sales, either always or only when you use another payment
              gateway.
            </li>
            <li>
              <strong>Card processing:</strong> a percentage plus a fixed fee per order. At higher sales this is often the largest cost.
            </li>
            <li>
              <strong>Hosting and extras:</strong> self-hosted stores need hosting, and paid extensions can add up.
            </li>
          </ul>
          <h2>If your country isn&apos;t supported by a platform&apos;s payments</h2>
          <p>
            Built-in payment services such as Shopify Payments are only offered in some countries. Elsewhere you&apos;ll use another gateway, and some
            platforms then add their own fee on top. Choose your country in the header and the tool switches to a third-party gateway where needed. The{" "}
            <Link href="/tools/payment-provider-finder">payment provider finder</Link> shows which gateways accept your business.
          </p>
          <h2>Cost isn&apos;t the only factor</h2>
          <p>
            Compare themes, apps, staff accounts, selling in several currencies and the support you&apos;ll need. A plan that costs a little more but
            saves hours each week is often the better choice.
          </p>
        </>
      }
    >
      <StorePlatformComparison />
    </ToolPage>
  );
}
