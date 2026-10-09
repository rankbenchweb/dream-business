import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero, Section, TextLink } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Contact The Dream Business about listings, promotion, partnerships, corrections or general questions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        title="Contact us"
        lead="Questions, corrections, partnership ideas or a tool you wish existed: send us a message and a person will reply."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div className="space-y-6 text-sm text-muted">
            <div>
              <h2 className="text-base">Advertising and listings</h2>
              <p className="mt-1">
                The <TextLink href="/promote#inquiry">promotion inquiry form</TextLink> asks the questions we need to reply with options.
              </p>
            </div>
            <div>
              <h2 className="text-base">Corrections</h2>
              <p className="mt-1">Tell us the page and what is wrong. We correct material errors promptly.</p>
            </div>
            <div>
              <h2 className="text-base">Your data</h2>
              <p className="mt-1">
                To see, correct or delete information we hold about you, choose General question below. See the <TextLink href="/privacy">privacy policy</TextLink>.
              </p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line bg-surface p-6 shadow-[var(--shadow-raise)] sm:p-9">
            <InquiryForm defaultType="general" variant="contact" />
          </div>
        </div>
      </Section>
    </>
  );
}
