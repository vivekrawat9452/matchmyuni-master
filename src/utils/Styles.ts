/**
 * Global reusable StyleSheet — single source of truth for repeated UI patterns.
 *
 * Usage:
 *   import {Styles} from '../utils';
 *   <Text style={Styles.screenTitle}>Hello</Text>
 *   <View style={[Styles.card, isSelected && Styles.cardSelected]}>
 *
 * To retheme: change colors.ts → every Styles.* automatically updates.
 * To retheme sizing: change values here → every screen automatically updates.
 */

import {Platform, StyleSheet} from 'react-native';
import {colors} from './colors';

const FONT = Platform.select({
  ios:     'PlusJakartaSans',
  android: 'PlusJakartaSans-Regular',
  default: undefined,
});

export const Styles = StyleSheet.create({
  // ─── Typography ─────────────────────────────────────────────────────────────

  /** 32px/800 ls=-0.64 — Largest screen title ("What's your budget range?") */
  displayTitle: {
    fontFamily: FONT,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.64,
    lineHeight: 36,
    color: colors.navy,
  },

  /** 24px/800 ls=-0.24 — WaveHeader white title */
  screenTitle: {
    fontFamily: FONT,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.24,
    lineHeight: 28,
    color: colors.white,
  },

  /** 16px/500 — WaveHeader white subtitle */
  screenSubtitle: {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.92)',
  },

  /** 18px/700 — Section / card heading on white background (Discover, Home) */
  sectionTitle: {
    fontFamily: FONT,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    lineHeight: 24,
    color: colors.navy,
  },

  /** 17px/800 ls=-0.34 — Swipe card course name */
  cardTitle: {
    fontFamily: FONT,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.34,
    lineHeight: 22,
    color: colors.navy,
  },

  /** 16px/700 ls=-0.16 — List card heading, bold body */
  bodyBold: {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.16,
    lineHeight: 22,
    color: colors.navy,
  },

  /** 16px/500 ls=-0.16 — Standard body text */
  bodyText: {
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.16,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  /** 14px/600 ls=-0.47 — Card meta / small bold body */
  bodySmallBold: {
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.47,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  /** 14px/500 ls=-0.14 — Supporting / helper text */
  bodySmall: {
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.14,
    lineHeight: 18,
    color: colors.textPrimary,
  },

  /** 12px/700 lh=15 — Study tile label, chip label (bold) */
  labelBold: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    color: colors.navy,
  },

  /** 12px/500 lh=15 — Form field label above input */
  labelText: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 15,
    color: colors.textSecondary,
  },

  /** 12px/400 lh=16 — Hint / caption / secondary note */
  captionText: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },

  /** 10px/700 lh=13 — Badge text, micro labels */
  microText: {
    fontFamily: FONT,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    color: colors.textMuted,
  },

  /** 14px/600 — Tappable link / CTA text */
  linkText: {
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.primary,
  },

  /** 12px/600 — Success / teal status message */
  successText: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.accentTeal,
  },

  /** 10px/400 ls=1 — Footer "POWERED BY EDUDITE" */
  footerText: {
    fontFamily: FONT,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    lineHeight: 14,
    color: colors.textFooter,
  },

  /** 10px/800 ls=0.4 — University name (all-caps) */
  uniName: {
    fontFamily: FONT,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 14,
    color: colors.textSecondary,
  },

  /** 12px/500 — Tag / pill text on cards */
  tagText: {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    color: colors.textSecondary,
  },

  // ─── Layout helpers ──────────────────────────────────────────────────────────

  flex1:       {flex: 1} as const,
  flexGrow:    {flexGrow: 1} as const,
  row:         {flexDirection: 'row'} as const,
  rowCenter:   {flexDirection: 'row', alignItems: 'center'} as const,
  rowBetween:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'} as const,
  rowEnd:      {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'} as const,
  center:      {alignItems: 'center', justifyContent: 'center'} as const,
  selfCenter:  {alignSelf: 'center'} as const,
  fillAbs:     {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0} as const,

  // ─── Screen-level ────────────────────────────────────────────────────────────

  /** Standard screen root (flex:1 + bg) */
  screen:     {flex: 1, backgroundColor: colors.background} as const,
  /** Horizontal screen padding matching Figma 16px */
  screenPad:  {paddingHorizontal: 16} as const,
  /** Padding used for list/grid content areas */
  listPad:    {paddingHorizontal: 16, paddingTop: 10} as const,

  // ─── Cards ───────────────────────────────────────────────────────────────────

  /** White bordered card — r=18, pad=16 (role select, timeline) */
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  } as const,

  /** Selected-state override for any card */
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EE',
  } as const,

  /** Budget / question card — r=12 */
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  } as const,

  /** Grid tile (study interest, location) — r=18 */
  gridTile: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  } as const,

  /** Drop shadow for elevated cards */
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  } as const,

  // ─── Badges ───────────────────────────────────────────────────────────────────

  /** Orange check circle in top-right of selected tile */
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  } as const,

  /** Match percentage pill — cream bg (Figma 407-4965) */
  matchBadge: {
    backgroundColor: colors.matchBadgeBg,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  } as const,

  matchBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.matchBadgeText,
  } as const,

  /** Mint tag pill (scholarship / visa on Discover card) */
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tagGreenBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  } as const,

  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tagGreen,
  } as const,

  /** Scholarship tag — Figma exact: bg=#FEF3D6 stroke=#F5A625 sw=0.5 r=6 pad=5/7 */
  scholarshipBadge: {
    backgroundColor: '#FEF3D6',
    borderWidth: 0.5,
    borderColor: '#F5A625',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  } as const,

  // ─── Dividers ─────────────────────────────────────────────────────────────────

  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  } as const,

  // ─── Input section label ──────────────────────────────────────────────────────

  /** Label above a form input field */
  inputLabel: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 15,
  } as const,

  // ─── Absolute footer bar (Continue / Find my matches) ─────────────────────────

  footBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  } as const,
});
