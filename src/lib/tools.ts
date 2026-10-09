export type Status = "live" | "building" | "planned";

export const statusLabel: Record<Status, string> = {
  live: "Live",
  building: "In development",
  planned: "Planned",
};

export const toolCategories = [
  "Business planning",
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
  {
    slug: "business-model-comparison",
    name: "Business model comparison",
    summary: "Compare nine business models on capital, stock risk, margin, speed, control and scalability, ranked by your priorities.",
    category: "Business planning",
    status: "live",
    href: "/tools/business-model-comparison",
  },
  { slug: "startup-cost-planner", name: "Startup cost planner", summary: "Itemise one-off and monthly launch costs and see how long your budget lasts.", category: "Finance and planning", status: "live", href: "/tools/startup-cost-planner" },
  { slug: "roi-calculator", name: "Return on investment calculator", summary: "Return, annualised return and payback period for any business investment.", category: "Finance and planning", status: "live", href: "/tools/roi-calculator" },
  { slug: "dropshipping-profit", name: "Dropshipping profit calculator", summary: "Real profit per order after supplier, shipping, payment fees, advertising and refunds.", category: "Ecommerce", status: "live", href: "/tools/dropshipping-profit-calculator" },
  { slug: "amazon-fba-profit", name: "Amazon FBA calculator", summary: "Profit per unit after referral, fulfilment and storage fees and advertising, compared with fulfilling yourself.", category: "Ecommerce", status: "live", href: "/tools/amazon-fba-calculator" },
  { slug: "store-platform-cost", name: "Store platform cost comparison", summary: "Compare the running costs of hosted and self-hosted store platforms.", category: "Ecommerce", status: "planned" },
  { slug: "landed-cost-calculator", name: "Landed cost calculator", summary: "True per-unit cost of imported goods, including freight, insurance, duty, import tax and fees.", category: "Shipping and fulfillment", status: "live", href: "/tools/landed-cost-calculator" },
  { slug: "inventory-planner", name: "Inventory reorder planner", summary: "Reorder point, safety stock and order quantity from sales rate and supplier lead time.", category: "Shipping and fulfillment", status: "live", href: "/tools/inventory-reorder-planner" },
  { slug: "ad-profitability", name: "Advertising profitability calculator", summary: "Break-even ROAS, the most you can pay per sale, and whether a campaign makes a profit.", category: "Marketing and SEO", status: "live", href: "/tools/advertising-profitability-calculator" },
  { slug: "cac-ltv", name: "Customer acquisition and lifetime value", summary: "Compare what a customer costs to win with what they are worth, and the payback period.", category: "Marketing and SEO", status: "live", href: "/tools/customer-lifetime-value-calculator" },
  { slug: "marketing-budget", name: "Marketing budget planner", summary: "Split a monthly budget across channels and estimate new customers and blended cost per customer.", category: "Marketing and SEO", status: "live", href: "/tools/marketing-budget-planner" },
  { slug: "supplier-comparison", name: "Supplier comparison worksheet", summary: "Compare up to four supplier quotes on cost, minimum-order cash, lead time, quality and reliability.", category: "Suppliers and sourcing", status: "live", href: "/tools/supplier-comparison" },
  { slug: "cash-flow", name: "Cash-flow planner", summary: "Project your bank balance month by month, see when cash runs short and how much funding you need.", category: "Finance and planning", status: "live", href: "/tools/cash-flow-planner" },
  { slug: "market-comparison", name: "Country market comparison", summary: "Compare target markets on sourced economic and ecommerce indicators.", category: "Market research", status: "planned" },
  { slug: "payment-provider-finder", name: "Payment provider finder", summary: "See which payment providers accept businesses in your country, with sources and the date checked.", category: "International expansion", status: "live", href: "/tools/payment-provider-finder" },
  { slug: "workflow-planner", name: "Automation planner", summary: "Find the repetitive tasks worth automating first, and the hours and money they free each month.", category: "Business automation", status: "live", href: "/tools/automation-planner" },
];

export const liveTools = tools.filter((t) => t.status === "live");
