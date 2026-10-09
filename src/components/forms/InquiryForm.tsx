"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { budgetRanges, inquiryTypes, validateInquiry, type InquiryErrors, type InquiryInput } from "@/lib/inquiry";
import { promotableTypes } from "@/lib/marketplace";
import { markets, useMarket } from "@/lib/market";
import { Button, cx } from "@/components/ui";
import { INQUIRY_TYPE_EVENT } from "./InquiryTypeLink";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const fieldBase =
  "mt-2 w-full rounded-[var(--radius-sm)] border bg-surface px-3 text-base text-ink placeholder:text-muted/70 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20";

function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One form for promotion, listing and contact inquiries. `defaultType`
 * presets the subject; a `?type=` URL parameter overrides it.
 */
export function InquiryForm({ defaultType = "self-service", variant = "promotion" }: { defaultType?: string; variant?: "promotion" | "contact" }) {
  const market = useMarket();
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [values, setValues] = useState<InquiryInput>({
    type: defaultType,
    name: "",
    email: "",
    company: "",
    website: "",
    country: "",
    promote: "",
    budget: "",
    message: "",
    consent: false,
    fax: "",
  });

  useEffect(() => {
    const apply = (t: string | null) => {
      if (t && inquiryTypes.some((x) => x.value === t)) setValues((v) => ({ ...v, type: t }));
    };
    apply(new URLSearchParams(window.location.search).get("type"));
    const onType = (e: Event) => apply((e as CustomEvent<string>).detail);
    window.addEventListener(INQUIRY_TYPE_EVENT, onType);
    return () => window.removeEventListener(INQUIRY_TYPE_EVENT, onType);
  }, []);

  const set = <K extends keyof InquiryInput>(k: K, v: InquiryInput[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const describedBy = (k: keyof InquiryInput) => (errors[k] ? `${id(k)}-err` : undefined);
  const border = (k: keyof InquiryInput) => (errors[k] ? "border-danger" : "border-line-strong hover:border-ink");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateInquiry(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, country: values.country || market.label, sourcePath: window.location.pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState({ kind: "sent" });
        return;
      }
      if (data.fields) setErrors(data.fields);
      setState({ kind: "error", message: data.error ?? "Your inquiry couldn't be sent. Please try again." });
    } catch {
      setState({ kind: "error", message: "No connection to the server. Check your internet connection and try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-md)] border border-signal/30 bg-signal-soft p-8">
        <h3 className="text-xl">Inquiry sent</h3>
        <p className="mt-2 text-slate">
          Thanks, {values.name.split(" ")[0]}. We review every inquiry by hand and will reply to {values.email}. Promotions are never published until you
          have agreed the details and the campaign has passed review.
        </p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-signal-strong underline underline-offset-4">
          Back to the homepage
        </Link>
      </div>
    );
  }

  const isGeneral = values.type === "general";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-6" aria-describedby={`${uid}-req`}>
      <p id={`${uid}-req`} className="text-sm text-muted">
        All fields are required unless marked optional.
      </p>

      <Field id={id("type")} label={variant === "contact" ? "What is this about?" : "What would you like to discuss?"} error={errors.type}>
        <select
          id={id("type")}
          name="type"
          value={values.type}
          onChange={(e) => set("type", e.target.value)}
          className={cx(fieldBase, "h-12", border("type"))}
        >
          {inquiryTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id("name")} label="Your name" error={errors.name}>
          <input id={id("name")} name="name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name || undefined} aria-describedby={describedBy("name")} className={cx(fieldBase, "h-12", border("name"))} />
        </Field>
        <Field id={id("email")} label="Work email" error={errors.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email || undefined} aria-describedby={describedBy("email")} className={cx(fieldBase, "h-12", border("email"))} />
        </Field>
        <Field id={id("company")} label="Business or organisation" optional={isGeneral} error={errors.company}>
          <input id={id("company")} name="company" autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} aria-invalid={!!errors.company || undefined} aria-describedby={describedBy("company")} className={cx(fieldBase, "h-12", border("company"))} />
        </Field>
        <Field id={id("website")} label="Website" optional error={errors.website}>
          <input id={id("website")} name="website" inputMode="url" autoComplete="url" placeholder="company.com" value={values.website} onChange={(e) => set("website", e.target.value)} aria-invalid={!!errors.website || undefined} aria-describedby={describedBy("website")} className={cx(fieldBase, "h-12", border("website"))} />
        </Field>
        <Field id={id("country")} label="Main market" optional error={errors.country}>
          <select id={id("country")} name="country" value={values.country} onChange={(e) => set("country", e.target.value)} className={cx(fieldBase, "h-12", border("country"))}>
            <option value="">{market.label} (from your market setting)</option>
            {markets.map((m) => (
              <option key={m.code} value={m.label}>
                {m.label}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>
        {!isGeneral ? (
          <Field id={id("promote")} label="What you offer" optional error={errors.promote}>
            <select id={id("promote")} name="promote" value={values.promote} onChange={(e) => set("promote", e.target.value)} className={cx(fieldBase, "h-12", border("promote"))}>
              <option value="">Choose a category</option>
              {promotableTypes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        {variant === "promotion" && !["directory", "general", "partnership"].includes(values.type) ? (
          <Field id={id("budget")} label="Approximate budget" optional hint="In US dollars, for the whole campaign" error={errors.budget}>
            <select id={id("budget")} name="budget" value={values.budget} onChange={(e) => set("budget", e.target.value)} className={cx(fieldBase, "h-12", border("budget"))}>
              <option value="">Prefer not to say</option>
              {budgetRanges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      <Field
        id={id("message")}
        label={isGeneral ? "Your message" : "Tell us about it"}
        hint={isGeneral ? undefined : "What you offer, who it is for, and what you hope to achieve"}
        error={errors.message}
      >
        <textarea id={id("message")} name="message" rows={5} value={values.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message || undefined} aria-describedby={describedBy("message")} className={cx(fieldBase, "py-3", border("message"))} />
      </Field>

      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("fax")}>Leave this field empty</label>
        <input id={id("fax")} name="fax" tabIndex={-1} autoComplete="off" value={values.fax} onChange={(e) => set("fax", e.target.value)} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-slate">
          <input type="checkbox" name="consent" checked={values.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent || undefined} aria-describedby={describedBy("consent")} className="mt-0.5 size-4 shrink-0 accent-[var(--color-signal)]" />
          <span>
            You can use these details to reply to this inquiry. See the{" "}
            <Link href="/privacy" className="font-semibold text-signal-strong underline underline-offset-4">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p id={`${id("consent")}-err`} className="mt-1.5 text-xs font-medium text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      {state.kind === "error" ? (
        <div role="alert" className="rounded-[var(--radius-sm)] border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      <Button type="submit" disabled={state.kind === "sending"} className="w-full sm:w-auto">
        {state.kind === "sending" ? "Sending inquiry…" : "Send inquiry"}
      </Button>
    </form>
  );
}
