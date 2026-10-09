/**
 * Business Growth Navigator, version 1: rule-based.
 * Turns a goal and a few answers into an ordered plan that links to
 * platform tools. It recommends; it never claims to have acted.
 */
import { providers, type MarketCode } from "./paymentProviders";

export type GoalKey = "start" | "launch" | "suppliers" | "profit" | "international" | "customers" | "automate" | "payments";
export type Stage = "idea" | "new" | "established";
export type Sells = "physical" | "digital" | "services";

export const goals: { key: GoalKey; title: string; detail: string }[] = [
  { key: "start", title: "Start a business", detail: "Choose a model, cost it and plan the launch." },
  { key: "launch", title: "Launch a new product", detail: "Price it, source it and plan its first sales." },
  { key: "suppliers", title: "Find and compare suppliers", detail: "True costs, minimum orders and reorder plans." },
  { key: "profit", title: "Increase profitability", detail: "Find where margin is lost and fix it first." },
  { key: "customers", title: "Win more customers", detail: "Set advertising limits and plan the budget." },
  { key: "payments", title: "Get paid online", detail: "Find payment services that accept your business." },
  { key: "international", title: "Expand internationally", detail: "Payments, import costs and cash for a new market." },
  { key: "automate", title: "Automate operations", detail: "Free hours from repetitive work." },
];

export const stageOptions: { value: Stage; label: string }[] = [
  { value: "idea", label: "Still at the idea stage" },
  { value: "new", label: "Trading for under a year" },
  { value: "established", label: "Established business" },
];

export const sellsOptions: { value: Sells; label: string }[] = [
  { value: "physical", label: "Physical products" },
  { value: "digital", label: "Digital products or software" },
  { value: "services", label: "Services" },
];

export type Answers = { stage: Stage; sells: Sells; country: MarketCode | "other" };

export type PlanStep = { title: string; why: string; href: string; action: string };
export type Plan = { objective: string; assumptions: string[]; steps: PlanStep[]; risks: string[]; first: string };

const T = {
  models: { title: "Compare business models", href: "/tools/business-model-comparison", action: "Open the model comparison" },
  startup: { title: "Cost the launch", href: "/tools/startup-cost-planner", action: "Open the startup cost planner" },
  breakEven: { title: "Find your break-even point", href: "/tools/break-even-calculator", action: "Open the break-even calculator" },
  margin: { title: "Set prices that leave a margin", href: "/tools/profit-margin-calculator", action: "Open the profit margin calculator" },
  landed: { title: "Work out the true import cost", href: "/tools/landed-cost-calculator", action: "Open the landed cost calculator" },
  suppliers: { title: "Compare supplier quotes", href: "/tools/supplier-comparison", action: "Open the supplier comparison" },
  reorder: { title: "Plan stock and reorders", href: "/tools/inventory-reorder-planner", action: "Open the reorder planner" },
  payments: { title: "Choose how you get paid", href: "/tools/payment-provider-finder", action: "Open the payment provider finder" },
  ads: { title: "Know your advertising limits", href: "/tools/advertising-profitability-calculator", action: "Open the advertising calculator" },
  budget: { title: "Plan the marketing budget", href: "/tools/marketing-budget-planner", action: "Open the marketing budget planner" },
  ltv: { title: "Check what customers are worth", href: "/tools/customer-lifetime-value-calculator", action: "Open the lifetime value calculator" },
  cash: { title: "Project your cash", href: "/tools/cash-flow-planner", action: "Open the cash-flow planner" },
  roi: { title: "Test the return on investment", href: "/tools/roi-calculator", action: "Open the ROI calculator" },
  automate: { title: "Find tasks worth automating", href: "/tools/automation-planner", action: "Open the automation planner" },
  dropship: { title: "Check profit per order", href: "/tools/dropshipping-profit-calculator", action: "Open the dropshipping calculator" },
  fba: { title: "Check marketplace profit", href: "/tools/amazon-fba-calculator", action: "Open the Amazon FBA calculator" },
} as const;

type Key = keyof typeof T;
const step = (k: Key, why: string): PlanStep => ({ ...T[k], why });

const countryLabel: Record<string, string> = {
  us: "the United States", gb: "the United Kingdom", eu: "the European Union", pk: "Pakistan", ae: "the UAE",
  sa: "Saudi Arabia", in: "India", ca: "Canada", au: "Australia", other: "your country",
};

/** Providers that don't list the user's country among available or limited ones. */
function paymentNote(country: Answers["country"]): string | null {
  if (country === "other") return "Check which payment services accept businesses in your country before you choose a platform or model.";
  const missing = providers.filter((p) => ["stripe", "paypal", "shopify-payments"].includes(p.slug) && p.markets[country].status === "unavailable").map((p) => p.name);
  if (!missing.length) return null;
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}` : missing[0];
  return `${list} ${missing.length === 1 ? "is" : "are"} not available to businesses in ${countryLabel[country]}. Plan payments early, because they can decide which platform and model will work.`;
}

export function buildPlan(goal: GoalKey, a: Answers): Plan {
  const phys = a.sells === "physical";
  const digital = a.sells === "digital";
  const early = a.stage !== "established";
  const where = countryLabel[a.country];
  const stageText = stageOptions.find((s) => s.value === a.stage)!.label.toLowerCase();
  const sellsText = sellsOptions.find((s) => s.value === a.sells)!.label.toLowerCase();
  const assumptions = [`You are ${stageText === "established business" ? "an established business" : stageText}.`, `You sell ${sellsText}.`, `Your business is based in ${where}.`];
  const risks: string[] = [];
  const pay = paymentNote(a.country);
  const steps: PlanStep[] = [];
  let objective = "";

  switch (goal) {
    case "start":
      objective = "Choose a business you can afford to start, price it to make money, and launch with enough cash to reach steady sales.";
      if (a.stage === "idea") steps.push(step("models", "Pick the model whose capital, risk and time needs match yours before you spend anything."));
      steps.push(step("payments", "Confirm you can accept payments from your country with the model you chose."));
      if (phys) steps.push(step("suppliers", "Get at least three quotes; compare cost, minimum order and lead time, not price alone."));
      if (phys) steps.push(step("landed", "If you import, add freight, duty and fees so your prices start from the real cost."));
      steps.push(step("margin", "Set a price that leaves a healthy margin after every per-unit cost."));
      steps.push(step("startup", "List one-off and monthly costs and see how many months your budget lasts."));
      steps.push(step("breakEven", "Find how many sales a month cover your fixed costs, and judge whether that is realistic."));
      steps.push(step("cash", "Project cash for the first year so a slow start doesn't end the business."));
      risks.push("Launch costs and the time to first sales are usually higher than planned. Keep a cash buffer of several months.");
      if (phys) risks.push("Minimum orders tie up cash in stock before you know it sells. Start with the smallest order a supplier accepts.");
      break;
    case "launch":
      objective = "Launch a product that is priced for profit, reliably supplied, and backed by a realistic marketing plan.";
      steps.push(step("margin", "Price from the full cost per unit, and check the margin survives discounts."));
      if (phys) steps.push(step("suppliers", "Compare suppliers on landed cost, minimum order and reliability."), step("landed", "Include freight, duty and fees in the unit cost."));
      steps.push(step("ads", "Know the most you can pay per sale before you start advertising."));
      steps.push(step("budget", "Split the launch budget across channels and estimate first customers."));
      if (phys) steps.push(step("reorder", "Set a reorder point so a successful launch doesn't sell out."));
      steps.push(step("cash", "Make sure stock and launch spend don't leave a cash gap."));
      risks.push("New products usually sell more slowly at first. Test with a small batch or budget before committing fully.");
      break;
    case "suppliers":
      objective = "Choose suppliers on true cost, cash needed and reliability, and keep stock flowing without overbuying.";
      steps.push(step("suppliers", "Score up to four quotes against your own priorities."));
      steps.push(step("landed", "Compare landed cost, not the supplier price: shipping and duty change the ranking."));
      steps.push(step("margin", "Check each option still leaves the margin you need at your selling price."));
      steps.push(step("reorder", "Use the chosen supplier's lead time to set reorder points and safety stock."));
      steps.push(step("cash", "Make sure the minimum order fits your cash plan."));
      risks.push("Order samples and agree quality standards and defect handling in writing before the first full order.");
      break;
    case "profit":
      objective = "Find where profit is lost per sale and per month, and fix the biggest leak first.";
      steps.push(step("margin", "Check every product's real margin after all per-unit costs."));
      if (phys) steps.push(step("landed", "Re-check imported products: shipping and duty costs drift upward."));
      steps.push(step("ads", "Compare your actual cost per sale with the most you can afford."));
      if (!early) steps.push(step("ltv", "See whether repeat customers justify what you pay to win them."));
      steps.push(step("breakEven", "See how far above break-even you trade, and what a price change would do."));
      steps.push(step("automate", "Free paid hours spent on repetitive tasks."));
      risks.push("Cutting costs that customers notice, such as packaging or delivery speed, can cost more in lost sales than it saves.");
      break;
    case "customers":
      objective = "Win customers at a cost the business can sustain, and spend marketing money where it works best.";
      steps.push(step("ads", "Set your break-even return on ad spend and maximum cost per sale."));
      steps.push(step("budget", "Split spend across channels using your own cost per customer."));
      steps.push(step("ltv", "Check what a customer is worth over time, and how long the cost takes to earn back."));
      steps.push(step("cash", "Make sure faster growth doesn't drain cash before customers pay back."));
      risks.push("Costs per customer rise as you spend more in one channel. Increase budgets gradually and measure.");
      break;
    case "payments":
      objective = "Set up reliable ways to get paid by customers and clients, using services available to your business.";
      steps.push(step("payments", "See which services accept businesses in your country, and for what you sell."));
      steps.push(step("margin", "Include payment fees in your per-unit costs so prices still cover them."));
      if (digital) steps.push({ ...T.payments, title: "Consider a merchant of record", why: "For digital products, a merchant of record can sell for you and handle sales tax in many countries.", action: "Compare merchants of record" });
      steps.push(step("cash", "Allow for payout delays and holds when planning cash."));
      risks.push("Providers can hold or reserve funds, especially for new accounts. Don't depend on a single provider for all revenue.");
      break;
    case "international":
      objective = "Enter a new market with payments, landed costs and cash planned before the first order.";
      steps.push(step("payments", "Check you can be paid by customers in the new market."));
      if (phys) steps.push(step("landed", "Cost shipping, duty and import tax into the new market."));
      steps.push(step("margin", "Price for the new market from its full landed cost."));
      steps.push(step("budget", "Plan marketing for the new market separately; costs per customer will differ."));
      steps.push(step("cash", "Fund the time before international sales arrive."));
      risks.push("Tax registration, product rules and consumer law differ by country. Take local professional advice before launching.");
      break;
    case "automate":
      objective = "Free the most hours from repetitive work, starting with the task that returns the most.";
      steps.push(step("automate", "List repetitive tasks and rank them by hours saved."));
      steps.push(step("roi", "Compare the value of time saved with the cost of the tools and setup."));
      steps.push(step("cash", "Include tool subscriptions in your monthly costs."));
      risks.push("Automating a broken process makes it fail faster. Fix and simplify the process first, then automate.");
      break;
  }

  if (pay && goal !== "automate") risks.unshift(pay);
  const first = steps[0] ? `${steps[0].title}: ${steps[0].why}` : "Choose a goal to begin.";
  return { objective, assumptions, steps, risks, first };
}
