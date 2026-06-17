/**
 * Application Detail — screen 5.2
 * API: GET /partner/applications/:id
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {ChevronLeft, Check, MessageCircle, FileText, Download} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  ApplicationDocumentDto,
  ApplicationJourneyStageDto,
  PartnerApplicationDetailDto,
} from '../../../../api/partnerTypes';
import {formatAgentMoney, studentInitials} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {FontSizes, Weights} from '../../../../utils';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  detail: PartnerApplicationDetailDto | null | undefined;
  loading: boolean;
  refreshing: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onPrimaryAction: () => void;
  onWhatsApp: () => void;
  onContactUniversity: () => void;
  onDownloadOffer: () => void;
};

const docStatusLabel: Record<string, string> = {
  verified: 'Ready',
  under_review: 'In-Review',
  required_by_university: 'Required',
  not_submitted: 'Not submitted',
};

const docStatusColor: Record<string, {bg: string; text: string}> = {
  verified: {bg: agentColors.mintLight, text: colors.tagGreen},
  under_review: {bg: colors.matchBadgeBg, text: colors.matchBadgeText},
  required_by_university: {bg: colors.matchBadgeBg, text: colors.primary},
  not_submitted: {bg: colors.chipBg, text: colors.textMuted},
};

function JourneyStep({
  stage,
  index,
  isLast,
}: {
  stage: ApplicationJourneyStageDto;
  index: number;
  isLast: boolean;
}) {
  const done = stage.status === 'completed';
  const active = stage.status === 'in_progress';

  return (
    <View style={styles.journeyRow}>
      <View style={styles.journeyRail}>
        <View
          style={[
            styles.journeyDot,
            done && styles.journeyDone,
            active && styles.journeyActive,
          ]}>
          {done ? <Check size={12} color={colors.white} strokeWidth={3} /> : null}
        </View>
        {!isLast ? <View style={[styles.journeyLine, done && styles.journeyLineDone]} /> : null}
      </View>
      <View style={styles.journeyBody}>
        <View style={styles.journeyTitleRow}>
          <Text style={[styles.journeyLabel, (done || active) && styles.journeyLabelActive]}>
            {stage.label}
          </Text>
          {active ? (
            <View style={styles.inReviewBadge}>
              <Text style={styles.inReviewText}>In-Review</Text>
            </View>
          ) : null}
        </View>
        {stage.reachedAt ? (
          <Text style={styles.journeyDate}>
            {new Date(stage.reachedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function DocRow({doc}: {doc: ApplicationDocumentDto}) {
  const sc = docStatusColor[doc.status] ?? docStatusColor.not_submitted;
  return (
    <View style={styles.docRow}>
      <FileText size={16} color={sc.text} />
      <View style={styles.docBody}>
        <Text style={styles.docLabel}>{doc.label}</Text>
        {doc.note ? <Text style={styles.docNote}>{doc.note}</Text> : null}
      </View>
      <View style={[styles.docBadge, {backgroundColor: sc.bg}]}>
        <Text style={[styles.docBadgeText, {color: sc.text}]}>
          {docStatusLabel[doc.status] ?? doc.status}
        </Text>
      </View>
    </View>
  );
}

export const StudentApplicationScreen = memo(function StudentApplicationScreen({
  detail,
  loading,
  refreshing,
  actionLoading,
  onRefresh,
  onBack,
  onPrimaryAction,
  onWhatsApp,
  onContactUniversity,
  onDownloadOffer,
}: Props) {
  const insets = useSafeAreaInsets();
  const journey = detail?.journey ?? [];
  const hasFooter = detail?.actions?.primaryCta != null;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.navy} />
        </Pressable>
        <Text style={agentType.screenTitle}>Application Detail</Text>
      </View>

      {loading && !detail ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + (hasFooter ? 120 : 24)},
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <View style={styles.studentSummary}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentInitials}>
                {studentInitials(detail?.student.name ?? '')}
              </Text>
            </View>
            <View>
              <Text style={styles.studentName}>{detail?.student.name}</Text>
              <Text style={styles.studentCountry}>{detail?.student.country}</Text>
            </View>
          </View>

          <View style={styles.appInfoCard}>
            <View style={styles.appInfoTop}>
              <View style={styles.appInfoBody}>
                <Text style={styles.appCourse}>{detail?.course.name}</Text>
                <Text style={styles.appUni}>{detail?.course.university}</Text>
                {detail?.course.startDate ? (
                  <Text style={styles.appDate}>Start {detail.course.startDate}</Text>
                ) : (
                  <Text style={styles.appDate}>
                    Intake {detail?.course.intakeSeason} {detail?.course.intakeYear}
                  </Text>
                )}
              </View>
              {detail?.statusLabel ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{detail.statusLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.commissionBox}>
            <Text style={styles.commissionLabel}>
              Est. commission:{' '}
              {formatAgentMoney(detail?.commission.amount ?? 0, detail?.commission.currency)}
            </Text>
            <Text style={styles.commissionSub}>
              {detail?.commission.confirmedOnEnrollment !== false
                ? 'Confirmed on enrollment'
                : ''}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Application journey</Text>
          <View style={styles.card}>
            {journey.map((s, i) => (
              <JourneyStep key={s.id} stage={s} index={i} isLast={i === journey.length - 1} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.card}>
            {(detail?.documents ?? []).length === 0 ? (
              <Text style={styles.empty}>No documents listed.</Text>
            ) : (
              detail!.documents.map(d => <DocRow key={d.id} doc={d} />)
            )}
          </View>

          {detail?.universityMessage ? (
            <>
              <Text style={styles.sectionTitle}>University Communications</Text>
              <View style={styles.commCard}>
                <Text style={styles.commFrom}>{detail.universityMessage.from}</Text>
                <Text style={styles.commUni}>{detail.universityMessage.university}</Text>
                <Text style={styles.commBody}>{detail.universityMessage.body}</Text>
                <View style={styles.commActions}>
                  {detail.actions.canWhatsAppStudent ? (
                    <Pressable style={styles.whatsappBtn} onPress={onWhatsApp}>
                      <MessageCircle size={16} color={colors.white} />
                      <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                    </Pressable>
                  ) : null}
                  {detail.actions.canContactUniversity ? (
                    <Pressable style={styles.contactBtn} onPress={onContactUniversity}>
                      <Text style={styles.contactBtnText}>Contact university</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </>
          ) : null}

          {detail?.actions.canDownloadOfferLetter ? (
            <Pressable style={styles.downloadBtn} onPress={onDownloadOffer}>
              <Download size={16} color={colors.primary} />
              <Text style={styles.downloadText}>Download offer letter</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {detail?.actions?.primaryCta ? (
        <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
          <Pressable
            style={[styles.primaryBtn, actionLoading && styles.btnDisabled]}
            onPress={onPrimaryAction}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>{detail.actions.primaryCta} →</Text>
            )}
          </Pressable>
          {detail.actions.primaryCtaSubtext ? (
            <Text style={styles.footerSub}>{detail.actions.primaryCtaSubtext}</Text>
          ) : detail.commission.amount > 0 ? (
            <Text style={styles.footerSub}>
              Commission of {formatAgentMoney(detail.commission.amount, detail.commission.currency)}{' '}
              confirmed upon enrollment
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backRow: {marginBottom: 4},
  spinner: {marginTop: 40},
  content: {paddingHorizontal: H_PAD, paddingTop: 12},
  studentSummary: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12},
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInitials: {fontSize: 16, fontWeight: '800', color: colors.agentMint},
  studentName: {fontSize: 16, fontWeight: '800', color: colors.navy},
  studentCountry: {fontSize: 13, color: colors.textSecondary},
  appInfoCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  appInfoTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  appInfoBody: {flex: 1},
  appCourse: {fontSize: 16, fontWeight: '800', color: colors.navy},
  appUni: {fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 4, letterSpacing: 0.3},
  appDate: {fontSize: 12, color: colors.textSecondary, marginTop: 4},
  statusBadge: {
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.full,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  commissionBox: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 14,
  },
  commissionLabel: {fontSize: 14, fontWeight: '700', color: colors.navy},
  commissionSub: {fontSize: 12, color: colors.textSecondary, marginTop: 2},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  journeyRow: {flexDirection: 'row', gap: 12, minHeight: 56},
  journeyRail: {alignItems: 'center', width: 28},
  journeyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.profileProgressTrack,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyDone: {backgroundColor: colors.agentMint, borderColor: colors.agentMint},
  journeyActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  journeyLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.profileProgressTrack,
    marginVertical: 4,
  },
  journeyLineDone: {backgroundColor: colors.agentMint},
  journeyBody: {flex: 1, paddingBottom: 12},
  journeyTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  journeyLabel: {fontSize: 14, fontWeight: '600', color: colors.textSecondary},
  journeyLabelActive: {color: colors.navy, fontWeight: '800'},
  inReviewBadge: {
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: rad.full,
  },
  inReviewText: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  journeyDate: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docBody: {flex: 1},
  docLabel: {fontSize: FontSizes.caption, fontWeight: Weights.medium, color: colors.textPrimary},
  docNote: {fontSize: 11, color: colors.textSecondary, marginTop: 2},
  docBadge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: rad.full},
  docBadgeText: {fontSize: 10, fontWeight: '700'},
  commCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  commFrom: {fontSize: 14, fontWeight: '800', color: colors.navy},
  commUni: {fontSize: 12, color: colors.textSecondary, marginTop: 2},
  commBody: {fontSize: 13, color: colors.textPrimary, marginTop: 10, lineHeight: 20},
  commActions: {flexDirection: 'row', gap: 10, marginTop: 14},
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.agentMint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: rad.full,
  },
  whatsappBtnText: {color: colors.white, fontWeight: '700', fontSize: 13},
  contactBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rad.full,
    paddingVertical: 10,
  },
  contactBtnText: {fontSize: 13, fontWeight: '700', color: colors.navy},
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  downloadText: {fontSize: 14, fontWeight: '700', color: colors.primary},
  empty: {fontSize: FontSizes.caption, color: colors.textSecondary},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {opacity: 0.7},
  primaryBtnText: {color: colors.white, fontWeight: Weights.bold, fontSize: FontSizes.body},
  footerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
