/**
 * Applications tab overview — Figma node 826:2346
 * API: GET /partner/applications
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
import {ChevronRight, AlertCircle} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerApplicationListItemDto,
  PartnerApplicationsPageDto,
} from '../../../../api/partnerTypes';
import {PipelineProgress} from '../../components/PipelineProgress';
import {formatAgentMoney} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  data: PartnerApplicationsPageDto | null | undefined;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onViewShortlist: () => void;
  onSeeAllApplications: () => void;
  onSeeNeedsAction: () => void;
  onApplicationPress: (applicationId: string) => void;
};

function pipelineActiveIndex(pipeline: PartnerApplicationsPageDto['pipeline']): number {
  if (pipeline.enrolled > 0) return 3;
  if (pipeline.offers > 0) return 2;
  if (pipeline.inReview > 0) return 1;
  return 0;
}

function ActionCard({
  item,
  onPress,
}: {
  item: PartnerApplicationListItemDto;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <AlertCircle size={18} color={colors.primary} />
      </View>
      <View style={styles.actionBody}>
        <Text style={styles.actionStudent} numberOfLines={1}>
          {item.studentName}
        </Text>
        <Text style={styles.actionCourse} numberOfLines={1}>
          {item.courseName}
        </Text>
        <Text style={styles.actionLabel}>{item.actionLabel ?? item.statusLabel}</Text>
      </View>
      {item.urgencyLabel ? (
        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyText}>{item.urgencyLabel}</Text>
        </View>
      ) : null}
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export const AgentApplicationsOverviewScreen = memo(function AgentApplicationsOverviewScreen({
  data,
  loading,
  refreshing,
  onRefresh,
  onViewShortlist,
  onSeeAllApplications,
  onSeeNeedsAction,
  onApplicationPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const pipeline = data?.pipeline;
  const activeIdx = pipeline ? pipelineActiveIndex(pipeline) : 0;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <Text style={styles.headerTitle}>Applications</Text>
        <Text style={styles.headerSub}>
          {data?.summary.activeCount ?? 0} active · {data?.summary.needsActionToday ?? 0} need
          action today
        </Text>
      </View>

      {loading && !data ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.summaryRow}>
            <Pressable style={styles.summaryCard} onPress={onViewShortlist}>
              <Text style={styles.summaryValue}>{data?.shortlistCount ?? 0}</Text>
              <Text style={styles.summaryLabel}>Shortlisted courses</Text>
              <Text style={styles.summaryLink}>View shortlist →</Text>
            </Pressable>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {formatAgentMoney(
                  data?.earningsProjection.amount ?? 0,
                  data?.earningsProjection.currency ?? 'USD',
                )}
              </Text>
              <Text style={styles.summaryLabel}>If all offers convert</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={agentType.sectionTitle}>Pipeline</Text>
            <View style={styles.pipelineCard}>
              <PipelineProgress activeIndex={activeIdx} />
              <View style={styles.pipelineCounts}>
                <Text style={styles.pipelineCount}>
                  {pipeline?.applied ?? 0} applied
                </Text>
                <Text style={styles.pipelineCount}>
                  {pipeline?.inReview ?? 0} in review
                </Text>
                <Text style={styles.pipelineCount}>
                  {pipeline?.offers ?? 0} offers
                </Text>
                <Text style={styles.pipelineCount}>
                  {pipeline?.enrolled ?? 0} enrolled
                </Text>
              </View>
            </View>
          </View>

          {(data?.needsAction?.length ?? 0) > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={agentType.sectionTitle}>Needs action</Text>
                <Pressable onPress={onSeeNeedsAction} hitSlop={8}>
                  <Text style={styles.seeAll}>See all →</Text>
                </Pressable>
              </View>
              {data!.needsAction.slice(0, 3).map(item => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onPress={() => onApplicationPress(item.id)}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={agentType.sectionTitle}>Recent applications</Text>
              <Pressable onPress={onSeeAllApplications} hitSlop={8}>
                <Text style={styles.seeAll}>See all applications →</Text>
              </Pressable>
            </View>
            {(data?.applications ?? []).slice(0, 4).map(item => (
              <Pressable
                key={item.id}
                style={styles.appRow}
                onPress={() => onApplicationPress(item.id)}>
                <View style={styles.appBody}>
                  <Text style={styles.appStudent}>{item.studentName}</Text>
                  <Text style={styles.appCourse} numberOfLines={1}>
                    {item.courseName}
                  </Text>
                  <Text style={styles.appStatus}>{item.statusLabel}</Text>
                </View>
                <Text style={styles.appCommission}>
                  {formatAgentMoney(item.estimatedCommission, item.commissionCurrency)}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  headerTitle: {fontSize: 22, fontWeight: '800', color: colors.white},
  headerSub: {fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 4},
  spinner: {marginTop: 48},
  scroll: {paddingHorizontal: H_PAD, paddingTop: 16, gap: 20},
  summaryRow: {flexDirection: 'row', gap: 12},
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {fontSize: 20, fontWeight: '800', color: colors.navy},
  summaryLabel: {fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginTop: 4},
  summaryLink: {fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 8},
  section: {gap: 10},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  seeAll: {fontSize: 12, fontWeight: '700', color: colors.primary},
  pipelineCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  pipelineCounts: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pipelineCount: {fontSize: 11, fontWeight: '600', color: colors.textSecondary},
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.matchBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: {flex: 1, gap: 2},
  actionStudent: agentType.cardTitle,
  actionCourse: agentType.bodyMuted,
  actionLabel: {fontSize: 11, fontWeight: '700', color: colors.primary},
  urgencyBadge: {
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.sm,
  },
  urgencyText: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  appBody: {flex: 1, gap: 2},
  appStudent: agentType.cardTitle,
  appCourse: agentType.bodyMuted,
  appStatus: {fontSize: 11, fontWeight: '600', color: colors.agentMint},
  appCommission: {fontSize: 12, fontWeight: '700', color: colors.navy},
});
