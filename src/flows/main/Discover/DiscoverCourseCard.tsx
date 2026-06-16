/**
 * Shared discover course card — Figma 407-4965 (used in Discover tab + signup tutorial).
 */
import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
} from '../../../components/icons/ApplicationIcons';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {rad} from '../../../utils/sizes';
import type {CourseListItem} from '../../../api/types';

const {width: W, height: H} = Dimensions.get('window');

export const DISCOVER_SIDE_PAD = 18;
export const DISCOVER_CARD_W = W - DISCOVER_SIDE_PAD * 2;
export const DISCOVER_CARD_H = H * 0.63;
const PHOTO_H = DISCOVER_CARD_H * 0.32;
const PHOTO_INSET = 12;

function parseScholarshipPct(label?: string | null): number {
  if (!label) {
    return 0;
  }
  const m = label.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function formatCardPricing(course: CourseListItem) {
  const fee = course.applicableTuitionFee;
  if (fee == null) {
    return null;
  }
  const sym = course.currencySymbol ?? '$';
  const pct = parseScholarshipPct(course.scholarshipOnTuitionFee);
  const listed =
    pct > 0 && pct < 100 ? Math.round(fee / (1 - pct / 100)) : null;
  return {
    main: `${sym}${Math.round(fee).toLocaleString()}`,
    listed: listed != null ? `${sym}${listed.toLocaleString()}` : null,
    pct,
    promo:
      pct > 0
        ? `${pct}% off - Auto applied - All years`
        : null,
  };
}

export type DiscoverCourseCardProps = {
  course: CourseListItem;
  matchPct: number;
  onViewDetail?: () => void;
  width?: number;
  height?: number;
};

export function DiscoverCourseCard({
  course,
  matchPct,
  onViewDetail,
  width = DISCOVER_CARD_W,
  height = DISCOVER_CARD_H,
}: DiscoverCourseCardProps) {
  const pricing = formatCardPricing(course);
  const photoH = height * 0.32;

  return (
    <View style={[s.card, {width, height}]}>
      <View style={[s.photoWrap, {width, height: photoH + PHOTO_INSET * 2}]}>
        <View style={s.photoInner}>
          {course.universityLogo ? (
            <Image
              source={{uri: course.universityLogo}}
              style={s.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={s.logoFallback}>
              <Text style={s.initial}>
                {course.universityName?.charAt(0) ?? 'U'}
              </Text>
            </View>
          )}
          <View style={s.matchBadge}>
            <Text style={s.matchText}>{matchPct}% Match</Text>
          </View>
          {course.isPrime ? (
            <View style={s.primeBadge}>
              <StarIcon size={10} color={colors.navy} />
              <Text style={s.primeText}>Prime</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.info}>
        <Text style={s.courseName} numberOfLines={2}>
          {course.name}
        </Text>
        <View style={s.uniRow}>
          <View style={s.uniDot} />
          <Text style={s.uniName} numberOfLines={1}>
            {course.universityName?.toUpperCase()}
          </Text>
        </View>
        <View style={Styles.hairline} />

        <View style={s.tags}>
          {course.scholarshipOnTuitionFee ? (
            <View style={Styles.tagPill}>
              <CheckCircleIcon size={14} color={colors.tagGreen} />
              <Text style={Styles.tagPillText}>
                {course.scholarshipOnTuitionFee} scholarship
              </Text>
            </View>
          ) : null}
          {course.country ? (
            <View style={Styles.tagPill}>
              <ShieldCheckIcon size={14} color={colors.tagGreen} />
              <Text style={Styles.tagPillText}>High visa approval rate</Text>
            </View>
          ) : null}
        </View>

        {pricing ? (
          <View style={s.pricingBlock}>
            <Text style={s.priceLabel}>Estimated yearly cost</Text>
            <View style={s.priceRow}>
              <Text style={s.priceMain}>{pricing.main}</Text>
              <Text style={s.pricePer}>/ year</Text>
            </View>
            {pricing.listed ? (
              <Text style={s.priceListed}>Listed at {pricing.listed}</Text>
            ) : null}
            {pricing.promo ? (
              <View style={s.promoPill}>
                <Text style={s.promoText}>{pricing.promo}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={Styles.hairline} />
        {onViewDetail ? (
          <Pressable onPress={onViewDetail} style={s.viewDetailBtn}>
            <Text style={s.viewDetailText}>View Detail →</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: rad.xl,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  photoWrap: {
    backgroundColor: colors.white,
    padding: PHOTO_INSET,
  },
  photoInner: {
    flex: 1,
    borderRadius: rad.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  initial: {
    fontSize: 56,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    opacity: 0.2,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    ...Styles.matchBadge,
  },
  matchText: Styles.matchBadgeText,
  primeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.yellowBadge,
    borderRadius: rad.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primeText: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  info: {
    flex: 1,
    padding: 14,
    paddingTop: 10,
    gap: 8,
    backgroundColor: colors.white,
  },
  courseName: {
    fontSize: FontSizes.size20,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 26,
  },
  uniRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  uniDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  uniName: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.4,
    flex: 1,
  },
  tags: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  pricingBlock: {gap: 4},
  priceLabel: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  priceRow: {flexDirection: 'row', alignItems: 'baseline', gap: 4},
  priceMain: {
    fontSize: FontSizes.size28,
    fontWeight: Weights.extrabold,
    color: colors.primary,
  },
  pricePer: {
    fontSize: FontSizes.small,
    color: colors.textMuted,
    fontWeight: Weights.medium,
  },
  priceListed: {
    fontSize: FontSizes.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  promoPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.promoBg,
    borderRadius: rad.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  promoText: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.tagGreen,
  },
  viewDetailBtn: {alignItems: 'center', paddingVertical: 6},
  viewDetailText: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
});
