/**
 * Track Application Status — Figma node 593:846
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
import {Check} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronLeftIcon} from '../../../components/icons/ApplicationIcons';
import type {ApplicationDetailDto, ApplicationFeeDto} from '../../../api/types';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';
import {
  APPLICATION_STATUS_STEPS,
  feeStatusLabel,
  statusLabel,
  statusStepIndex,
} from '../Applications/applicationStatus';

const H_PAD = hPad(5);

export type TrackApplicationStatusScreenProps = {
  detail: ApplicationDetailDto | null | undefined;
  loading: boolean;
  loadFailed?: boolean;
  onBack: () => void;
};

function FeeRow({fee}: {fee: ApplicationFeeDto}) {
  const title =
    fee.feeType === 'application_fee'
      ? 'Application fee'
      : fee.feeType === 'registration_fee'
        ? 'Registration fee'
        : 'Tuition fee';
  const sym = '$';
  return (
    <View style={feeStyles.row}>
      <View style={feeStyles.left}>
        <Text style={feeStyles.title}>{title}</Text>
        <Text style={feeStyles.amount}>
          {sym}
          {fee.paidAmount.toLocaleString()} / {sym}
          {fee.requiredAmount.toLocaleString()}
        </Text>
      </View>
      <Text style={feeStyles.status}>
        {feeStatusLabel(fee.status, fee.paidAmount, fee.requiredAmount)}
      </Text>
    </View>
  );
}

export const TrackApplicationStatusScreen = memo(function TrackApplicationStatusScreen({
  detail,
  loading,
  loadFailed,
  onBack,
}: TrackApplicationStatusScreenProps) {
  const insets = useSafeAreaInsets();
  const app = detail?.application;
  const course = detail?.course;
  const currentIdx = app ? statusStepIndex(app.status) : 0;
  const isTerminal =
    app?.status === 'rejected' ||
    app?.status === 'visa_rejected' ||
    app?.status === 'withdrawn';

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
          <ChevronLeftIcon size={22} color={colors.white} />
          <Text style={styles.backLabel}>{en.applicationsTab.trackBack}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{en.applicationsTab.trackTitle}</Text>
        {course ? (
          <Text style={styles.headerSub} numberOfLines={2}>
            {course.name} · {detail?.university.name ?? course.universityName}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : loadFailed || !detail ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{en.applicationsTab.trackLoadFailed}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{en.applicationsTab.currentStatus}</Text>
            <Text style={styles.summaryStatus}>{statusLabel(app!.status)}</Text>
            {app!.intakeLabel ? (
              <Text style={styles.summaryMeta}>Intake: {app!.intakeLabel}</Text>
            ) : null}
            {app!.submittedAt ? (
              <Text style={styles.summaryMeta}>
                Submitted{' '}
                {new Date(app!.submittedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>{en.applicationsTab.progressTitle}</Text>
          <View style={styles.timeline}>
            {APPLICATION_STATUS_STEPS.map((step, i) => {
              const done = !isTerminal && i <= currentIdx;
              const active = !isTerminal && i === currentIdx;
              const last = i === APPLICATION_STATUS_STEPS.length - 1;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.stepDot,
                        done && styles.stepDotDone,
                        active && styles.stepDotActive,
                      ]}>
                      {done ? (
                        <Check size={12} color={colors.white} strokeWidth={3} />
                      ) : (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    {!last ? (
                      <View
                        style={[
                          styles.stepLine,
                          done && styles.stepLineDone,
                        ]}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      done && styles.stepLabelDone,
                      active && styles.stepLabelActive,
                    ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {isTerminal ? (
            <View style={styles.alertCard}>
              <Text style={styles.alertText}>
                {statusLabel(app!.status)} — contact support if you need help.
              </Text>
            </View>
          ) : null}

          {(detail.applicationFees?.length ?? 0) > 0 ? (
            <>
              <Text style={styles.sectionTitle}>{en.applicationsTab.feesTitle}</Text>
              <View style={styles.feesCard}>
                {detail.applicationFees!.map(f => (
                  <FeeRow key={f.id} fee={f} />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
});

const feeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  left: {flex: 1, gap: 2},
  title: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.navy,
  },
  amount: {fontSize: FontSizes.size12, color: colors.textSecondary},
  status: {
    fontSize: FontSizes.size12,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
  },
  backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  backLabel: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.medium,
    color: colors.white,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontWeight: Weights.extrabold,
    color: colors.white,
    letterSpacing: -0.24,
  },
  headerSub: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.medium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    lineHeight: 20,
  },
  spinner: {marginTop: 48},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: H_PAD},
  errorText: {fontSize: FontSizes.body, color: colors.textSecondary, textAlign: 'center'},
  scroll: {flex: 1},
  content: {padding: H_PAD, gap: 16},
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  summaryLabel: {
    fontSize: FontSizes.size12,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryStatus: {
    fontSize: FontSizes.size18,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  summaryMeta: {fontSize: FontSizes.size13, color: colors.textSecondary},
  sectionTitle: {
    fontSize: FontSizes.size16,
    fontWeight: Weights.bold,
    color: colors.navy,
    marginTop: 4,
  },
  timeline: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 0,
  },
  stepRow: {flexDirection: 'row', gap: 12, minHeight: 44},
  stepRail: {width: 24, alignItems: 'center'},
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTeal,
  },
  stepDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
    minHeight: 20,
  },
  stepLineDone: {backgroundColor: colors.accentTeal},
  stepLabel: {
    flex: 1,
    fontSize: FontSizes.size14,
    color: colors.textSecondary,
    paddingBottom: 16,
    paddingTop: 2,
  },
  stepLabelDone: {color: colors.navy, fontWeight: Weights.medium},
  stepLabelActive: {color: colors.primary, fontWeight: Weights.bold},
  alertCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: rad.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  alertText: {fontSize: FontSizes.size14, color: '#BE123C', lineHeight: 20},
  feesCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
});
