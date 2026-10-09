import { ButtonLink, PageHero, Section, SectionHeading } from "@/components/ui";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About The Dream Business",
  description:
    "The Dream Business is a global business-building platform for founders, growing companies and enterprises: practical tools, business discovery and transparent promotion.",
  path: "/about",
});

const principles = [
  { title: "Useful before it is big", body: "We publish tools and guides when they work, and say plainly what is still being built." },
  { title: "Honest about money", body: "Paid placement, affiliate links, verification and editorial picks are separate, and always labelled." },
  { title: "Global by design", body: "Built for business owners everywhere, not one country, with guidance that says where it applies." },
  { title: "Every stage welcome", body: "A first-time founder and an enterprise team should both find something here worth their time." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        title="About The Dream Business"
        lead={`${site.name} is the business builder: one platform to research, plan, source, launch, promote and grow a business, and to connect with the companies that help businesses succeed.`}
      >
        <ButtonLink href="/business-builder" variant="onDark">
          Start building
        </ButtonLink>
        <ButtonLink href="/contact" variant="onDarkSecondary">
          Contact us
        </ButtonLink>
      </PageHero>

      <Section tone="white" labelledBy="mission-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <SectionHeading id="mission-heading" title="Our mission" />
          <div className="prose-db text-lg">
            <p>
              To make business-building resources, practical tools, commercial connections and growth opportunities accessible to people and
              organisations around the world.
            </p>
            <p>
              Businesses need two things that rarely live in one place: reliable help making decisions, and a way to find the suppliers, software and
              services that carry those decisions out. We are building both, and we fund the platform by letting the companies that serve businesses
              reach them, openly and with clear labels.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="principles-heading">
        <SectionHeading id="principles-heading" title="How we work" />
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title} className="border-t-2 border-signal pt-5">
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
