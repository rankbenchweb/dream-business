import { listBusinessHref } from "./supabase/config";

/**
 * Central site configuration. Change the production URL here (or via
 * NEXT_PUBLIC_SITE_URL) once a domain is confirmed.
 */
export const site = {
  name: "The Dream Business",
  identity: "The Business Builder",
  tagline: "Where businesses build their future.",
  description:
    "The Dream Business is a global business-building platform: research, planning tools, supplier and service discovery, and transparent business promotion for founders, growing companies and enterprises.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thedreambusiness.example").replace(/\/$/, ""),
  locale: "en",
} as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = {
  label: string;
  href: string;
  summary: string;
  links: NavLink[];
};

/** Primary navigation. Every href must resolve to a real page. */
export const primaryNav: NavGroup[] = [
  {
    label: "Business Builder",
    href: "/business-builder",
    summary: "Plan, launch and restructure a business with guided planning tools.",
    links: [
      { label: "Business Growth Navigator", href: "/navigator", description: "A step-by-step plan for your goal" },
      { label: "Overview", href: "/business-builder", description: "What the Builder covers and what is live today" },
      { label: "Start a business", href: "/business-builder#start", description: "From first idea to launch plan" },
      { label: "Expand an established company", href: "/business-builder#expand", description: "New lines, new markets, new models" },
    ],
  },
  {
    label: "Intelligence",
    href: "/intelligence",
    summary: "Research markets, products and competitors with clearly sourced information.",
    links: [
      { label: "Overview", href: "/intelligence", description: "Research capabilities and roadmap" },
      { label: "Data standards", href: "/intelligence#standards", description: "How sources, dates and estimates are labelled" },
      { label: "Verification standards", href: "/verification-standards", description: "What a verified label means here" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    summary: "Calculators and utilities for pricing, profit, finance and operations.",
    links: [
      { label: "All business tools", href: "/tools", description: "Search and filter the full catalogue" },
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator", description: "Margin, markup and profit per unit" },
      { label: "Break-even calculator", href: "/tools/break-even-calculator", description: "Units and revenue needed to cover costs" },
    ],
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    summary: "Find suppliers, software, logistics and professional services.",
    links: [
      { label: "Marketplace overview", href: "/marketplace", description: "Directory categories and listing standards" },
      { label: "List your business", href: listBusinessHref, description: "Basic listings are free" },
      { label: "Verification standards", href: "/verification-standards", description: "How listings are checked" },
    ],
  },
  {
    label: "Promote Your Business",
    href: "/promote",
    summary: "Reach founders and business owners with clearly labelled promotion.",
    links: [
      { label: "Business promotion", href: "/promote", description: "Self-service, growth and enterprise options" },
      { label: "Enterprise campaigns", href: "/promote#enterprise", description: "Custom proposals for larger companies" },
      { label: "Advertising standards", href: "/advertising-standards", description: "What we accept and how it is labelled" },
      { label: "Start a promotion inquiry", href: "/promote#inquiry", description: "Tell us what you want to promote" },
    ],
  },
  {
    label: "Learn",
    href: "/learn",
    summary: "Guides, explainers and tool documentation.",
    links: [
      { label: "Learning library", href: "/learn", description: "Topics and editorial approach" },
      { label: "Editorial policy", href: "/editorial-policy", description: "How guides are researched and updated" },
    ],
  },
  {
    label: "Business Growth",
    href: "/growth",
    summary: "Improve profitability, operations and international reach.",
    links: [
      { label: "Growth overview", href: "/growth", description: "Planning, expansion and operations" },
      { label: "Improve profitability", href: "/growth#profitability", description: "Tools for margin and cost decisions" },
      { label: "Expand internationally", href: "/growth#international", description: "Market entry and cross-border selling" },
    ],
  },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "Business Builder", href: "/business-builder" },
      { label: "Business Growth Navigator", href: "/navigator" },
      { label: "Business Intelligence", href: "/intelligence" },
      { label: "Business Tools", href: "/tools" },
      { label: "Business Marketplace", href: "/marketplace" },
      { label: "Business Growth", href: "/growth" },
      { label: "Learn", href: "/learn" },
    ],
  },
  {
    heading: "For businesses",
    links: [
      { label: "Business promotion", href: "/promote" },
      { label: "Advertiser information", href: "/advertising-standards" },
      { label: "Submit a business", href: listBusinessHref },
      { label: "Business directory", href: "/marketplace" },
    ],
  },
  {
    heading: "Standards",
    links: [
      { label: "Editorial policy", href: "/editorial-policy" },
      { label: "Data and verification standards", href: "/verification-standards" },
      { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About The Dream Business", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];
