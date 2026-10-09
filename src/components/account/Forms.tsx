"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { createOrganization, saveListing, sendSignInLink, type ListingState, type OrgState, type SignInState } from "@/app/account/actions";
import { cx } from "@/components/ui";
import { invitableRoles, serviceMarkets, type Category, type ListingStatus, type MyOrgOption } from "@/lib/listings";
import { inviteMember, type InviteState } from "@/app/account/team/actions";

export const fieldBase =
  "mt-2 w-full rounded-[var(--radius-sm)] border bg-surface px-3 text-base text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
const border = (err?: string) => (err ? "border-danger" : "border-line-strong hover:border-ink");

function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Errors from the last submit, minus fields the person has since changed. */
function useLiveErrors<E extends Record<string, string | undefined>>(state: object, errors: E | undefined) {
  const [seen, setSeen] = useState(state);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  if (seen !== state) {
    setSeen(state);
    setTouched(new Set());
  }
  const live = { ...(errors ?? {}) } as E;
  for (const k of touched) delete live[k];
  const onChange = (ev: React.FormEvent<HTMLFormElement>) => {
    const name = (ev.target as HTMLInputElement).name;
    if (name && errors?.[name] && !touched.has(name)) setTouched((t) => new Set(t).add(name));
  };
  return [live, onChange] as const;
}

const describe = (id: string, hint?: boolean, err?: string) => [hint ? `${id}-hint` : "", err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-[var(--radius-sm)] border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

function Submit({ children, name, value, variant = "primary" }: { children: ReactNode; name?: string; value?: string; variant?: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={cx(
        "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-60",
        variant === "primary" ? "bg-gold text-white hover:bg-gold-strong" : "border border-line-strong bg-surface text-ink hover:border-ink",
      )}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function SignInForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [state, action] = useActionState<SignInState, FormData>(sendSignInLink, {});
  const id = useId();
  if (state.sent) {
    return (
      <div role="status" className="rounded-[var(--radius-md)] border border-gold/30 bg-gold-soft p-7">
        <h2 className="text-xl">Check your email</h2>
        <p className="mt-2 text-slate">
          We sent a sign-in link to <strong className="text-ink">{state.sent}</strong>. Open it on this device to finish signing in. The link works
          once and expires after an hour.
        </p>
        <p className="mt-4 text-sm text-muted">No email after a few minutes? Check your spam folder, or reload this page to try again.</p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="space-y-5">
      {linkError ? <FormError message="That sign-in link has expired or was already used. Enter your email for a new one." /> : null}
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field id={`${id}-email`} label="Email address" hint="New here? The same link creates your account.">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          aria-describedby={describe(`${id}-email`, true)}
          className={cx(fieldBase, "h-12", border())}
        />
      </Field>
      <Submit>Email me a sign-in link</Submit>
    </form>
  );
}

export function OrgForm() {
  const [state, action] = useActionState<OrgState, FormData>(createOrganization, {});
  const id = useId();
  const [e, onChange] = useLiveErrors(state, state.errors);
  const v = state.values;
  return (
    <form action={action} noValidate onChange={onChange} className="space-y-6">
      <FormError message={state.error ?? (Object.keys(e).length ? "Check the highlighted fields." : undefined)} />
      <Field id={`${id}-name`} label="Business name" error={e.name}>
        <input id={`${id}-name`} name="name" defaultValue={v?.name} required maxLength={160} aria-invalid={!!e.name} aria-describedby={describe(`${id}-name`, false, e.name)} className={cx(fieldBase, "h-12", border(e.name))} />
      </Field>
      <Field id={`${id}-website`} label="Website" optional error={e.website}>
        <input id={`${id}-website`} name="website" defaultValue={v?.website} inputMode="url" placeholder="company.com" aria-invalid={!!e.website} aria-describedby={describe(`${id}-website`, false, e.website)} className={cx(fieldBase, "h-12", border(e.website))} />
      </Field>
      <Field id={`${id}-country`} label="Where the business is based" optional error={e.country}>
        <input id={`${id}-country`} name="country" defaultValue={v?.country} maxLength={80} autoComplete="country-name" aria-describedby={describe(`${id}-country`, false, e.country)} className={cx(fieldBase, "h-12", border(e.country))} />
      </Field>
      <p className="text-sm text-muted">You&apos;ll be the owner. You can create directory listings for this business straight away.</p>
      <Submit>Create business profile</Submit>
    </form>
  );
}

export type ListingDefaults = {
  listingId?: string;
  organizationId?: string;
  categoryId?: number;
  name?: string;
  summary?: string;
  description?: string | null;
  website?: string;
  headquarters?: string | null;
  serves_markets?: string[];
  status?: ListingStatus;
};

export function ListingForm({ orgs, categories, defaults: initial = {} }: { orgs: MyOrgOption[]; categories: Category[]; defaults?: ListingDefaults }) {
  const [state, action] = useActionState<ListingState, FormData>(saveListing, {});
  const id = useId();
  const [e, onChange] = useLiveErrors(state, state.errors);
  // After a failed save React resets the form to these defaults, so use what was submitted.
  const v = state.values;
  const defaults: ListingDefaults = v
    ? {
        ...initial,
        name: v.name,
        categoryId: Number(v.categoryId) || undefined,
        summary: v.summary,
        description: v.description,
        website: v.website,
        headquarters: v.headquarters,
        serves_markets: v.servesMarkets,
      }
    : initial;
  const [summaryLength, setSummaryLength] = useState((initial.summary ?? "").trim().length);
  const editing = !!initial.listingId;
  const canSubmit = !editing || defaults.status === "draft" || defaults.status === "rejected";
  const goesBackToReview = defaults.status === "published";

  return (
    <form action={action} noValidate onChange={onChange} className="space-y-7">
      <FormError message={state.error ?? (Object.keys(e).length ? "Check the highlighted fields." : undefined)} />
      {editing ? <input type="hidden" name="listingId" value={initial.listingId} /> : null}

      {!editing ? (
        <Field id={`${id}-org`} label="Business">
          <select id={`${id}-org`} name="organizationId" defaultValue={initial.organizationId ?? orgs[0]?.id} className={cx(fieldBase, "h-12", border())}>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Listing name" hint="The name customers know you by." error={e.name}>
          <input id={`${id}-name`} name="name" defaultValue={defaults.name} maxLength={160} aria-invalid={!!e.name} aria-describedby={describe(`${id}-name`, true, e.name)} className={cx(fieldBase, "h-12", border(e.name))} />
        </Field>
        <Field id={`${id}-cat`} label="Category" error={e.categoryId}>
          <select id={`${id}-cat`} name="categoryId" defaultValue={defaults.categoryId ?? ""} aria-invalid={!!e.categoryId} aria-describedby={describe(`${id}-cat`, false, e.categoryId)} className={cx(fieldBase, "h-12", border(e.categoryId))}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id={`${id}-summary`} label="Summary" hint={`What you offer, in one or two sentences. ${summaryLength} of 280 characters.`} error={e.summary}>
        <textarea
          id={`${id}-summary`}
          name="summary"
          rows={3}
          maxLength={280}
          defaultValue={defaults.summary}
          onInput={(ev) => setSummaryLength(ev.currentTarget.value.trim().length)}
          aria-invalid={!!e.summary}
          aria-describedby={describe(`${id}-summary`, true, e.summary)}
          className={cx(fieldBase, "py-3", border(e.summary))}
        />
      </Field>

      <Field id={`${id}-desc`} label="Full description" optional hint="Products or services, minimum orders, typical customers, certifications." error={e.description}>
        <textarea id={`${id}-desc`} name="description" rows={7} maxLength={5000} defaultValue={defaults.description ?? ""} aria-describedby={describe(`${id}-desc`, true, e.description)} className={cx(fieldBase, "py-3", border(e.description))} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${id}-web`} label="Website" hint="Must be a secure (https) address." error={e.website}>
          <input id={`${id}-web`} name="website" inputMode="url" placeholder="company.com" defaultValue={defaults.website} aria-invalid={!!e.website} aria-describedby={describe(`${id}-web`, true, e.website)} className={cx(fieldBase, "h-12", border(e.website))} />
        </Field>
        <Field id={`${id}-hq`} label="Headquarters" optional hint="City and country." error={e.headquarters}>
          <input id={`${id}-hq`} name="headquarters" maxLength={80} defaultValue={defaults.headquarters ?? ""} aria-describedby={describe(`${id}-hq`, true, e.headquarters)} className={cx(fieldBase, "h-12", border(e.headquarters))} />
        </Field>
      </div>

      <fieldset aria-describedby={e.servesMarkets ? `${id}-mk-err` : undefined}>
        <legend className="text-sm font-semibold text-ink">Markets you serve</legend>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
          {serviceMarkets.map((m) => (
            <label key={m.code} className="flex min-h-10 items-center gap-2.5 text-sm text-slate">
              <input type="checkbox" name="servesMarkets" value={m.code} defaultChecked={defaults.serves_markets?.includes(m.code)} className="size-4 accent-[var(--color-midnight)]" />
              {m.label}
            </label>
          ))}
        </div>
        {e.servesMarkets ? (
          <p id={`${id}-mk-err`} className="mt-1.5 text-xs font-medium text-danger">
            {e.servesMarkets}
          </p>
        ) : null}
      </fieldset>

      {goesBackToReview ? (
        <p className="rounded-[var(--radius-sm)] border border-line bg-paper px-4 py-3 text-sm text-slate">
          This listing is live. Saving changes sends it back for review, and it leaves the directory until it&apos;s approved again.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        {canSubmit ? (
          <>
            <Submit name="intent" value="submit">
              Submit for review
            </Submit>
            <Submit name="intent" value="draft" variant="secondary">
              Save as draft
            </Submit>
          </>
        ) : (
          <Submit name="intent" value="draft">
            Save changes
          </Submit>
        )}
      </div>
    </form>
  );
}

export function InviteForm({ organizationId }: { organizationId: string }) {
  const [state, action] = useActionState<InviteState, FormData>(inviteMember, {});
  const id = useId();
  return (
    <form action={action} noValidate className="space-y-5">
      <FormError message={state.error} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
        <Field id={`${id}-email`} label="Their email address" hint="They sign in with this address to accept.">
          <input id={`${id}-email`} name="email" type="email" autoComplete="off" defaultValue={state.email} aria-describedby={describe(`${id}-email`, true)} className={cx(fieldBase, "h-12", border())} />
        </Field>
        <Field id={`${id}-role`} label="Role">
          <select id={`${id}-role`} name="role" defaultValue={state.role ?? "editor"} className={cx(fieldBase, "h-12", border())}>
            {invitableRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Submit>Send invitation</Submit>
    </form>
  );
}
