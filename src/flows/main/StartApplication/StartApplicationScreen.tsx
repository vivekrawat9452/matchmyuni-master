/**
 * StartApplicationScreen — Figma nodes 560-826 (pending uploads) + 560-1496 (all done)
 *
 * Layout:
 *  ┌─────────────────────────────────────────────┐
 *  │  ← Back   Start Your Application            │  ← orange header
 *  │  [Course name] • [University]                │
 *  ├─────────────────────────────────────────────┤
 *  │  Course info card                            │
 *  │  [Name + Match%] [uni] [stats]               │
 *  ├─────────────────────────────────────────────┤
 *  │  What you'll need                            │
 *  │  ● Academic transcripts       Upload → / Ready
 *  │  ● Passport copy              Upload →       │
 *  │  ...                                         │
 *  ├─────────────────────────────────────────────┤
 *  │  Application fee card                        │
 *  ├─────────────────────────────────────────────┤
 *  │  Application deadline card + progress bar    │
 *  ├─────────────────────────────────────────────┤
 *  │  [Start Application →]                       │
 *  │  ●●● 3 of 5 applications used               │
 *  └─────────────────────────────────────────────┘
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Check, AlertCircle} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import type {CourseListItem, UpcomingIntake} from '../../../api/types';
import {en} from '../../../utils/strings/en';

const H_PAD = hPad(5);

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequiredDoc = {
  key: string;
  label: string;
  uploaded: boolean;
  documentUrl?: string | null;
};

export type StartApplicationScreenProps = {
  course: CourseListItem | null | undefined;
  courseLoading?: boolean;
  courseLoadFailed?: boolean;
  matchPct: number;
  requiredDocs: RequiredDoc[];
  uploadingKey?: string | null;
  applicationFee?: number | null;
  deadlineDate?: string | null;
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

// ─── Document row ─────────────────────────────────────────────────────────────

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
  label: {flex: 1, fontSize: FontSizes.chip, fontWeight: Weights.semibold, color: colors.navy},
  ready: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.accentTeal},
  upload: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.primary},
});

// ─── Course info card ─────────────────────────────────────────────────────────

function CourseInfoCard({
  course,
  matchPct,
}: {
  course: CourseListItem;
  matchPct: number;
}) {
  const tuition = course.applicableTuitionFee
    ? `${course.currencySymbol ?? '$'}${Math.round(course.applicableTuitionFee / 100) * 100}/yr`
    : null;

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
        <Text style={infoCard.uniName}>{course.universityName?.toUpperCase()}</Text>
      </View>

      <View style={infoCard.statsRow}>
        {course.duration ? (
          <Text style={infoCard.stat}>
            {course.duration} year{course.duration > 1 ? 's' : ''}
          </Text>
        ) : null}
        {(course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0]) ? (
          <Text style={infoCard.stat}>
            • {course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0]}
          </Text>
        ) : null}
      </View>

      <View style={infoCard.statsRow}>
        {tuition ? <Text style={infoCard.stat}>{tuition}</Text> : null}
        {course.scholarshipOnTuitionFee ? (
          <Text style={infoCard.stat}>• {course.scholarshipOnTuitionFee} schol.</Text>
        ) : null}
      </View>
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
  },
  top: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  name: {flex: 1, fontSize: FontSizes.body, fontWeight: Weights.extrabold, color: colors.navy, lineHeight: 21},
  badge: {
    ...Styles.matchBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: Styles.matchBadgeText,
  uniRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6},
  uniDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border},
  uniName: {fontSize: FontSizes.micro, fontWeight: Weights.semibold, color: colors.textSecondary, letterSpacing: 0.3},
  statsRow: {flexDirection: 'row', gap: 4, marginTop: 4},
  stat: {fontSize: FontSizes.caption, color: colors.textSecondary, fontWeight: Weights.medium},
});

// ─── Application dots indicator ───────────────────────────────────────────────

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
  row: {flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center'},
  dot: {width: 10, height: 10, borderRadius: 5},
  dotUsed: {backgroundColor: colors.primary},
  dotFree: {backgroundColor: colors.border},
  label: {fontSize: FontSizes.caption, color: colors.textSecondary, marginLeft: 4},
});

// ─── Main screen ──────────────────────────────────────────────────────────────

function IntakePicker({
  intakes,
  selectedId,
  onSelect,
}: {
  intakes: UpcomingIntake[];
  selectedId?: number;
  onSelect?: (intake: UpcomingIntake) => void;
}) {
  if (intakes.length <= 1) {
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
              <Text style={[intakeStyles.chipText, active && intakeStyles.chipTextActive]}>
                {i.label}
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
    paddingVertical: 8,
  },
  chipActive: {borderColor: colors.primary, backgroundColor: '#FFF7F5'},
  chipText: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.navy},
  chipTextActive: {color: colors.primary, fontWeight: Weights.bold},
});

export const StartApplicationScreen = memo(function StartApplicationScreen({
  course,
  courseLoading = false,
  courseLoadFailed = false,
  matchPct,
  requiredDocs,
  uploadingKey,
  applicationFee,
  deadlineDate,
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
              {courseLoadFailed ? en.applicationFlow.courseLoadFailed : en.errors.generic}
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

        {/* Course info card */}
        <CourseInfoCard course={course} matchPct={matchPct} />

        <IntakePicker
          intakes={intakes}
          selectedId={selectedIntakeId}
          onSelect={onSelectIntake}
        />

        {/* What you'll need */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>What you'll need</Text>
          <Text style={styles.secHint}>
            {allReady ? en.applicationFlow.allDocsReady : en.applicationFlow.uploadAllDocs}
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

        {/* Application fee */}
        {applicationFee != null ? (
          <View style={[styles.section, styles.feeCard]}>
            <View style={styles.feeIcon}>
              <AlertCircle size={18} color={colors.primary} />
            </View>
            <View style={styles.feeBody}>
              <Text style={styles.feeTitle}>Application fee</Text>
              <Text style={styles.feeText}>
                {course.currencySymbol ?? '$'}{applicationFee} application fee applies. Paid directly to the university.
              </Text>
              <Text style={styles.feeNote}>Proceeds not collected by MatchMyUni</Text>
            </View>
          </View>
        ) : null}

        {/* Application deadline */}
        {deadlineDate ? (
          <View style={[styles.section, styles.deadlineCard]}>
            <View style={styles.feeIcon}>
              <AlertCircle size={18} color={colors.primary} />
            </View>
            <View style={styles.feeBody}>
              <Text style={styles.feeTitle}>Application deadline</Text>
              <Text style={styles.feeText}>{deadlineDate}</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.feeNote}>Apply early for scholarship consideration</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Sticky footer ─────────────────────────── */}
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
    flexDirection: 'row',
    gap: 12,
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
  feeIcon: {paddingTop: 2},
  feeBody: {flex: 1},
  feeTitle: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.navy, marginBottom: 4},
  feeText: {fontSize: FontSizes.caption, color: colors.navy, lineHeight: 17},
  feeNote: {fontSize: FontSizes.size11, color: colors.textMuted, marginTop: 4},
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
  submitLabel: {fontSize: FontSizes.body, fontWeight: Weights.extrabold, color: colors.white},
});
