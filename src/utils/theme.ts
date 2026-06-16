/**
 * Global design token system — exact values from Figma REST API extraction.
 * File: pHnQspQkvUJvE9TyiQN5Zv  |  Font: Plus Jakarta Sans
 *
 * RULE: All screens source styles from here — no inline font/color/spacing values.
 */

import {StyleSheet, Platform} from 'react-native';
import {colors} from './colors';

// ─── Font family (Plus Jakarta Sans — Figma's primary typeface) ───────────────
// To activate: add font files to assets/fonts/ and link them.
// Falls back to system sans-serif until fonts are linked.
const FONT = Platform.select({
  ios: 'PlusJakartaSans',
  android: 'PlusJakartaSans-Regular',
  default: undefined,  // system fallback
});
const makeFontStyle = (weight: string, sizePx: number, lhPx: number, ls = 0) => ({
  fontFamily: FONT,
  fontSize: sizePx,
  fontWeight: weight as any,
  lineHeight: lhPx,
  ...(ls !== 0 ? {letterSpacing: ls} : {}),
});

// ─── Typography ───────────────────────────────────────────────────────────────
// Exact from Figma node extraction (fontSize/fontWeight/lineHeightPx/letterSpacing)
export const text = StyleSheet.create({
  /** 32px/800  lh=36  ls=-0.64 — Screen large titles ("What's your budget range?") */
  display: {...makeFontStyle('800', 32, 36, -0.64), color: colors.navy},
  /** 24px/800  lh=28  ls=-0.24 — Wave header titles */
  heading: {...makeFontStyle('800', 24, 28, -0.24), color: colors.white},
  /** 32px/800 — Preparing screen "Finding your matches." */
  heroLight: {...makeFontStyle('800', 32, 36, -0.64), color: colors.textPrimary},
  /** 16px/700  lh=22  — "Already have an account?" bold span */
  bodyBold:  {...makeFontStyle('700', 16, 22, -0.16), color: colors.navy},
  /** 16px/600  lh=22  ls=-0.16 — Button label, card title */
  bodySemibold: {...makeFontStyle('600', 16, 22, -0.16), color: colors.textPrimary},
  /** 16px/500  lh=22  ls=-0.16 — Wave header subtitle */
  body: {...makeFontStyle('500', 16, 22, -0.16), color: colors.white},
  /** 14px/700  lh=18  — "Already have an account?" label */
  smBold: {...makeFontStyle('700', 14, 18), color: colors.navy},
  /** 14px/600  lh=19  — Card heading text */
  smSemibold: {...makeFontStyle('600', 14, 19, -0.47), color: colors.textPrimary},
  /** 14px/500  lh=18  ls=-0.14 — Supporting body */
  sm: {...makeFontStyle('500', 14, 18, -0.14), color: colors.textPrimary},
  /** 12px/700  lh=15  — Study interest tile labels */
  caption: {...makeFontStyle('700', 12, 15), color: colors.navy},
  /** 12px/600  lh=18  ls=-0.44 — Chip labels, filter badges */
  captionMd: {...makeFontStyle('600', 12, 18, -0.44), color: colors.textPrimary},
  /** 12px/500  lh=15  — Password requirement text */
  captionLight: {...makeFontStyle('500', 12, 15), color: colors.textPrimary},
  /** 12px/400  lh=16  ls=-0.39 — Legal / Terms text */
  legal: {...makeFontStyle('400', 12, 16, -0.39), color: colors.textSecondary},
  /** 10px/700  lh=13  — Micro labels */
  micro: {...makeFontStyle('700', 10, 13), color: colors.textMuted},

  // Semantic helpers
  link:          {...makeFontStyle('600', 14, 18), color: colors.primary},
  onPrimary:     {...makeFontStyle('600', 16, 22, -0.16), color: colors.white},
  waveTitle:     {...makeFontStyle('800', 24, 28, -0.24), color: colors.white},
  waveSubtitle:  {...makeFontStyle('500', 16, 22, -0.16), color: 'rgba(255,255,255,0.92)'},
  backLabel:     {...makeFontStyle('500', 16, 20), color: colors.white},
  navSkip:       {...makeFontStyle('500', 16, 20), color: colors.white},
  muted:         {...makeFontStyle('400', 12, 16), color: colors.textMuted},
  success:       {...makeFontStyle('600', 14, 18), color: colors.accentTeal},
});

// ─── Input fields ─────────────────────────────────────────────────────────────
// Exact from Figma: Frame 121075495 — 358x54, r=14, bg=#EFEAE2, stroke=#E7E1D9
export const inputStyles = StyleSheet.create({
  field: {
    backgroundColor: colors.inputBg,       // #EFEAE2
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,        // #E7E1D9
    paddingHorizontal: 16,
    height: 54,
    fontSize: 16,
    fontFamily: FONT,
    fontWeight: '600' as any,
    letterSpacing: -0.16,
    color: colors.textPrimary,
  },
  fieldFocused: {
    borderColor: colors.primary,
  },
  label: {
    fontSize: 12,
    fontFamily: FONT,
    fontWeight: '500' as any,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  /** Search bar in location select */
  search: {
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontFamily: FONT,
    color: colors.textPrimary,
  },
});

// ─── Cards ────────────────────────────────────────────────────────────────────
// Exact from Figma: role cards r=18, list cards r=18/14, grid tiles r=18
export const cardStyles = StyleSheet.create({
  /** Standard list card (role select, timeline) — r=18, stroke=#E7E1D9 */
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  listCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  },
  /** Grid tile (study interests) — r=18, pad T16R12B16L12, gap=8 */
  gridTile: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    gap: 8,
  },
  gridTileSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  },
  /** Budget / question cards — r=12, pad T14R16B14L16 */
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 16,
  },
  questionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
});

// ─── Primary button ───────────────────────────────────────────────────────────
// Figma: 358x54, r=1000, bg=#E8613A active / #F49F79 disabled
export const buttonStyles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 1000,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
  },
  solid: {backgroundColor: colors.primary},
  muted: {backgroundColor: colors.primaryMuted},
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT,
    fontWeight: '600' as any,
    letterSpacing: -0.16,
    lineHeight: 22,
    color: colors.white,
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export const layout = StyleSheet.create({
  flex: {flex: 1},
  flexRow: {flexDirection: 'row' as const},
  flexRowCenter: {flexDirection: 'row' as const, alignItems: 'center' as const},
  center: {alignItems: 'center' as const, justifyContent: 'center' as const},
  fill: {position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0},
});

/** Figma screen horizontal padding = 16px */
export const SCREEN_H_PADDING = 16;
