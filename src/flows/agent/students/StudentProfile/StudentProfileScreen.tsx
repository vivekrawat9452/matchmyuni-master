/**
 * Student Profile — screen 5.1 + chase dialog 5.1.1
 * API: GET /partner/students/:userId, GET /partner/students/:userId/recommendations
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
  Modal,
} from 'react-native';
import {ChevronLeft, MessageCircle, AlertCircle} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerCourseRecommendationDto,
  PartnerStudentDetailDto,
  ProfileCompletenessItemDto,
} from '../../../../api/partnerTypes';
import {PipelineProgress} from '../../components/PipelineProgress';
import {formatAgentMoney, studentInitials} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {FontSizes, Weights} from '../../../../utils';
import {hPad, rad, touch} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  detail: PartnerStudentDetailDto | null | undefined;
  recommendations: PartnerCourseRecommendationDto[];
  recommendationsLoading: boolean;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onApplicationPress: (applicationId: string) => void;
  onActionUpload: (applicationId: string) => void;
  onChasePress: (item: ProfileCompletenessItemDto) => void;
  onWhatsApp: () => void;
  chaseItem: ProfileCompletenessItemDto | null;
  onChaseConfirm: () => void;
  onChaseDismiss: () => void;
};

function ChaseDialog({
  item,
  studentName,
  onConfirm,
  onDismiss,
}: {
  item: ProfileCompletenessItemDto;
  studentName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDismiss}>
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
          <View style={styles.modalIcon}>
            <MessageCircle size={28} color={colors.agentMint} />
          </View>
          <Text style={styles.modalTitle}>Chase student</Text>
          <Text style={styles.modalBody}>
            Send a reminder to {studentName} to provide:{' '}
            <Text style={styles.modalHighlight}>{item.label}</Text>
          </Text>
          <Pressable style={styles.modalPrimary} onPress={onConfirm}>
            <Text style={styles.modalPrimaryText}>Send via WhatsApp</Text>
          </Pressable>
          <Pressable style={styles.modalSecondary} onPress={onDismiss}>
            <Text style={styles.modalSecondaryText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatAddedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const StudentProfileScreen = memo(function StudentProfileScreen({
  detail,
  recommendations,
  recommendationsLoading,
  loading,
  refreshing,
  onRefresh,
  onBack,
  onApplicationPress,
  onActionUpload,
  onChasePress,
  onWhatsApp,
  chaseItem,
  onChaseConfirm,
  onChaseDismiss,
}: Props) {
  const insets = useSafeAreaInsets();
  const pct = detail?.profileCompleteness.percentage ?? 0;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.navy} />
        </Pressable>
        <Text style={agentType.screenTitle}>Student Profile</Text>
      </View>

      {loading && !detail ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatarLg}>
                <Text style={styles.avatarLgText}>{studentInitials(detail?.user.name ?? '')}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{detail?.user.name}</Text>
                <Text style={styles.profileMeta}>{detail?.user.country}</Text>
                <Text style={styles.profileMeta}>{detail?.user.email}</Text>
                <Text style={styles.profileMeta}>{detail?.user.phone}</Text>
                {detail?.user.dateAdded ? (
                  <Text style={styles.addedDate}>Added {formatAddedDate(detail.user.dateAdded)}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.profileActions}>
              <Pressable style={styles.whatsappBtn} onPress={onWhatsApp}>
                <MessageCircle size={16} color={colors.white} />
                <Text style={styles.whatsappBtnText}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>

          {detail?.actionNeeded ? (
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <AlertCircle size={18} color={colors.matchBadgeText} />
                <Text style={styles.alertTitle}>Action needed</Text>
              </View>
              <Text style={styles.alertText}>{detail.actionNeeded.message}</Text>
              <Pressable
                style={styles.alertLink}
                onPress={() => onActionUpload(detail.actionNeeded!.applicationId)}>
                <Text style={styles.alertLinkText}>Upload now →</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Their Applications</Text>
          {(detail?.applications ?? []).length === 0 ? (
            <Text style={styles.empty}>No applications yet.</Text>
          ) : (
            detail!.applications.map(app => (
              <View key={app.id} style={styles.appCard}>
                <View style={styles.appCardTop}>
                  <View style={styles.appCardBody}>
                    <Text style={styles.appCourse}>{app.courseName}</Text>
                    <Text style={styles.appUni}>{app.universityName}</Text>
                  </View>
                  <View style={[styles.appStatusBadge, {backgroundColor: colors.matchBadgeBg}]}>
                    <Text style={styles.appStatusText}>{app.statusLabel}</Text>
                  </View>
                </View>
                <PipelineProgress activeIndex={app.pipelinePosition} compact />
                {app.submittedAt ? (
                  <Text style={styles.appSubmitted}>
                    Submitted {formatAddedDate(app.submittedAt)}
                  </Text>
                ) : null}
                <Pressable style={styles.trackBtn} onPress={() => onApplicationPress(app.id)}>
                  <Text style={styles.trackBtnText}>Track application status →</Text>
                </Pressable>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Profile Completeness</Text>
          <View style={styles.card}>
            <View style={styles.completenessRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: `${pct}%`}]} />
              </View>
              <Text style={styles.pctText}>{pct}%</Text>
            </View>
            {(detail?.profileCompleteness.missing ?? []).map((item, i) => (
              <View key={`${item.label}-${i}`} style={styles.missingRow}>
                <Text style={styles.missingLabel}>{item.label}</Text>
                {item.chaseable ? (
                  <Pressable onPress={() => onChasePress(item)}>
                    <Text style={styles.chaseLink}>Chase →</Text>
                  </Pressable>
                ) : item.uploadable ? (
                  <Text style={styles.uploadLink}>Upload →</Text>
                ) : null}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommended Programs</Text>
          {recommendationsLoading ? (
            <ActivityIndicator color={colors.primary} style={{marginVertical: 12}} />
          ) : recommendations.length === 0 ? (
            <Text style={styles.empty}>No recommendations available for this student.</Text>
          ) : (
            recommendations.map(course => (
              <View key={course.courseId} style={styles.recCard}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{course.matchScore}% Match</Text>
                </View>
                <Text style={styles.recCourse}>{course.name}</Text>
                <Text style={styles.recUni}>{course.university}</Text>
                <View style={styles.recMeta}>
                  {course.scholarshipPercent != null ? (
                    <Text style={styles.recTag}>{course.scholarshipPercent}% Scholarship</Text>
                  ) : null}
                  {course.visaSuccessPercent != null ? (
                    <Text style={styles.recTag}>{course.visaSuccessPercent}% Visa success</Text>
                  ) : null}
                </View>
                {course.fees ? (
                  <Text style={styles.recFee}>
                    {formatAgentMoney(course.fees.amount, course.fees.currency)}
                    {course.fees.period ? ` / ${course.fees.period}` : ''}
                  </Text>
                ) : null}
                {course.estimatedCommission != null ? (
                  <Text style={styles.recCommission}>
                    Est. commission:{' '}
                    {formatAgentMoney(
                      course.estimatedCommission,
                      course.commissionCurrency ?? 'USD',
                    )}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {chaseItem ? (
        <ChaseDialog
          item={chaseItem}
          studentName={detail?.user.name ?? 'student'}
          onConfirm={onChaseConfirm}
          onDismiss={onChaseDismiss}
        />
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
  content: {paddingHorizontal: H_PAD, paddingTop: 12, gap: 4},
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 8,
  },
  profileTop: {flexDirection: 'row', gap: 14},
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: {fontSize: 22, fontWeight: '800', color: colors.agentMint},
  profileInfo: {flex: 1},
  profileName: {fontSize: 18, fontWeight: '800', color: colors.navy},
  profileMeta: {fontSize: 13, color: colors.textSecondary, marginTop: 2},
  addedDate: {fontSize: 12, color: colors.textMuted, marginTop: 6},
  profileActions: {flexDirection: 'row', gap: 10, marginTop: 14},
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.agentMint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: rad.full,
  },
  whatsappBtnText: {color: colors.white, fontWeight: '700', fontSize: 13},
  alertCard: {
    backgroundColor: colors.matchBadgeBg,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.yellowBadge,
    marginBottom: 8,
  },
  alertHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6},
  alertTitle: {fontSize: 14, fontWeight: '800', color: colors.matchBadgeText},
  alertText: {fontSize: 13, color: colors.matchBadgeText, lineHeight: 18},
  alertLink: {marginTop: 8},
  alertLinkText: {fontSize: 13, fontWeight: '700', color: colors.primary},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completenessRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.profileProgressTrack,
    overflow: 'hidden',
  },
  progressFill: {height: 8, borderRadius: 4, backgroundColor: colors.agentMint},
  pctText: {fontSize: 14, fontWeight: '800', color: colors.navy},
  missingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  missingLabel: {fontSize: FontSizes.caption, color: colors.textPrimary, flex: 1},
  chaseLink: {fontSize: FontSizes.caption, color: colors.primary, fontWeight: Weights.bold},
  uploadLink: {fontSize: FontSizes.caption, color: colors.primary, fontWeight: Weights.bold},
  appCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  appCardTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  appCardBody: {flex: 1},
  appCourse: {fontSize: 15, fontWeight: '800', color: colors.navy},
  appUni: {fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 2, letterSpacing: 0.5},
  appStatusBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: rad.full, alignSelf: 'flex-start'},
  appStatusText: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  appSubmitted: {fontSize: 12, color: colors.textSecondary, marginTop: 10},
  trackBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: rad.full,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: {color: colors.white, fontWeight: '700', fontSize: 14},
  recCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: agentColors.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: rad.full,
    marginBottom: 8,
  },
  matchBadgeText: {fontSize: 11, fontWeight: '700', color: colors.tagGreen},
  recCourse: {fontSize: 15, fontWeight: '800', color: colors.navy},
  recUni: {fontSize: 12, color: colors.textSecondary, marginTop: 2},
  recMeta: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8},
  recTag: {fontSize: 11, fontWeight: '600', color: colors.tagGreen},
  recFee: {fontSize: 14, fontWeight: '800', color: colors.navy, marginTop: 8},
  recCommission: {fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 4},
  empty: {fontSize: FontSizes.caption, color: colors.textSecondary, marginBottom: 8},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 42, 74, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: rad.xl,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {fontSize: 20, fontWeight: Weights.extrabold, color: colors.textPrimary},
  modalBody: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  modalHighlight: {fontWeight: Weights.bold, color: colors.textPrimary},
  modalPrimary: {
    backgroundColor: colors.agentMint,
    height: touch.minH,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  modalPrimaryText: {color: colors.white, fontWeight: Weights.bold, fontSize: FontSizes.body},
  modalSecondary: {marginTop: 12, padding: 8},
  modalSecondaryText: {color: colors.textSecondary, fontSize: FontSizes.body},
});
