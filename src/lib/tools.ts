export type Status = "live" | "building" | "planned";

export const statusLabel: Record<Status, string> = {
  live: "Live",
  building: "In development",
  planned: "Planned",
};

export const toolCategories = [
  "Profit and pricing",
  "Finance and planning",
  "Ecommerce",
  "Marketing and SEO",
  "Suppliers and sourcing",
  "Shipping and fulfillment",
  "Market research",
  "International expansion",
  "Business automation",
] as const;

export type ToolCategory = (typeof toolCategories)[number];

export type Tool = {
  slug: string;
  name: string;
  summary: string;
  category: ToolCategory;
  status: Status;
  /** Only live tools have a page. */
  href?: string;
};

/**
 * The tool catalogue. Status is the source of truth for what is usable:
 * only "live" tools link to a working page. Keep this honest.
 */
export const tools: Tool[] = [
  {
    slug: "profit-margin-calculator",
    name: "Profit margin calculator",
    summary: "Work out gross margin, markup and profit per unit from cost and selling price, or find the price for a target margin.",
    category: "Profit and pricing",
    status: "live",
    href: "/tools/profit-margin-calculator",
  },
  {
    slug: "break-even-calculator",
    name: "Break-even calculator",
    summary: "Find the units and revenue needed to cover fixed costs, and the volume required to reach a profit target.",
    category: "Finance and planning",
    status: "live",
    href: "/tools/break-even-calculator",
  },
  { slug: "startup-cost-planner", name: "Startup cost planner", summary: "Itemise one-off and monthly launch costs and see how long your budget lasts.", category: "Finance and planning", status: "building" },
  { slug: "roi-calculator", name: "Return on investment calculator", summary: "Compare the return and payback period of a business investment.", category: "Finance and planning", status: "building" },
  { slug: "dropshipping-profit", name: "Dropshipping profit calculator", summary: "Profit per order after product cost, shipping, payment fees and ad spend.", category: "Ecommerce", status: "planned" },
  { slug: "amazon-fba-profit", name: "Amazon FBA profit calculator", summary: "Estimate profit after referral, fulfilment and storage fees, with fee sources dated.", category: "Ecommerce", status: "planned" },
  { slug: "fba-vs-fbm", name: "FBA vs FBM comparison", summary: "Compare fulfilment by Amazon with fulfilling orders yourself for a given product.", category: "Ecommerce", status: "planned" },
  { slug: "store-platform-cost", name: "Store platform cost comparison", summary: "Compare the running costs of hosted and self-hosted store platforms.", category: "Ecommerce", status: "planned" },
  { slug: "landed-cost", name: "Landed cost calculator", summary: "Total cost of an imported product including freight, duty and handling.", category: "Shipping and fulfillment", status: "planned" },
  { slug: "inventory-planner", name: "Inventory reorder planner", summary: "Reorder points and safety stock from lead time and sales velocity.", category: "Shipping and fulfillment", status: "planned" },
  { slug: "ad-profitability", name: "Advertising profitability calculator", summary: "Break-even ROAS and maximum cost per acquisition for a campaign.", category: "Marketing and SEO", status: "planned" },
  { slug: "cac-ltv", name: "Customer acquisition and lifetime value", summary: "Compare what a customer costs to acquire with what they are worth.", category: "Marketing and SEO", status: "planned" },
  { slug: "marketing-budget", name: "Marketing budget planner", summary: "Allocate a marketing budget across channels and track planned spend.", category: "Marketing and SEO", status: "planned" },
  { slug: "supplier-comparison", name: "Supplier comparison worksheet", summary: "Score suppliers on landed cost, lead time, minimum order and reliability.", category: "Suppliers and sourcing", status: "planned" },
  { slug: "cash-flow", name: "Cash-flow planner", summary: "Project monthly cash in and out and see when funding is needed.", category: "Finance and planning", status: "planned" },
  { slug: "market-comparison", name: "Country market comparison", summary: "Compare target markets on sourced economic and ecommerce indicators.", category: "Market research", status: "planned" },
  { slug: "payment-provider-finder", name: "Payment provider finder", summary: "Check which payment providers state support for your country and business type.", category: "International expansion", status: "planned" },
  { slug: "workflow-planner", name: "Automation workflow planner", summary: "Map a repetitive process and identify the steps worth automating.", category: "Business automation", status: "planned" },
];

export const liveTools = tools.filter((t) => t.status === "live");
