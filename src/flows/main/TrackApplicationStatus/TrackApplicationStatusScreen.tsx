/**
 * Track Application Status — Figma node 593:846
 *
 * Data sources:
 *  - Course card + cost: GET /applications/by-ids (+ GET /courses/:id fee fields when sparse)
 *  - Journey ticks: GET /applications/by-ids application.status
 *  - Documents checklist: GET /user/documents
 *
 * Commented for later (no API field):
 *  - Match % badge
 *  - Per-document review status (In-Review vs Ready)
 *  - Journey step download URLs (offer letter, visa letter, etc.)
 *  - Contact agent action
 */
import React, {memo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Check, ChevronDown, Lock} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WaveHeader} from '../../../components/WaveHeader';
import {CourseCostBreakdownModal} from '../CourseDetails/CourseCostBreakdownModal';
import type {CourseCostBreakdown} from '../CourseDetails/courseCostBreakdown';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {StarIcon} from '../../../components/icons/ApplicationIcons';
import type {ApplicationDetailDto, CourseListItem} from '../../../api/types';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';
import {
  APPLICATION_JOURNEY_STEPS,
  appliedStatusShortLabel,
  getJourneyStepState,
  statusBadgeColors,
} from '../Applications/applicationStatus';

const H_PAD = hPad(5);

export type StatusRequiredDoc = {
  key: string;
  label: string;
  uploaded: boolean;
};

export type TrackApplicationStatusScreenProps = {
  detail: ApplicationDetailDto | null | undefined;
  course: CourseListItem | null | undefined;
  costBreakdown?: CourseCostBreakdown | null;
  requiredDocs?: StatusRequiredDoc[];
  loading: boolean;
  loadFailed?: boolean;
  onBack: () => void;
  onUploadDoc?: (key: string) => void;
  onContactAgent?: () => void;
};

function formatStepDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scholarshipPercent(course: CourseListItem): number {
  const details = course.scholarshipDetails;
  if (details?.percentageMax != null) {
    return details.percentageMax;
  }
  const legacy = course.scholarshipOnTuitionFee?.match(/(\d+)/);
  return legacy ? parseInt(legacy[1], 10) : 0;
}

function scholarshipPromoText(course: CourseListItem, pct: number): string | null {
  if (pct <= 0) {
    return null;
  }
  const years =
    course.scholarshipDetails?.validForYears === 'all_years'
      ? 'All years'
      : course.scholarshipDetails?.validForYears?.replace(/_/g, ' ') ?? 'All years';
  return `${pct}% off - Auto applied - ${years}`;
}

const CourseStatusCard = memo(function CourseStatusCard({
  course,
  universityName,
  universityLogo,
  intakeLabel,
  applicationStatus,
  costBreakdown,
  onCostBreakdownPress,
}: {
  course: CourseListItem;
  universityName?: string;
  universityLogo?: string;
  intakeLabel?: string | null;
  applicationStatus: string;
  costBreakdown?: CourseCostBreakdown | null;
  onCostBreakdownPress?: () => void;
}) {
  const sym = course.currencySymbol ?? '$';
  const pct = scholarshipPercent(course);
  const feeVal = course.applicableTuitionFee;
  const fee =
    feeVal != null ? `${sym}${Number(feeVal).toLocaleString()}` : null;
  const listedFee =
    feeVal != null && pct > 0 && pct < 100
      ? `${sym}${Math.round(feeVal / (1 - pct / 100)).toLocaleString()}`
      : null;
  const promoText = scholarshipPromoText(course, pct);
  const badge = statusBadgeColors(applicationStatus);
  const statusText = appliedStatusShortLabel(applicationStatus);
  const uniLabel = (universityName ?? course.universityName)?.toUpperCase();
  const resolvedIntake =
    intakeLabel ?? course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0] ?? null;

  return (
    <View style={courseCard.wrap}>
      <View style={courseCard.top}>
        <Text style={courseCard.name} numberOfLines={2}>
          {course.name}
        </Text>
        <View style={[courseCard.statusBadge, {backgroundColor: badge.bg}]}>
          <Text style={[courseCard.statusBadgeText, {color: badge.text}]}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={courseCard.uniRow}>
        {universityLogo ?? course.universityLogo ? (
          <Image
            source={{uri: universityLogo ?? course.universityLogo}}
            style={courseCard.uniLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={courseCard.uniDot} />
        )}
        {uniLabel ? (
          <Text style={courseCard.uniName} numberOfLines={1}>
            {uniLabel}
          </Text>
        ) : null}
      </View>

      {course.duration || resolvedIntake ? (
        <View style={courseCard.statsRow}>
          {course.duration ? (
            <Text style={courseCard.stat}>
              {course.duration} year{course.duration > 1 ? 's' : ''}
            </Text>
          ) : null}
          {resolvedIntake ? (
            <Text style={courseCard.stat}>• {resolvedIntake}</Text>
          ) : null}
        </View>
      ) : null}

      {course.isPrime ? (
        <View style={courseCard.primeBadge}>
          <StarIcon size={10} color={colors.navy} />
          <Text style={courseCard.primeText}>Prime</Text>
        </View>
      ) : null}

      {/* Match % — no matchScore on GET /applications/by-ids; restore when API adds field
      <View style={courseCard.matchBadge}>
        <Text style={courseCard.matchText}>88% Match</Text>
      </View>
      */}

      {fee || costBreakdown ? (
        <View style={courseCard.costSection}>
          {fee ? (
            <>
              <Text style={courseCard.costLabel}>{en.applicationsTab.estimatedYearlyCost}</Text>
              <View style={courseCard.costPriceRow}>
                <Text style={courseCard.costMain}>{fee}</Text>
                <Text style={courseCard.costPer}>{en.applicationsTab.perYear}</Text>
              </View>
              {listedFee ? (
                <Text style={courseCard.costListed}>
                  {en.applicationsTab.listedAt(listedFee)}
                </Text>
              ) : null}
              {promoText ? (
                <View style={courseCard.costPromo}>
                  <Text style={courseCard.costPromoText}>{promoText}</Text>
                </View>
              ) : null}
            </>
          ) : null}
          {costBreakdown ? (
            <Pressable
              style={[
                courseCard.costBreakdownRow,
                !fee && {marginTop: 0, paddingTop: 0, borderTopWidth: 0},
              ]}
              onPress={onCostBreakdownPress}
              hitSlop={8}>
              <Text style={courseCard.costBreakdownLabel}>
                {en.applicationsTab.costBreakdown}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const JourneyStepper = memo(function JourneyStepper({
  status,
  createdAt,
  submittedAt,
  intakeLabel,
}: {
  status: string;
  createdAt?: string | null;
  submittedAt?: string | null;
  intakeLabel?: string | null;
}) {
  const {completedThrough, activeIndex} = getJourneyStepState(status);

  return (
    <View style={journey.wrap}>
      <Text style={journey.title}>{en.applicationsTab.journeyTitle}</Text>
      <View style={journey.list}>
        {APPLICATION_JOURNEY_STEPS.map((step, i) => {
          const active = activeIndex != null && i === activeIndex;
          const done =
            !active &&
            (activeIndex != null ? i < activeIndex : i <= completedThrough);
          const last = i === APPLICATION_JOURNEY_STEPS.length - 1;

          let dateLabel: string | null = null;
          if (step.key === 'profile') {
            dateLabel = formatStepDate(createdAt);
          } else if (step.key === 'submitted') {
            dateLabel = formatStepDate(submittedAt);
          } else if (step.expectedHint) {
            dateLabel = intakeLabel ? `Expected ${intakeLabel}` : 'Expected soon';
          }

          const showDownload = step.downloadLabel != null;

          return (
            <View key={step.key} style={journey.stepRow}>
              <View style={journey.rail}>
                <View
                  style={[
                    journey.dot,
                    done && journey.dotDone,
                    active && journey.dotActive,
                  ]}>
                  {done ? (
                    <Check size={12} color={colors.white} strokeWidth={3} />
                  ) : active ? (
                    <View style={journey.dotActiveInner} />
                  ) : (
                    <View style={journey.dotInner} />
                  )}
                </View>
                {!last ? (
                  <View style={[journey.line, done && journey.lineDone]} />
                ) : null}
              </View>

              <View style={journey.body}>
                <View style={journey.titleRow}>
                  <Text
                    style={[
                      journey.stepTitle,
                      done && journey.stepTitleDone,
                      active && journey.stepTitleActive,
                    ]}>
                    {step.title}
                  </Text>
                  {dateLabel ? (
                    <Text style={journey.stepDate}>{dateLabel}</Text>
                  ) : null}
                  {active && step.activeTag ? (
                    <Text style={journey.activeTag}>{step.activeTag}</Text>
                  ) : null}
                </View>
                <Text style={journey.stepDesc}>{step.description}</Text>

                {showDownload ? (
                  /* Journey download — uncomment when API returns document URLs per step
                  done ? (
                    <Pressable style={journey.downloadBtn} hitSlop={8}>
                      <Text style={journey.downloadLabel}>{step.downloadLabel}</Text>
                    </Pressable>
                  ) : (
                  */
                  <View style={[journey.downloadBtn, journey.downloadBtnLocked]}>
                    <Lock size={14} color={colors.textMuted} />
                    <Text style={journey.downloadLabelLocked}>{step.downloadLabel}</Text>
                  </View>
                  /* ) : null */
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

function DocChecklistRow({
  doc,
}: {
  doc: StatusRequiredDoc;
}) {
  /* Per-document review status — no reviewStatus on GET /user/documents; restore when API adds field
  const reviewStatus = doc.reviewStatus;
  const isInReview = reviewStatus === 'in_review';
  */
  const isInReview = false;

  return (
    <View style={docRow.wrap}>
      <View style={docRow.iconWrap}>
        {doc.uploaded ? (
          <View style={docRow.checkCircle}>
            <Check size={12} color={colors.white} strokeWidth={3} />
          </View>
        ) : (
          <View style={docRow.pendingCircle} />
        )}
      </View>
      <Text style={docRow.label}>{doc.label}</Text>
      {doc.uploaded ? (
        isInReview ? (
          <Text style={docRow.inReview}>{en.applicationsTab.docInReview}</Text>
        ) : (
          <Text style={docRow.ready}>{en.applicationsTab.docReady}</Text>
        )
      ) : (
        /* Upload action — wire onUploadDoc when document picker is connected from this screen
        <Pressable hitSlop={10}>
          <Text style={docRow.upload}>{en.applicationsTab.docUpload}</Text>
        </Pressable>
        */
        <Text style={docRow.missing}>Missing</Text>
      )}
    </View>
  );
}

export const TrackApplicationStatusScreen = memo(function TrackApplicationStatusScreen({
  detail,
  course,
  costBreakdown,
  requiredDocs = [],
  loading,
  loadFailed,
  onBack,
}: TrackApplicationStatusScreenProps) {
  const insets = useSafeAreaInsets();
  const [costModalVisible, setCostModalVisible] = useState(false);

  const app = detail?.application;
  const resolvedCourse = course ?? detail?.course;
  const headerSubtitle = resolvedCourse
    ? `${resolvedCourse.name} · ${detail?.university.name ?? resolvedCourse.universityName}`
    : undefined;

  const missingIelts = requiredDocs.some(
    d => d.key === 'english_proficiency' && !d.uploaded,
  );

  return (
    <View style={styles.fill}>
      <WaveHeader
        title={en.applicationsTab.trackTitle}
        subtitle={headerSubtitle}
        onBack={onBack}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : loadFailed || !detail ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{en.applicationsTab.trackLoadFailed}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + 24},
          ]}
          showsVerticalScrollIndicator={false}>
          {resolvedCourse ? (
            <CourseStatusCard
              course={resolvedCourse}
              universityName={detail.university.name}
              universityLogo={detail.university.logoUrl}
              intakeLabel={app?.intakeLabel}
              applicationStatus={app!.status}
              costBreakdown={costBreakdown}
              onCostBreakdownPress={() => setCostModalVisible(true)}
            />
          ) : null}

          <JourneyStepper
            status={app!.status}
            createdAt={app!.createdAt}
            submittedAt={app!.submittedAt}
            intakeLabel={app!.intakeLabel}
          />

          {requiredDocs.length > 0 ? (
            <View style={styles.docsSection}>
              <Text style={styles.sectionTitle}>{en.applicationsTab.whatYouNeed}</Text>
              <View style={styles.docsCard}>
                {requiredDocs.map(doc => (
                  <DocChecklistRow key={doc.key} doc={doc} />
                ))}
              </View>
            </View>
          ) : null}

          {missingIelts ? (
            <View style={styles.actionBanner}>
              <Text style={styles.actionBannerText}>
                {en.applicationsTab.actionNeededPrefix}
              </Text>
              {/* Upload now — wire _onUploadDoc when document upload is enabled from this screen
              <Pressable onPress={() => _onUploadDoc?.('english_proficiency')} hitSlop={8}>
                <Text style={styles.actionBannerCta}>{en.applicationsTab.actionNeededCta}</Text>
              </Pressable>
              */}
              <Text style={styles.actionBannerCta}>{en.applicationsTab.actionNeededCta}</Text>
            </View>
          ) : null}

          {/* Contact agent — no agent contact endpoint in student APIs; restore when API ships
          <PrimaryButton
            label={en.applicationsTab.contactAgent}
            onPress={() => _onContactAgent?.()}
            style={styles.contactBtn}
          />
          */}
          <PrimaryButton
            label={en.applicationsTab.contactAgent}
            onPress={() => {}}
            style={styles.contactBtn}
          />

          {/* Legacy summary + backend timeline — kept for reuse (pre-Figma-593 layout)
          <View style={styles.legacySummaryCard}>
            <Text style={styles.legacySummaryLabel}>{en.applicationsTab.currentStatus}</Text>
            <Text style={styles.legacySummaryStatus}>{statusLabel(app!.status)}</Text>
          </View>
          */}
        </ScrollView>
      )}

      <CourseCostBreakdownModal
        visible={costModalVisible}
        breakdown={costBreakdown ?? null}
        onClose={() => setCostModalVisible(false)}
      />
    </View>
  );
});

const courseCard = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
    marginTop: -24,
  },
  top: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  name: {
    flex: 1,
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 21,
  },
  statusBadge: {
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.bold,
  },
  uniRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
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
  statsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 4},
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
  matchBadge: {
    ...Styles.matchBadge,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: Styles.matchBadgeText,
  costSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 6,
  },
  costLabel: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  costPriceRow: {flexDirection: 'row', alignItems: 'baseline', gap: 4},
  costMain: {
    fontSize: FontSizes.size28,
    fontWeight: Weights.extrabold,
    color: colors.primary,
  },
  costPer: {fontSize: FontSizes.small, color: colors.textMuted},
  costListed: {
    fontSize: FontSizes.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  costPromo: {
    alignSelf: 'flex-start',
    backgroundColor: colors.promoBg,
    borderRadius: rad.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  costPromoText: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.tagGreen,
  },
  costBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  costBreakdownLabel: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.semibold,
    color: colors.navy,
  },
});

const journey = StyleSheet.create({
  wrap: {gap: 12, marginTop: 8},
  title: {
    fontSize: FontSizes.size16,
    fontWeight: Weights.extrabold,
    color: colors.navy,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  stepRow: {flexDirection: 'row', gap: 12, minHeight: 56},
  rail: {width: 24, alignItems: 'center'},
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  dotActiveInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
    minHeight: 24,
  },
  lineDone: {backgroundColor: colors.accentTeal},
  body: {flex: 1, paddingBottom: 16, gap: 4},
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  stepTitle: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.bold,
    color: colors.textSecondary,
  },
  stepTitleDone: {color: colors.navy},
  stepTitleActive: {color: colors.primary},
  stepDate: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  activeTag: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.bold,
    color: colors.primary,
    marginLeft: 'auto',
  },
  stepDesc: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rad.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  downloadBtnLocked: {
    backgroundColor: colors.inputBg,
    opacity: 0.85,
  },
  downloadLabelLocked: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.textMuted,
  },
});

const docRow = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 10,
  },
  iconWrap: {width: 22, alignItems: 'center'},
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  label: {
    flex: 1,
    fontSize: FontSizes.chip,
    fontWeight: Weights.semibold,
    color: colors.navy,
  },
  ready: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.accentTeal,
  },
  inReview: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
  upload: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
  missing: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.semibold,
    color: colors.textMuted,
  },
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  spinner: {marginTop: 48},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: H_PAD},
  errorText: {fontSize: FontSizes.body, color: colors.textSecondary, textAlign: 'center'},
  scroll: {flex: 1},
  content: {paddingHorizontal: H_PAD, gap: 16},
  sectionTitle: {
    fontSize: FontSizes.size16,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 8,
  },
  docsSection: {marginTop: 4},
  docsCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  actionBanner: {
    backgroundColor: '#FFF7F5',
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: '#FED7CC',
    padding: 14,
    gap: 6,
  },
  actionBannerText: {
    fontSize: FontSizes.chip,
    color: colors.navy,
    lineHeight: 20,
  },
  actionBannerCta: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
  contactBtn: {marginTop: 4},
  legacySummaryCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  legacySummaryLabel: {
    fontSize: FontSizes.size12,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  legacySummaryStatus: {
    fontSize: FontSizes.size18,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
});
