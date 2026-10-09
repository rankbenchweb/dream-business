import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of service",
  description: "The terms for using The Dream Business website, tools and inquiry forms.",
  path: "/terms",
});

export default function Page() {
  return (
    <PolicyPage
      path="/terms"
      title="Terms of service"
      lead="The basic terms for using The Dream Business today. Separate terms will apply to accounts, listings and paid promotion when they launch."
      updated="9 October 2026"
      draft
    >
      <h2>Using the site</h2>
      <p>
        You may use the site and its tools for your own business and personal purposes. Please don&apos;t misuse the forms, attempt to disrupt the
        service, or collect content from it automatically at a scale that affects other users.
      </p>

      <h2>Tools and information are not professional advice</h2>
      <p>
        Calculators produce estimates from the numbers you provide, and guides are general information. They are not financial, legal, tax or
        investment advice. Check important decisions with a qualified adviser in your country.
      </p>

      <h2>Third-party businesses</h2>
      <p>
        Businesses listed or promoted on the platform are independent of us. Any agreement you make with them is between you and them. Read what our
        labels mean in the <Link href="/verification-standards">verification standards</Link> and{" "}
        <Link href="/advertising-standards">advertising standards</Link>.
      </p>

      <h2>Promotion</h2>
      <p>
        Sending an inquiry does not create an agreement. Promotions are only published once terms, price and dates have been agreed in writing and the
        campaign has passed review.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed.</p>
    </PolicyPage>
  );
}
