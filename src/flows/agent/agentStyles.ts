/**
 * Agent flow design tokens — extracted from Figma nodes (assets/agentflow/).
 * File: pHnQspQkvUJvE9TyiQN5Zv
 */
import {colors} from '../../utils/colors';

export const agentLayout = {
  screenPadding: 16,
  contentWidth: 358,
  cardRadius: 16,
  cardRadiusSm: 12,
  pillRadius: 30,
  buttonHeight: 54,
  buttonHeightSm: 36,
  notificationRowHeight: 80,
} as const;

export const agentColors = {
  header: colors.primary,
  headerDark: colors.primaryDark,
  mint: colors.agentMint,
  mintLight: '#D0F4EB',
  heroBg: '#F7FFFC',
  inProgressBg: colors.matchBadgeBg,
  inProgressText: colors.matchBadgeText,
  doneText: colors.agentMint,
  lockedText: colors.textMuted,
  journeyBorder: colors.yellowBadge,
} as const;

export const agentType = {
  greeting: {fontSize: 15, fontWeight: '600' as const, color: colors.white},
  heroName: {fontSize: 40, fontWeight: '800' as const, color: colors.white, lineHeight: 43},
  welcome: {fontSize: 12, fontWeight: '700' as const, color: colors.navy},
  sectionTitle: {fontSize: 16, fontWeight: '700' as const, color: colors.navy, lineHeight: 22},
  screenTitle: {fontSize: 18, fontWeight: '700' as const, color: colors.navy},
  milestoneEyebrow: {fontSize: 15, fontWeight: '600' as const, color: colors.white},
  milestoneHero: {fontSize: 32, fontWeight: '800' as const, color: colors.white, lineHeight: 36},
  cardTitle: {fontSize: 14, fontWeight: '700' as const, color: colors.navy},
  body: {fontSize: 14, fontWeight: '600' as const, color: colors.navy},
  bodyMuted: {fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary},
  pill: {fontSize: 10, fontWeight: '700' as const},
  stepTitle: {fontSize: 14, fontWeight: '700' as const, color: colors.navy},
  stepMeta: {fontSize: 12, fontWeight: '700' as const},
  notificationTitle: {fontSize: 14, fontWeight: '700' as const, color: colors.navy},
  notificationBody: {fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary},
} as const;
