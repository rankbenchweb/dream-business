/**
 * Editorial assessment of common business models. These are general
 * patterns, not measured data: every rating is relative, and a specific
 * business can sit well outside them. Shown with an Estimate label.
 */
export type Level = 1 | 2 | 3;

export type Factor = "capital" | "inventory" | "margin" | "speed" | "control" | "scale";

export const factors: { key: Factor; label: string; levels: [string, string, string]; good: Level; priority: string }[] = [
  { key: "capital", label: "Startup capital", levels: ["Low", "Medium", "High"], good: 1, priority: "Low startup capital" },
  { key: "inventory", label: "Inventory risk", levels: ["Low", "Medium", "High"], good: 1, priority: "Little stock risk" },
  { key: "margin", label: "Margin potential", levels: ["Low", "Medium", "High"], good: 3, priority: "Higher margins" },
  { key: "speed", label: "Time to first sale", levels: ["Fast", "Medium", "Slow"], good: 1, priority: "Fast first sale" },
  { key: "control", label: "Control of product", levels: ["Low", "Medium", "High"], good: 3, priority: "Control over the product" },
  { key: "scale", label: "Scales beyond your time", levels: ["Low", "Medium", "High"], good: 3, priority: "Grows without my hours" },
];

export type BusinessModel = {
  slug: string;
  name: string;
  summary: string;
  ratings: Record<Factor, Level>;
  bestFor: string;
  watchOut: string;
  tools: { label: string; href: string }[];
};

export const businessModels: BusinessModel[] = [
  {
    slug: "dropshipping",
    name: "Dropshipping",
    summary: "You sell online; a supplier stores and ships each order directly to the customer.",
    ratings: { capital: 1, inventory: 1, margin: 1, speed: 1, control: 1, scale: 2 },
    bestFor: "Testing product ideas and learning online marketing with little money at risk.",
    watchOut: "Thin margins, slow or inconsistent shipping, and heavy dependence on paid advertising and on suppliers you don't control.",
    tools: [
      { label: "Advertising profitability calculator", href: "/tools/advertising-profitability-calculator" },
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
    ],
  },
  {
    slug: "print-on-demand",
    name: "Print on demand",
    summary: "Your designs are printed on products only after a customer orders, by a print partner.",
    ratings: { capital: 1, inventory: 1, margin: 1, speed: 1, control: 2, scale: 2 },
    bestFor: "Creators with designs or an audience who want to sell merchandise without holding stock.",
    watchOut: "Per-item production costs are high, so margins are slim; quality and delivery depend on the print partner.",
    tools: [{ label: "Profit margin calculator", href: "/tools/profit-margin-calculator" }],
  },
  {
    slug: "private-label",
    name: "Private label brand",
    summary: "A manufacturer makes products to your specification, sold under your own brand.",
    ratings: { capital: 3, inventory: 3, margin: 3, speed: 3, control: 3, scale: 3 },
    bestFor: "Building a brand with its own products, pricing power and long-term value.",
    watchOut: "Minimum orders tie up cash in stock before you know it sells; product development and sourcing take months.",
    tools: [
      { label: "Landed cost calculator", href: "/tools/landed-cost-calculator" },
      { label: "Startup cost planner", href: "/tools/startup-cost-planner" },
    ],
  },
  {
    slug: "marketplace-fulfilment",
    name: "Marketplace with fulfilment",
    summary: "You send stock to a marketplace's warehouses (Amazon FBA, for example) and it handles delivery.",
    ratings: { capital: 3, inventory: 3, margin: 2, speed: 2, control: 2, scale: 3 },
    bestFor: "Reaching customers who already shop on a large marketplace, with storage and delivery handled for you.",
    watchOut: "Marketplace and fulfilment fees take a large share, the platform's rules can change, and you own little of the customer relationship.",
    tools: [
      { label: "Landed cost calculator", href: "/tools/landed-cost-calculator" },
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
    ],
  },
  {
    slug: "wholesale-resale",
    name: "Wholesale and resale",
    summary: "You buy existing branded products in bulk and resell them at a markup.",
    ratings: { capital: 2, inventory: 2, margin: 1, speed: 2, control: 1, scale: 2 },
    bestFor: "Selling products with proven demand, without developing your own.",
    watchOut: "Competing with other resellers on the same products pushes prices down; you may need brand approval to sell.",
    tools: [
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
      { label: "Break-even calculator", href: "/tools/break-even-calculator" },
    ],
  },
  {
    slug: "own-production",
    name: "Handmade or own production",
    summary: "You make the products yourself or in a small workshop you run.",
    ratings: { capital: 1, inventory: 2, margin: 2, speed: 2, control: 3, scale: 1 },
    bestFor: "Makers with a craft or recipe that customers value for its quality or originality.",
    watchOut: "Output is limited by your hours; growing means hiring, equipment or outsourcing, which changes the business.",
    tools: [
      { label: "Startup cost planner", href: "/tools/startup-cost-planner" },
      { label: "Break-even calculator", href: "/tools/break-even-calculator" },
    ],
  },
  {
    slug: "digital-products",
    name: "Digital products",
    summary: "Courses, templates, e-books, software assets or media, delivered as downloads or access.",
    ratings: { capital: 1, inventory: 1, margin: 3, speed: 2, control: 3, scale: 3 },
    bestFor: "People with expertise or an audience who can package knowledge once and sell it many times.",
    watchOut: "Selling usually needs an audience or reputation first; copying and refund requests are real risks.",
    tools: [{ label: "Advertising profitability calculator", href: "/tools/advertising-profitability-calculator" }],
  },
  {
    slug: "services-agency",
    name: "Services or agency",
    summary: "You sell your skills, or your team's, as projects or ongoing work: design, marketing, development, consulting.",
    ratings: { capital: 1, inventory: 1, margin: 2, speed: 1, control: 3, scale: 1 },
    bestFor: "Skilled professionals who want income quickly with almost no upfront cost.",
    watchOut: "Revenue is tied to hours worked; growing requires hiring and managing people, and client concentration is a risk.",
    tools: [{ label: "Break-even calculator", href: "/tools/break-even-calculator" }],
  },
  {
    slug: "software-saas",
    name: "Software as a service",
    summary: "Customers pay a subscription to use software you build and run.",
    ratings: { capital: 3, inventory: 1, margin: 3, speed: 3, control: 3, scale: 3 },
    bestFor: "Teams that can build software solving a recurring problem businesses will pay for monthly.",
    watchOut: "Building takes a long time before revenue, customers expect constant improvement and support, and churn erodes growth.",
    tools: [
      { label: "Startup cost planner", href: "/tools/startup-cost-planner" },
      { label: "Return on investment calculator", href: "/tools/roi-calculator" },
    ],
  },
];

/** Score = how many chosen priorities a model meets at its best level; partial credit for the middle level. */
export function fitScore(m: BusinessModel, priorities: Factor[]) {
  return priorities.reduce((score, key) => {
    const f = factors.find((x) => x.key === key)!;
    const v = m.ratings[key];
    if (v === f.good) return score + 2;
    if (v === 2) return score + 1;
    return score;
  }, 0);
}
