/**
 * StartApplicationScreen — Figma node 560:826 (pending uploads) + 560:1496 (all done)
 *
 * Data sources:
 *  - Course card + cost: GET /courses/:id
 *  - Application Breakdown: GET /applications/by-ids applicationFees, or course fee projection
 *  - Application fee card: GET /courses/:id applicationFee (commented when 0/absent)
 *  - Documents: GET /user/documents
 *
 * Commented for later (no API field):
 *  - Visa rate badge
 *  - Cost breakdown expander (course otherFees available but no dedicated breakdown endpoint)
 */
import React, {memo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Check, ChevronDown, ChevronUp} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import type {CourseListItem, UpcomingIntake} from '../../../api/types';
import {en} from '../../../utils/strings/en';
import {intakeChipLabel} from '../../../utils/applicationFlow';
import {
  CheckCircleIcon,
  StarIcon,
} from '../../../components/icons/ApplicationIcons';

const H_PAD = hPad(5);

export type RequiredDoc = {
  key: string;
  label: string;
  uploaded: boolean;
  documentUrl?: string | null;
};

export type FeeBreakdownRow = {
  label: string;
  amount: number;
  status?: string;
};

export type StartApplicationScreenProps = {
  course: CourseListItem | null | undefined;
  courseLoading?: boolean;
  courseLoadFailed?: boolean;
  matchPct: number;
  requiredDocs: RequiredDoc[];
  uploadingKey?: string | null;
  applicationFee?: number | null;
  applicationBreakdown?: FeeBreakdownRow[];
  deadlineDate?: string | null;
  deadlineRelative?: string | null;
  intakes?: UpcomingIntake[];
  selectedIntakeId?: number;
  onSelectIntake?: (intake: UpcomingIntake) => void;
  submitting: boolean;
  appsUsed: number;
  appsTotal: number;
  onBack: () => void;
  onUploadDoc: (key: string) => void;
  onSubmit: () => void;
};

function scholarshipPercent(course: CourseListItem): number {
  const details = course.scholarshipDetails;
  if (details?.percentageMax != null) {
    return details.percentageMax;
  }
  const legacy = course.scholarshipOnTuitionFee?.match(/(\d+)/);
  return legacy ? parseInt(legacy[1], 10) : 0;
}

function scholarshipChipLabel(course: CourseListItem): string | null {
  const pct = scholarshipPercent(course);
  if (pct > 0) {
    return `${pct}% scholarship`;
  }
  if (course.scholarshipAvailable) {
    return 'Scholarship available';
  }
  return null;
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

function DocRow({
  doc,
  uploading,
  onUpload,
}: {
  doc: RequiredDoc;
  uploading: boolean;
  onUpload: (key: string) => void;
}) {
  return (
    <View style={docRow.wrap}>
      <View style={docRow.leftIcon}>
        {doc.uploaded ? (
          <View style={docRow.checkCircle}>
            <Check size={12} color={colors.white} strokeWidth={3} />
          </View>
        ) : (
          <View style={docRow.pendingCircle}>
            <Text style={docRow.pendingNum}>●</Text>
          </View>
        )}
      </View>
      <Text style={docRow.label}>{doc.label}</Text>
      {doc.uploaded ? (
        <Text style={docRow.ready}>Ready</Text>
      ) : uploading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Pressable onPress={() => onUpload(doc.key)} hitSlop={10}>
          <Text style={docRow.upload}>Upload →</Text>
        </Pressable>
      )}
    </View>
  );
}

const docRow = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 10,
  },
  leftIcon: {width: 22, alignItems: 'center'},
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
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingNum: {fontSize: 8, color: colors.primary},
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
  upload: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
});

function StatusBadge({
  variant,
  label,
}: {
  variant: 'prime' | 'scholarship' | 'visa';
  label: string;
}) {
  const wrapStyle =
    variant === 'prime'
      ? badgeStyles.primeWrap
      : variant === 'scholarship'
        ? badgeStyles.scholarshipWrap
        : badgeStyles.visaWrap;
  const textStyle =
    variant === 'prime'
      ? badgeStyles.primeText
      : variant === 'scholarship'
        ? badgeStyles.scholarshipText
        : badgeStyles.visaText;

  return (
    <View style={[badgeStyles.wrap, wrapStyle]}>
      {variant === 'prime' ? (
        <StarIcon size={10} color={colors.navy} />
      ) : variant === 'scholarship' ? (
        <CheckCircleIcon size={12} color={colors.tagGreen} />
      ) : null}
      <Text style={[badgeStyles.text, textStyle]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  text: {fontSize: FontSizes.size11, fontWeight: Weights.bold},
  primeWrap: {
    backgroundColor: colors.yellowBadge,
    borderColor: colors.yellowBadge,
  },
  primeText: {color: colors.navy},
  scholarshipWrap: {
    backgroundColor: '#F7FFFB',
    borderColor: '#D0F0E4',
  },
  scholarshipText: {color: colors.tagGreen},
  visaWrap: {
    backgroundColor: '#F3F0FF',
    borderColor: '#DDD6FE',
  },
  visaText: {color: '#6D28D9'},
});

function CourseInfoCard({
  course,
  matchPct,
}: {
  course: CourseListItem;
  matchPct: number;
}) {
  const [costExpanded, setCostExpanded] = useState(false);

  const sym = course.currencySymbol ?? '$';
  const pct = scholarshipPercent(course);
  const feeVal = course.applicableTuitionFee;
  const fee =
    feeVal != null ? `${sym}${Number(feeVal).toLocaleString()}` : null;
  const listedFee =
    feeVal != null && pct > 0 && pct < 100
      ? `${sym}${Math.round(feeVal / (1 - pct / 100)).toLocaleString()}`
      : null;
  const schChip = scholarshipChipLabel(course);
  const promoText = scholarshipPromoText(course, pct);

  const intakeLabel =
    course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0] ?? null;

  const costLineItems: {label: string; amount: string}[] = [];
  if (course.registrationFee != null && course.registrationFee > 0) {
    costLineItems.push({
      label: 'Registration fee',
      amount: `${sym}${course.registrationFee.toLocaleString()}`,
    });
  }
  if (course.depositFee != null && course.depositFee > 0) {
    costLineItems.push({
      label: 'Deposit fee',
      amount: `${sym}${course.depositFee.toLocaleString()}`,
    });
  }
  if (course.examinationFee != null && course.examinationFee > 0) {
    costLineItems.push({
      label: 'Examination fee',
      amount: `${sym}${course.examinationFee.toLocaleString()}`,
    });
  }
  if (course.hostelFee != null && course.hostelFee > 0) {
    costLineItems.push({
      label: 'Hostel fee',
      amount: `${sym}${course.hostelFee.toLocaleString()}`,
    });
  }
  if (course.foodFee != null && course.foodFee > 0) {
    costLineItems.push({
      label: 'Food fee',
      amount: `${sym}${course.foodFee.toLocaleString()}`,
    });
  }
  for (const other of course.otherFees ?? []) {
    costLineItems.push({
      label: other.name,
      amount: `${sym}${other.amount.toLocaleString()}`,
    });
  }

  return (
    <View style={infoCard.wrap}>
      <View style={infoCard.top}>
        <Text style={infoCard.name} numberOfLines={2}>
          {course.name}
        </Text>
        <View style={infoCard.badge}>
          <Text style={infoCard.badgeText}>{matchPct}% Match</Text>
        </View>
      </View>

      <View style={infoCard.uniRow}>
        <View style={infoCard.uniDot} />
        <Text style={infoCard.uniName}>
          {course.universityName?.toUpperCase()}
        </Text>
      </View>

      <View style={infoCard.statsRow}>
        {course.duration ? (
          <Text style={infoCard.stat}>
            {course.duration} year{course.duration > 1 ? 's' : ''}
          </Text>
        ) : null}
        {intakeLabel ? (
          <Text style={infoCard.stat}>• {intakeLabel}</Text>
        ) : null}
      </View>

      {(course.isPrime || schChip) ? (
        <View style={infoCard.badgeRow}>
          {course.isPrime ? (
            <StatusBadge variant="prime" label="Prime" />
          ) : null}
          {schChip ? (
            <StatusBadge variant="scholarship" label={schChip} />
          ) : null}
          {/* Visa rate — no field in prompts/API_Docs.md; uncomment when API ships
          <StatusBadge variant="visa" label="85% visa" />
          */}
        </View>
      ) : null}

      {fee ? (
        <View style={infoCard.costSection}>
          <Text style={infoCard.costLabel}>Estimated yearly cost</Text>
          <View style={infoCard.costPriceRow}>
            <Text style={infoCard.costMain}>{fee}</Text>
            <Text style={infoCard.costPer}>/ year</Text>
          </View>
          {listedFee ? (
            <Text style={infoCard.costListed}>Listed at {listedFee}</Text>
          ) : null}
          {promoText ? (
            <View style={infoCard.costPromo}>
              <Text style={infoCard.costPromoText}>{promoText}</Text>
            </View>
          ) : null}

          {/* Cost breakdown — no dedicated endpoint; expand using GET /courses/:id fee fields when present */}
          {costLineItems.length > 0 ? (
            <>
              <Pressable
                style={infoCard.costBreakdownRow}
                onPress={() => setCostExpanded(v => !v)}
                hitSlop={8}>
                <Text style={infoCard.costBreakdownLabel}>Cost breakdown</Text>
                {costExpanded ? (
                  <ChevronUp size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </Pressable>
              {costExpanded
                ? costLineItems.map(row => (
                    <View key={row.label} style={infoCard.costLineRow}>
                      <Text style={infoCard.costLineLabel}>{row.label}</Text>
                      <Text style={infoCard.costLineValue}>{row.amount}</Text>
                    </View>
                  ))
                : null}
            </>
          ) : (
            /* Cost breakdown — uncomment when dedicated Cost Breakdown API ships
            <Pressable style={infoCard.costBreakdownRow} hitSlop={8}>
              <Text style={infoCard.costBreakdownLabel}>Cost breakdown</Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </Pressable>
            */
            null
          )}
        </View>
      ) : null}
    </View>
  );
}

const infoCard = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  top: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  name: {
    flex: 1,
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 21,
  },
  badge: {
    ...Styles.matchBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: Styles.matchBadgeText,
  uniRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  uniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  uniName: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  statsRow: {flexDirection: 'row', gap: 4},
  stat: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4},
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
  costLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  costLineLabel: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
  },
  costLineValue: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
});

function ApplicationBreakdownSection({
  rows,
  currencySymbol,
}: {
  rows: FeeBreakdownRow[];
  currencySymbol?: string;
}) {
  if (!rows.length) {
    return (
      /* Application Breakdown — uncomment when GET /applications/by-ids returns applicationFees
      <View style={breakdown.wrap}>
        <Text style={breakdown.title}>Application Breakdown</Text>
        <Text style={breakdown.empty}>Fee breakdown will appear here.</Text>
      </View>
      */
      null
    );
  }

  const sym = currencySymbol ?? '$';

  return (
    <View style={breakdown.wrap}>
      <Text style={breakdown.title}>Application Breakdown</Text>
      {rows.map(row => (
        <View key={row.label} style={breakdown.row}>
          <Text style={breakdown.label}>{row.label}</Text>
          <View style={breakdown.right}>
            <Text style={breakdown.amount}>
              {sym}
              {row.amount.toLocaleString()}
            </Text>
            {row.status ? (
              <Text style={breakdown.status}>{row.status.replace(/_/g, ' ')}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const breakdown = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.extrabold,
    color: colors.navy,
  },
  empty: {fontSize: FontSizes.caption, color: colors.textMuted},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  right: {alignItems: 'flex-end', gap: 2},
  amount: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  status: {
    fontSize: FontSizes.size11,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});

function AppDots({used, total}: {used: number; total: number}) {
  return (
    <View style={dots.row}>
      {Array.from({length: total}).map((_, i) => (
        <View
          key={i}
          style={[dots.dot, i < used ? dots.dotUsed : dots.dotFree]}
        />
      ))}
      <Text style={dots.label}>
        {used} of {total} applications used
      </Text>
    </View>
  );
}

const dots = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  dot: {width: 10, height: 10, borderRadius: 5},
  dotUsed: {backgroundColor: colors.primary},
  dotFree: {backgroundColor: colors.border},
  label: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

function IntakePicker({
  intakes,
  selectedId,
  onSelect,
}: {
  intakes: UpcomingIntake[];
  selectedId?: number;
  onSelect?: (intake: UpcomingIntake) => void;
}) {
  if (!intakes.length) {
    return null;
  }

  return (
    <View style={intakeStyles.wrap}>
      <Text style={intakeStyles.label}>{en.applicationFlow.selectIntake}</Text>
      <View style={intakeStyles.row}>
        {intakes.map(i => {
          const active = i.id === selectedId;
          return (
            <Pressable
              key={i.id}
              onPress={() => onSelect?.(i)}
              style={[intakeStyles.chip, active && intakeStyles.chipActive]}>
              <Text
                style={[
                  intakeStyles.chipText,
                  active && intakeStyles.chipTextActive,
                ]}>
                {intakeChipLabel(i)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const intakeStyles = StyleSheet.create({
  wrap: {marginBottom: 16},
  label: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 8,
  },
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    borderRadius: rad.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.navy,
  },
  chipTextActive: {color: colors.white, fontWeight: Weights.bold},
});

function ApplicationFeeCard({
  fee,
  currencySymbol,
}: {
  fee: number;
  currencySymbol?: string;
}) {
  const sym = currencySymbol ?? '$';

  return (
    <View style={styles.feeCard}>
      <Text style={styles.feeTitle}>🏦  Application fee</Text>
      <Text style={styles.feeText}>
        {sym}
        {fee} application fee applies. Paid directly to the university.
      </Text>
      <Text style={styles.feeNote}>Proceeds not collected by MatchMyUni</Text>
    </View>
  );
}

export const StartApplicationScreen = memo(function StartApplicationScreen({
  course,
  courseLoading = false,
  courseLoadFailed = false,
  matchPct,
  requiredDocs,
  uploadingKey,
  applicationFee,
  applicationBreakdown = [],
  deadlineDate,
  deadlineRelative,
  intakes = [],
  selectedIntakeId,
  onSelectIntake,
  submitting,
  appsUsed,
  appsTotal,
  onBack,
  onUploadDoc,
  onSubmit,
}: StartApplicationScreenProps) {
  const insets = useSafeAreaInsets();
  const allReady = requiredDocs.every(d => d.uploaded);

  if (!course) {
    return (
      <View style={[styles.flex, styles.center, {padding: H_PAD}]}>
        {courseLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Text style={styles.errorText}>
              {courseLoadFailed
                ? en.applicationFlow.courseLoadFailed
                : en.errors.generic}
            </Text>
            <Pressable onPress={onBack} style={styles.errorBack}>
              <Text style={styles.errorBackLabel}>{en.back}</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const headerSubtitle = `${course.name} • ${course.universityName}`;
  const showApplicationFee =
    applicationFee != null && applicationFee > 0;

  return (
    <View style={styles.flex}>
      <WaveHeader
        title="Start Your Application"
        subtitle={headerSubtitle}
        onBack={onBack}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          padding: H_PAD,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}>

        <CourseInfoCard course={course} matchPct={matchPct} />

        <IntakePicker
          intakes={intakes}
          selectedId={selectedIntakeId}
          onSelect={onSelectIntake}
        />

        <ApplicationBreakdownSection
          rows={applicationBreakdown}
          currencySymbol={course.currencySymbol}
        />

        <View style={styles.section}>
          <Text style={styles.secTitle}>What you'll need</Text>
          <Text style={styles.secHint}>
            {allReady
              ? en.applicationFlow.allDocsReady
              : en.applicationFlow.uploadAllDocs}
          </Text>
          <View style={styles.docCard}>
            {requiredDocs.map(d => (
              <DocRow
                key={d.key}
                doc={d}
                uploading={uploadingKey === d.key}
                onUpload={onUploadDoc}
              />
            ))}
          </View>
        </View>

        {showApplicationFee ? (
          <ApplicationFeeCard
            fee={applicationFee}
            currencySymbol={course.currencySymbol}
          />
        ) : (
          /* Application fee — GET /courses/:id applicationFee is 0 or absent; uncomment when fee applies
          <ApplicationFeeCard fee={25} currencySymbol={course.currencySymbol ?? '€'} />
          */
          null
        )}

        {deadlineDate ? (
          <View style={[styles.section, styles.deadlineCard]}>
            <View style={styles.deadlineBody}>
              <Text style={styles.deadlineTitle}>Application deadline</Text>
              <Text style={styles.deadlineText}>
                {deadlineRelative ?? deadlineDate}
              </Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.feeNote}>
                Apply early for scholarship consideration
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={[styles.submitBtn, !allReady && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={!allReady || submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.submitLabel}>Start Application →</Text>
          )}
        </Pressable>
        <AppDots used={appsUsed} total={appsTotal} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  center: Styles.center,
  errorText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBack: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: rad.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  errorBackLabel: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },

  section: {marginBottom: 20},
  secTitle: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    marginBottom: 6,
  },
  secHint: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 17,
  },
  docCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },

  feeCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rad.lg,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  deadlineCard: {
    backgroundColor: colors.matchBadgeBg,
    borderWidth: 1,
    borderColor: colors.yellowBadge,
    borderRadius: rad.lg,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  deadlineBody: {flex: 1},
  deadlineTitle: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
    marginBottom: 4,
  },
  deadlineText: {
    fontSize: FontSizes.caption,
    color: colors.navy,
    lineHeight: 17,
  },
  feeTitle: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  feeText: {
    fontSize: FontSizes.caption,
    color: colors.navy,
    lineHeight: 17,
  },
  feeNote: {
    fontSize: FontSizes.size11,
    color: colors.textMuted,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    gap: 12,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: rad.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {backgroundColor: colors.primaryMuted},
  submitLabel: {
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.white,
  },
});
