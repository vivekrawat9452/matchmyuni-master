/**
 * Design tokens — exact hex values extracted from Figma via REST API
 * File: pHnQspQkvUJvE9TyiQN5Zv  |  Extracted: 2026-05-03
 *
 * Every value here is pixel-perfect from the Figma node data.
 */
export const colors = {
  /** Primary brand terracotta — #E8613A (Figma: Primary Button fill, header bg) */
  primary: '#E8613A',
  /** Darker press state */
  primaryDark: '#C24E29',
  /** Disabled / muted CTA — #F49F79 (Figma: Primary Button disabled fill) */
  primaryMuted: '#F49F79',
  /** Teal for done step, success — #3CC09F (Figma: done step indicator fill) */
  accentTeal: '#3CC09F',
  accentTealAlt: '#3CC09F',
  /** Agent role card icon — reuse teal */
  agentMint: '#3CC09F',
  /** Coral accent */
  accentCoral: '#E8613A',
  /** Deep navy for body text on cards, headings — #1B2A4A */
  navy: '#1B2A4A',
  /** Primary text — #1A1C29 (Figma: most text elements) */
  textPrimary: '#1A1C29',
  /** Secondary / muted text — #677899 (Figma: subtitles, captions, placeholders) */
  textSecondary: '#677899',
  /** Input placeholder — #7B705F (Figma: "Email address" placeholder) */
  textMuted: '#7B705F',
  /** Footer / caption links */
  textFooter: '#677899',
  /** Link / action text */
  textLink: '#E8613A',
  /** Page background — #FBF7F3 (Figma: screen bg fill) */
  background: '#FBF7F3',
  backgroundAlt: '#FBF7F3',
  backgroundCream: '#FBF7F3',
  /** Pure white */
  white: '#FFFFFF',
  /** Figma card/divider border — #E7E1D9 */
  border: '#E7E1D9',
  borderLight: '#E7E1D9',
  /** Input field background — #EFEAE2 (Figma: text input fill) */
  inputBg: '#EFEAE2',
  /** Solid gold — Prime badge fill (Figma node 407-4965) */
  yellowBadge: '#F5A625',
  /** Match % badge background (Figma) */
  matchBadgeBg: '#FEF3D6',
  /** Match % badge label */
  matchBadgeText: '#AF6901',
  /** Scholarship / visa tag text (Discover card) */
  tagGreen: '#217A65',
  /** Scholarship / visa tag background */
  tagGreenBg: '#D0F4EB',
  /** Discount / promo pill background */
  promoBg: '#EDF2F9',
  /** Card floating shadow */
  shadow: 'rgba(26, 43, 72, 0.10)',
  /** Brand deep blue (splash screen, "Match My Uni" logo) — #222B59 */
  brandBlue: '#222B59',
  /** Profile progress bar track — #EDF2F9 (Figma: Profile node 620:894) */
  profileProgressTrack: '#EDF2F9',
  /** Notification toggle off — #D9D9D9 */
  switchOff: '#D9D9D9',
  /** Study-preferences chip unselected bg — #F2F2F7 */
  chipBg: '#F2F2F7',
  /** Tutorial "Go to home" button — #8FA3C1 (Figma Dark Button) */
  darkButton: '#8FA3C1',
  /** Tutorial overlay scrim — #1B2A4A */
  tutorialOverlay: '#1B2A4A',
} as const;

export type ColorName = keyof typeof colors;
