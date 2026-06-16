/**
 * Named font-size pixel constants — extracted from Figma (Plus Jakarta Sans scale).
 * Usage: fontSize: FontSizes.body   OR   fontSize: FontSizes.size16
 * Change one value here → updates every component that references it.
 *
 * These are fixed px values (not responsive); for responsive font.* values
 * use the existing `font` export from sizes.ts (hp-based).
 */
export const FontSizes = {
  // ── Semantic scale ──────────────────────────────────────────────────────────
  /** 10px — micro labels, badge text */
  micro:    10,
  /** 12px — captions, field labels, tile labels */
  caption:  12,
  /** 13px — chip labels */
  chip:     13,
  /** 14px — small body, card meta, links */
  small:    14,
  /** 16px — primary body, button labels, input text */
  body:     16,
  /** 18px — large card headings */
  large:    18,
  /** 24px — wave header titles */
  title:    24,
  /** 28px — section display titles */
  display:  28,
  /** 32px — hero screen titles ("What's your budget range?") */
  hero:     32,

  // ── Direct px shortcuts ─────────────────────────────────────────────────────
  size10: 10,
  size11: 11,
  size12: 12,
  size13: 13,
  size14: 14,
  size15: 15,
  size16: 16,
  size17: 17,  // swipe card course name
  size18: 18,
  size20: 20,
  size22: 22,
  size24: 24,
  size28: 28,
  size32: 32,
} as const;

export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];
