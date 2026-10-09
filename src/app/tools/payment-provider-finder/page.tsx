import { PaymentProviderFinder } from "@/components/tools/PaymentProviderFinder";
import { ToolPage } from "@/components/tools/ToolPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Payment provider finder: which services work in your country",
  description:
    "See which payment providers accept businesses in Pakistan, the UAE, Saudi Arabia, India, the US, UK, EU, Canada and Australia: Stripe, PayPal, Payoneer, Wise, Paddle and more, with sources.",
  path: "/tools/payment-provider-finder",
});

export default function Page() {
  return (
    <ToolPage
      slug="payment-provider-finder"
      title="Payment provider finder"
      lead="Not every payment service accepts businesses from every country. Choose where your business is registered and see which providers say they serve it, with the source for every answer."
      guide={
        <>
          <h2>Three kinds of payment service</h2>
          <ul>
            <li>
              <strong>Card checkout</strong> services take card payments on your own website or store.
            </li>
            <li>
              <strong>Receiving accounts</strong> let clients, marketplaces and platforms pay you, often in foreign currencies, and move money to your
              local bank.
            </li>
            <li>
              <strong>Merchants of record</strong> sell your digital product on your behalf and handle sales tax in each country, in return for a
              larger fee.
            </li>
          </ul>
          <h2>If the big names aren&apos;t available to you</h2>
          <p>
            Businesses in countries some providers don&apos;t serve often combine a merchant of record for digital products, a receiving account for
            client and marketplace payments, and a local gateway for domestic customers. Some founders also register a company in another country;
            that brings tax, banking and legal obligations, so take professional advice first.
          </p>
          <h2>How this information is kept</h2>
          <p>
            Each answer comes from the provider&apos;s own pages, checked on the date shown, except where a provider publishes no country list and we
            cite the clearest report available. Providers change their coverage, and approval always depends on your business, so confirm directly
            before you build around one.
          </p>
        </>
      }
    >
      <PaymentProviderFinder />
    </ToolPage>
  );
}
