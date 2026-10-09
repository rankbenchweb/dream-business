import type { Status } from "./tools";

export type Capability = {
  name: string;
  detail: string;
  status: Status;
  href?: string;
};

export type DivisionKey = "builder" | "intelligence" | "tools" | "marketplace" | "promotion" | "growth";

export type Division = {
  key: DivisionKey;
  name: string;
  short: string;
  href: string;
  purpose: string;
  intro: string;
  forWhom: string;
  capabilities: Capability[];
};

export const divisions: Record<DivisionKey, Division> = {
  builder: {
    key: "builder",
    name: "Business Builder",
    short: "Builder",
    href: "/business-builder",
    purpose: "Plan, launch and restructure businesses with guided planning tools.",
    intro:
      "The Builder turns an objective into a plan: which model fits, what it will cost, what has to happen first. It works the same way for a first venture and for an established company adding a new line or market.",
    forWhom: "First-time founders, owners adding a new business line, and companies planning a new model.",
    capabilities: [
      { name: "Business Growth Navigator", detail: "Choose a goal and get an ordered plan linked to the right tools.", status: "live", href: "/navigator" },
      { name: "Startup cost planner", detail: "Itemise launch and monthly costs and see your runway.", status: "live", href: "/tools/startup-cost-planner" },
      { name: "Business model comparison", detail: "Compare nine models on capital, risk, margin, speed, control and scale.", status: "live", href: "/tools/business-model-comparison" },
      { name: "Business plan builder", detail: "A structured plan you can save, revise and export.", status: "planned" },
      { name: "Launch checklist", detail: "Country-aware tasks for registration, payments, tax and launch.", status: "planned" },
      { name: "Business risk assessment", detail: "Identify concentration, supplier and regulatory risks early.", status: "planned" },
      { name: "Growth roadmap", detail: "Turn a plan into sequenced milestones with owners and dates.", status: "planned" },
    ],
  },
  intelligence: {
    key: "intelligence",
    name: "Business Intelligence",
    short: "Intelligence",
    href: "/intelligence",
    purpose: "Research markets, products, competitors and opportunities with clearly sourced information.",
    intro:
      "Intelligence is where decisions get their evidence. Every figure shown will carry its source and collection date, and estimates or AI-assisted assessments will be labelled as such — never presented as verified fact.",
    forWhom: "Founders validating an idea, sellers choosing products, and companies assessing new markets.",
    capabilities: [
      { name: "Country market comparison", detail: "Compare markets on sourced economic and ecommerce indicators.", status: "planned" },
      { name: "Product opportunity research", detail: "Assess demand signals, competition and margin for a product.", status: "planned" },
      { name: "Competitor research", detail: "Structured profiles of competitors' positioning and pricing.", status: "planned" },
      { name: "Supplier comparison", detail: "Compare supplier quotes on cost, lead time, quality and minimum orders.", status: "live", href: "/tools/supplier-comparison" },
      { name: "Industry research reports", detail: "Dated, sourced reports on specific industries and markets.", status: "planned" },
      { name: "Opportunity monitoring", detail: "Alerts when tracked markets or categories change.", status: "planned" },
    ],
  },
  tools: {
    key: "tools",
    name: "Business Tools",
    short: "Tools",
    href: "/tools",
    purpose: "Practical calculators and utilities for pricing, profit, finance and operations.",
    intro:
      "Tools answer specific questions quickly and show their working. Each one states its formula and assumptions, adapts to your selected market's currency, and runs in your browser.",
    forWhom: "Anyone pricing a product, checking a margin, or deciding whether a plan pays for itself.",
    capabilities: [
      { name: "Profit margin calculator", detail: "Margin, markup and profit per unit — or the price for a target margin.", status: "live", href: "/tools/profit-margin-calculator" },
      { name: "Break-even calculator", detail: "Units and revenue needed to cover fixed costs and reach a profit target.", status: "live", href: "/tools/break-even-calculator" },
      { name: "Return on investment calculator", detail: "Return, annualised return and payback period for an investment.", status: "live", href: "/tools/roi-calculator" },
      { name: "Landed cost calculator", detail: "Freight, insurance, duty and import tax on imported goods.", status: "live", href: "/tools/landed-cost-calculator" },
      { name: "Advertising profitability", detail: "Break-even ROAS and the most you can pay per sale.", status: "live", href: "/tools/advertising-profitability-calculator" },
      { name: "Cash-flow planner", detail: "Monthly cash projection and funding gaps.", status: "live", href: "/tools/cash-flow-planner" },
    ],
  },
  marketplace: {
    key: "marketplace",
    name: "Business Marketplace",
    short: "Marketplace",
    href: "/marketplace",
    purpose: "Connect with suppliers, software, logistics, agencies and professional services.",
    intro:
      "The Marketplace is a directory of companies that help businesses operate. Basic listings are free. Paid placement, verification and editorial recommendation are kept separate and labelled separately — paying never buys a verified badge.",
    forWhom: "Businesses looking for partners, and the suppliers and service providers who serve them.",
    capabilities: [
      { name: "Free business listing requests", detail: "Submit your company for the directory through the inquiry form.", status: "live", href: "/promote?type=directory#inquiry" },
      { name: "Business profiles", detail: "Company profiles with services, markets served and contact routes.", status: "building" },
      { name: "Category directories", detail: "Browse suppliers, software, logistics, agencies and more.", status: "building" },
      { name: "Search and filters", detail: "Filter by category, country served and business size.", status: "planned" },
      { name: "Quote requests", detail: "Send a structured request for quotation to listed suppliers.", status: "planned" },
      { name: "Verification workflow", detail: "Documented checks before any listing is shown as verified.", status: "planned" },
    ],
  },
  promotion: {
    key: "promotion",
    name: "Business Promotion",
    short: "Promotion",
    href: "/promote",
    purpose: "Let companies reach business builders with clearly labelled, reviewed promotion.",
    intro:
      "Promotion is the other side of the platform: businesses that serve builders can reach them at the moment they need a supplier, a tool or a service. Every paid placement is reviewed before publication and labelled as sponsored.",
    forWhom: "Independent sellers and creators, growing companies, and enterprise advertisers.",
    capabilities: [
      { name: "Promotion inquiries", detail: "Tell us what you want to promote; we reply with options.", status: "live", href: "/promote#inquiry" },
      { name: "Manual campaign review", detail: "Every campaign is checked against our standards before it runs.", status: "live", href: "/advertising-standards" },
      { name: "Featured directory listings", detail: "Enhanced visibility in relevant Marketplace categories.", status: "planned" },
      { name: "Sponsored placements on tool pages", detail: "Relevant, labelled offers alongside tool results.", status: "planned" },
      { name: "Advertiser dashboard", detail: "Submit, track and renew campaigns in one place.", status: "planned" },
      { name: "Campaign reporting", detail: "Impressions, clicks and referral visits for each placement.", status: "planned" },
    ],
  },
  growth: {
    key: "growth",
    name: "Business Growth",
    short: "Growth",
    href: "/growth",
    purpose: "Improve profitability, marketing, operations and international reach.",
    intro:
      "Growth is for businesses that already trade. It brings together the decisions that move an operating business forward — where margin is lost, which channel to fund, which country to enter next — and links each to the tools that answer it.",
    forWhom: "Operating stores, brands, manufacturers and service companies looking for their next stage.",
    capabilities: [
      { name: "Profitability review", detail: "Start with margin and break-even, using the live calculators.", status: "live", href: "/tools/profit-margin-calculator" },
      { name: "Market expansion planner", detail: "Assess and sequence entry into new countries.", status: "planned" },
      { name: "Advertising profitability", detail: "Know your break-even ROAS before you scale ad spend.", status: "live", href: "/tools/advertising-profitability-calculator" },
      { name: "Customer lifetime value", detail: "Compare acquisition cost with what customers are worth.", status: "live", href: "/tools/customer-lifetime-value-calculator" },
      { name: "Marketing budget planner", detail: "Split spend across channels using your own cost per customer.", status: "live", href: "/tools/marketing-budget-planner" },
      { name: "Inventory reorder planning", detail: "Reorder points and safety stock so you neither sell out nor overstock.", status: "live", href: "/tools/inventory-reorder-planner" },
      { name: "Operational cost analysis", detail: "Find the cost lines that grow faster than revenue.", status: "planned" },
      { name: "Payment provider finder", detail: "Which payment services accept businesses in your country, with sources.", status: "live", href: "/tools/payment-provider-finder" },
      { name: "International selling guides", detail: "Country-specific guidance on shipping and tax.", status: "planned" },
      { name: "Automation planner", detail: "Identify repetitive work worth automating.", status: "live", href: "/tools/automation-planner" },
    ],
  },
};

export const divisionOrder: DivisionKey[] = ["builder", "intelligence", "tools", "marketplace", "promotion", "growth"];

/** The business route shown on the homepage. A genuine sequence. */
export const businessRoute: { stage: string; division: DivisionKey }[] = [
  { stage: "Idea", division: "builder" },
  { stage: "Research", division: "intelligence" },
  { stage: "Validation", division: "intelligence" },
  { stage: "Planning", division: "builder" },
  { stage: "Sourcing", division: "marketplace" },
  { stage: "Building", division: "builder" },
  { stage: "Launching", division: "builder" },
  { stage: "Marketing", division: "growth" },
  { stage: "Selling", division: "tools" },
  { stage: "Optimising", division: "tools" },
  { stage: "Expanding", division: "growth" },
];
