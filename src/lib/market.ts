"use client";

import { useSyncExternalStore } from "react";
import { markets } from "./markets";
import type { Market } from "./markets";

export { markets, formatMoney } from "./markets";
export type { Market } from "./markets";

const KEY = "tdb.market";
const EVENT = "tdb:market";
const DEFAULT: Market = markets[0];

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? DEFAULT.code;
  } catch {
    return DEFAULT.code;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setMarket(code: string) {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    /* storage unavailable: preference lasts for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Selected market. Server render and first paint use Global. */
export function useMarket(): Market {
  const code = useSyncExternalStore(subscribe, read, () => DEFAULT.code);
  return markets.find((m) => m.code === code) ?? DEFAULT;
}

