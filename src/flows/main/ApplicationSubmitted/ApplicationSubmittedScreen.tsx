/**
 * ApplicationSubmittedScreen — Figma node 567:1943
 *
 * Course card fields without API support are commented for later reuse:
 *  - Match % badge (no matchScore on create / by-ids)
 *  - Reference number pill (no reference field in student APIs)
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Check} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StarIcon} from '../../../components/icons/ApplicationIcons';
import {PrimaryButton} from '../../../components/PrimaryButton';
import type {CourseListItem} from '../../../api/types';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';
import {
  APPLIED_PIPELINE_STEPS,
  appliedStatusShortLabel,
} from '../Applications/applicationStatus';

const H_PAD = hPad(5);

/** Figma 567:1943 — static pipeline after submit (Submitted ✓, Under review active). */
const STATIC_PIPELINE = {completedThrough: 0, activeIndex: 1} as const;

export type ApplicationSubmittedScreenProps = {
  courseName: string;
  universityName?: string;
  course?: CourseListItem | null;
  matchPct?: number;
  intakeLabel?: string | null;
  submittedAt?: string | null;
  applicationStatus?: string;
  detailLoading?: boolean;
  onTrackApplication: () => void;
  onViewApplications: () => void;
  onDone: () => void;
};

const StaticPipelineStepper = memo(function StaticPipelineStepper() {
  const {completedThrough, activeIndex} = STATIC_PIPELINE;

  return (
    <View style={pipeline.wrap}>
      <View style={pipeline.track}>
        {APPLIED_PIPELINE_STEPS.map((label, i) => {
          const done = i <= completedThrough;
          const active = activeIndex != null && i === activeIndex;
          const last = i === APPLIED_PIPELINE_STEPS.length - 1;
          return (
            <View key={label} style={pipeline.step}>
              <View style={pipeline.dotRow}>
                <View
                  style={[
                    pipeline.dot,
                    done && pipeline.dotDone,
                    active && pipeline.dotActive,
                  ]}>
                  {done ? (
                    <Check size={10} color={colors.white} strokeWidth={3} />
                  ) : active ? (
                    <View style={pipeline.dotActiveInner} />
                  ) : null}
                </View>
                {!last ? (
                  <View
                    style={[
                      pipeline.line,
                      done && pipeline.lineDone,
                      active && pipeline.lineActive,
                    ]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  pipeline.label,
                  done && pipeline.labelDone,
                  active && pipeline.labelActive,
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

export const ApplicationSubmittedScreen = memo(function ApplicationSubmittedScreen({
  courseName,
  universityName,
  course,
  matchPct,
  intakeLabel,
  submittedAt,
  applicationStatus = 'applied',
  detailLoading,
  onTrackApplication,
  onViewApplications,
  onDone,
}: ApplicationSubmittedScreenProps) {
  const insets = useSafeAreaInsets();
  const uniLabel = (universityName ?? course?.universityName)?.toUpperCase();
  const duration = course?.duration;
  const formattedSubmittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <View style={[styles.flex, {paddingTop: insets.top + 16}]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 16},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Check size={28} color={colors.white} strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.title}>{en.applicationFlow.submittedTitle}</Text>
          <Text style={styles.subtitle}>
            {en.applicationFlow.submittedSubtitle(courseName, universityName)}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.courseName} numberOfLines={2}>
              {courseName}
            </Text>
            {/* Match % — no matchScore on POST /applications/create or GET /applications/by-ids
            {matchPct != null ? (
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{matchPct}% Match</Text>
              </View>
            ) : null}
            */}
          </View>

          <View style={styles.uniRow}>
            {course?.universityLogo ? (
              <Image
                source={{uri: course.universityLogo}}
                style={styles.uniLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.uniDot} />
            )}
            {uniLabel ? (
              <Text style={styles.uniName} numberOfLines={1}>
                {uniLabel}
              </Text>
            ) : null}
          </View>

          {duration || intakeLabel ? (
            <View style={styles.statsRow}>
              {duration ? (
                <Text style={styles.stat}>
                  {duration} year{duration > 1 ? 's' : ''}
                </Text>
              ) : null}
              {intakeLabel ? <Text style={styles.stat}>• {intakeLabel}</Text> : null}
            </View>
          ) : null}

          {course?.isPrime ? (
            <View style={styles.primeBadge}>
              <StarIcon size={10} color={colors.navy} />
              <Text style={styles.primeText}>Prime</Text>
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <Text style={styles.submittedLabel}>
              {appliedStatusShortLabel(applicationStatus)}
            </Text>
            <Text style={styles.submittedDate}>{formattedSubmittedDate}</Text>
            {/* Ref — no reference field in student applications APIs; restore when API adds reference
            <View style={styles.refBadge}>
              <Text style={styles.refText}>Ref: MMU-2026-4821</Text>
            </View>
            */}
          </View>
        </View>

        <StaticPipelineStepper />

        {/* Legacy "What happens next?" card — kept for reuse (pre-Figma-567 layout)
        <View style={styles.legacyCard}>
          <Text style={styles.legacyCardTitle}>{en.applicationFlow.submittedNextTitle}</Text>
          <Text style={styles.legacyCardBody}>{en.applicationFlow.submittedNextBody}</Text>
        </View>
        */}

        {detailLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.detailSpinner}
          />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <PrimaryButton
          label={en.applicationFlow.trackMyApplication}
          onPress={onTrackApplication}
        />
        <PrimaryButton
          label={en.applicationFlow.done}
          onPress={onDone}
          variant="outline"
          style={styles.secondaryBtn}
        />
        <Pressable onPress={onViewApplications} hitSlop={8} style={styles.viewAllLink}>
          <Text style={styles.viewAllText}>{en.applicationFlow.viewAllApplications}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const pipeline = StyleSheet.create({
  wrap: {marginTop: 20, marginBottom: 8},
  track: {flexDirection: 'row', alignItems: 'flex-start'},
  step: {flex: 1, alignItems: 'center'},
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTeal,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotActiveInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  lineDone: {
    backgroundColor: colors.accentTeal,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  labelDone: {
    color: colors.tagGreen,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: Weights.bold,
  },
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  scroll: {flex: 1},
  scrollContent: {
    paddingHorizontal: H_PAD,
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEECE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseName: {
    flex: 1,
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 21,
  },
  matchBadge: {
    ...Styles.matchBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: Styles.matchBadgeText,
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  uniLogo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  uniName: {
    flex: 1,
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  stat: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  primeBadge: {
    alignSelf: 'flex-start',
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  submittedLabel: {
    fontSize: FontSizes.size13,
    fontWeight: Weights.bold,
    color: colors.tagGreen,
  },
  submittedDate: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  refBadge: {
    backgroundColor: colors.promoBg,
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refText: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.navy,
  },
  detailSpinner: {marginTop: 12},
  footer: {
    paddingHorizontal: H_PAD,
    gap: 12,
    paddingTop: 8,
  },
  secondaryBtn: {marginTop: 0},
  viewAllLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: FontSizes.size13,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
  legacyCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 16,
  },
  legacyCardTitle: {
    fontSize: FontSizes.small,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 6,
  },
  legacyCardBody: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
