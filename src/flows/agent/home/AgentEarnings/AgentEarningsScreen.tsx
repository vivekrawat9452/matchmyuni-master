/**
 * Earning Overview — screen 3.2
 * API: GET /partner/dashboard + GET /partner/applications
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
import {ChevronLeft} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerApplicationListItemDto,
  PartnerEarningsPreviewDto,
} from '../../../../api/partnerTypes';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {formatAgentMoney, studentInitials} from '../../agentUtils';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(4.1);

type Props = {
  earnings: PartnerEarningsPreviewDto | null | undefined;
  applications: PartnerApplicationListItemDto[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onApplicationPress: (applicationId: string) => void;
};

function CommissionRow({
  item,
  onPress,
}: {
  item: PartnerApplicationListItemDto;
  onPress: () => void;
}) {
  const status = item.commissionStatus ?? 'pending';
  const statusColor =
    status === 'confirmed' ? colors.tagGreen : status === 'potential' ? colors.textSecondary : colors.primary;

  return (
    <Pressable style={styles.commissionRow} onPress={onPress}>
      <View style={styles.commissionAvatar}>
        <Text style={styles.commissionInitials}>{studentInitials(item.studentName)}</Text>
      </View>
      <View style={styles.commissionBody}>
        <Text style={styles.commissionName}>{item.studentName}</Text>
        <Text style={agentType.bodyMuted} numberOfLines={1}>
          {item.courseName} · {item.universityName}
        </Text>
      </View>
      <View style={styles.commissionRight}>
        <Text style={styles.commissionAmount}>
          {formatAgentMoney(item.estimatedCommission, item.commissionCurrency)}
        </Text>
        <Text style={[styles.commissionStatus, {color: statusColor}]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </Pressable>
  );
}

export const AgentEarningsScreen = memo(function AgentEarningsScreen({
  earnings,
  applications,
  loading,
  refreshing,
  onRefresh,
  onBack,
  onApplicationPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const currency = earnings?.currency ?? 'USD';
  const total = earnings?.total ?? 0;
  const confirmed = earnings?.confirmed ?? 0;
  const pending = earnings?.pending ?? 0;
  const potential = earnings?.potential ?? 0;
  const barTotal = confirmed + pending + potential || 1;
  const confirmedPct = (confirmed / barTotal) * 100;
  const pendingPct = (pending / barTotal) * 100;
  const potentialPct = (potential / barTotal) * 100;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.white} />
        </Pressable>
        <Text style={agentType.milestoneEyebrow}>MY EARNINGS</Text>
        <Text style={agentType.milestoneHero}>Earning Overview</Text>
      </View>

      {loading && !earnings ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <View style={styles.totalCard}>
            <View style={styles.totalHeader}>
              <Text style={agentType.sectionTitle}>Total Estimated</Text>
              <View style={styles.estimatedTag}>
                <Text style={styles.estimatedTagText}>Estimated</Text>
              </View>
            </View>
            <Text style={styles.totalAmount}>{formatAgentMoney(total, currency)}</Text>
            {earnings?.applicationCount != null ? (
              <Text style={agentType.bodyMuted}>
                This academic season · {earnings.applicationCount} applications
              </Text>
            ) : null}
            <View style={styles.breakdownList}>
              <BreakdownRow
                label="Confirmed (enrolled students)"
                amount={confirmed}
                currency={currency}
                color={colors.tagGreen}
              />
              <BreakdownRow
                label="Pending (In Progress)"
                amount={pending}
                currency={currency}
                color={colors.primary}
              />
              {potential > 0 ? (
                <BreakdownRow
                  label="Potential (Shortlisted)"
                  amount={potential}
                  currency={currency}
                  color={colors.textSecondary}
                />
              ) : null}
            </View>
            <View style={styles.segmentBar}>
              <View style={[styles.segmentConfirmed, {flex: confirmedPct}]} />
              <View style={[styles.segmentPending, {flex: pendingPct}]} />
              {potential > 0 ? <View style={[styles.segmentPotential, {flex: potentialPct}]} /> : null}
            </View>
            <View style={styles.segmentLegend}>
              {confirmed > 0 ? (
                <Text style={styles.legendItem}>
                  Confirmed {Math.round(confirmedPct)}%
                </Text>
              ) : null}
              {pending > 0 ? (
                <Text style={styles.legendItem}>Pending {Math.round(pendingPct)}%</Text>
              ) : null}
              {potential > 0 ? (
                <Text style={styles.legendItem}>Potential {Math.round(potentialPct)}%</Text>
              ) : null}
            </View>
          </View>

          {earnings?.bonusMessage ? (
            <View style={styles.bonusBanner}>
              <Text style={styles.bonusText}>{earnings.bonusMessage}</Text>
            </View>
          ) : null}

          <Text style={[agentType.sectionTitle, styles.sectionGap]}>By application</Text>
          {applications.length === 0 ? (
            <Text style={agentType.bodyMuted}>No applications with commission data yet.</Text>
          ) : (
            applications.map(item => (
              <CommissionRow
                key={item.id}
                item={item}
                onPress={() => onApplicationPress(item.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
});

function BreakdownRow({
  label,
  amount,
  currency,
  color,
}: {
  label: string;
  amount: number;
  currency: string;
  color: string;
}) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={agentType.bodyMuted}>{label}</Text>
      <Text style={[styles.breakdownAmount, {color}]}>
        {formatAgentMoney(amount, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  backRow: {marginBottom: 8},
  spinner: {marginTop: 40},
  content: {paddingHorizontal: H_PAD, paddingTop: 16},
  totalCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  totalHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  estimatedTag: {
    backgroundColor: agentColors.inProgressBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: rad.full,
  },
  estimatedTagText: {fontSize: 10, fontWeight: '700', color: agentColors.inProgressText},
  totalAmount: {fontSize: 36, fontWeight: '800', color: colors.navy, marginTop: 8},
  breakdownList: {marginTop: 14, gap: 8},
  breakdownRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  breakdownAmount: {fontSize: 14, fontWeight: '700'},
  segmentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  segmentConfirmed: {backgroundColor: colors.agentMint},
  segmentPending: {backgroundColor: colors.primary},
  segmentPotential: {backgroundColor: colors.profileProgressTrack},
  segmentLegend: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8},
  legendItem: {fontSize: 10, fontWeight: '600', color: colors.textSecondary},
  bonusBanner: {
    backgroundColor: agentColors.inProgressBg,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.yellowBadge,
  },
  bonusText: {fontSize: 13, fontWeight: '600', color: colors.matchBadgeText},
  sectionGap: {marginBottom: 10},
  commissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  commissionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commissionInitials: {fontSize: 14, fontWeight: '800', color: colors.agentMint},
  commissionBody: {flex: 1},
  commissionName: {fontSize: 14, fontWeight: '700', color: colors.navy},
  commissionRight: {alignItems: 'flex-end'},
  commissionAmount: {fontSize: 14, fontWeight: '800', color: colors.navy},
  commissionStatus: {fontSize: 11, fontWeight: '700', marginTop: 2},
});
