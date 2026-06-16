/**
 * Icon dimension constants — all values match current Figma spec and existing usage.
 * Usage: size={IconSizes.md}
 * Change one value here → updates every icon that references it.
 */
export const IconSizes = {
  /** 10px — check mark inside selection badge */
  badge:   10,
  /** 12px — inline chip/tag icons */
  chip:    12,
  /** 14px — small contextual icons */
  xs:      14,
  /** 18px — toolbar / filter / chevron icons */
  sm:      18,
  /** 20px — actionable button icons (close, edit) */
  md:      20,
  /** 24px — standard tab bar icons, card icons */
  lg:      24,
  /** 32px — study interest tile emoji size (Figma: fontSize 32) */
  xl:      32,
  /** 38px — swipe card overlay icons (Check / X) */
  xxl:     38,

  // ── Named usage aliases ─────────────────────────────────────────────────────
  /** Bottom tab bar icons */
  tab:        24,
  /** Filter / sliders button */
  filter:     18,
  /** Back arrow / nav icon */
  nav:        20,
  /** Card action icons */
  cardAction: 18,
  /** Hero overlay (swipe right/left) */
  swipe:      38,
  /** Step indicator check */
  stepCheck:  10,
  /** Prime / star badge */
  starBadge:   9,
} as const;

export type IconSize = (typeof IconSizes)[keyof typeof IconSizes];
