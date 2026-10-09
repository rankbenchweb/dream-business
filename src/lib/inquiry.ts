/**
 * Shared inquiry schema, validated identically in the browser and on the
 * server. No external validation dependency.
 */
export const inquiryTypes = [
  { value: "directory", label: "Free directory listing" },
  { value: "self-service", label: "Promotion for an independent business" },
  { value: "growth", label: "Growth advertising for a company" },
  { value: "enterprise", label: "Enterprise campaign proposal" },
  { value: "partnership", label: "Partnership or affiliate program" },
  { value: "general", label: "General question" },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]["value"];

export const budgetRanges = ["Not sure yet", "Under $250", "$250 to $1,000", "$1,000 to $5,000", "$5,000 to $25,000", "Over $25,000"] as const;

export type InquiryInput = {
  type: string;
  name: string;
  email: string;
  company: string;
  website: string;
  country: string;
  promote: string;
  budget: string;
  message: string;
  consent: boolean;
  /** Honeypot. Must stay empty. */
  fax?: string;
};

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function validateInquiry(input: InquiryInput): InquiryErrors {
  const e: InquiryErrors = {};
  if (!inquiryTypes.some((t) => t.value === input.type)) e.type = "Choose what you'd like to discuss.";
  if (input.name.trim().length < 2) e.name = "Enter your name.";
  else if (input.name.length > 120) e.name = "Use 120 characters or fewer.";
  if (!EMAIL.test(input.email.trim())) e.email = "Enter an email address we can reply to, like name@company.com.";
  if (input.type !== "general" && input.company.trim().length < 2) e.company = "Enter your business or organisation name.";
  else if (input.company.length > 160) e.company = "Use 160 characters or fewer.";
  if (normaliseUrl(input.website) === null) e.website = "Enter a full website address, like company.com.";
  if (input.country.length > 80) e.country = "Use 80 characters or fewer.";
  if (input.message.trim().length < 20) e.message = "Tell us a little more: at least 20 characters.";
  else if (input.message.length > 4000) e.message = "Keep the message under 4,000 characters.";
  if (!input.consent) e.consent = "Confirm we can use these details to reply to you.";
  return e;
}
