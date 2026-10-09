"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchSite } from "@/lib/search";
import { listBusinessHref } from "@/lib/supabase/config";

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className} fill="none">
      <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" strokeWidth="1.75" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const suggestions = [
  { title: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
  { title: "Break-even calculator", href: "/tools/break-even-calculator" },
  { title: "Promote your business", href: "/promote" },
  { title: "List your business", href: listBusinessHref },
];

/**
 * Site search over the page and tool index. Opens with the header
 * button, "/" or Ctrl/Cmd+K. Uses <dialog> for focus handling and Escape.
 */
export function SearchDialog({ triggerClassName, label = "Search" }: { triggerClassName?: string; label?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchSite(query), [query]);
  const listId = useId();

  const open = () => {
    setQuery("");
    setActive(0);
    ref.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => ref.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, select, [contenteditable=true]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (!ref.current?.open) open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shown = query.trim() ? results : suggestions.map((s) => ({ ...s, context: "Suggested" }));

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault();
      document.getElementById(`${listId}-${active}`)?.click();
    }
  };

  return (
    <>
      <button type="button" onClick={open} className={triggerClassName} aria-haspopup="dialog">
        <SearchIcon className="size-4" />
        <span>{label}</span>
      </button>
      <dialog
        ref={ref}
        aria-label="Search The Dream Business"
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
        className="m-0 mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-[var(--radius-lg)] bg-surface p-0 text-slate shadow-[var(--shadow-menu)] backdrop:bg-midnight/60 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="size-5 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search tools, divisions and pages"
            aria-label="Search"
            aria-controls={listId}
            aria-activedescendant={shown.length ? `${listId}-${active}` : undefined}
            role="combobox"
            aria-expanded
            autoComplete="off"
            className="h-14 w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
          />
          <button type="button" onClick={close} className="rounded px-2 py-1 text-xs text-muted ring-1 ring-line hover:text-ink">
            Esc
          </button>
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {shown.length === 0 ? (
            <li className="px-3 py-6 text-sm text-muted">
              Nothing matches “{query}”. Try a tool name such as “margin”, or browse{" "}
              <Link href="/tools" onNavigate={close} className="font-semibold text-gold-strong underline underline-offset-4">
                all business tools
              </Link>
              .
            </li>
          ) : (
            shown.map((r, i) => (
              <li key={`${r.href}-${r.title}`} role="option" aria-selected={i === active}>
                <Link
                  id={`${listId}-${i}`}
                  href={r.href}
                  onNavigate={close}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-baseline justify-between gap-4 rounded-[var(--radius-md)] px-3 py-2.5 ${i === active ? "bg-gold-soft" : ""}`}
                >
                  <span className="font-medium text-ink">{r.title}</span>
                  <span className="shrink-0 text-xs text-muted">{r.context}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </dialog>
    </>
  );
}
