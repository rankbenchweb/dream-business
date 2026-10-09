import { Navigator } from "@/components/navigator/Navigator";
import { PageHero, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Business Growth Navigator: a step-by-step plan for your goal",
  description:
    "Choose a goal, answer three questions, and get an ordered business plan that links to the right tools: starting up, launching products, suppliers, profit, customers, payments and expansion.",
  path: "/navigator",
});

export default function NavigatorPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Business Builder", path: "/business-builder" }, { name: "Business Growth Navigator", path: "/navigator" }]}
        title="Business Growth Navigator"
        lead="Tell us what you want to achieve and a little about your business. You'll get a plan in the right order, with the tools for each step, the risks to watch and the first thing to do."
      />
      <Section>
        <Navigator />
      </Section>
    </>
  );
}
