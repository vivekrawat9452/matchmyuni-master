/**
 * My Milestones — screen 3.1 Advisor journey
 * API: GET /partner/milestones
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import {ChevronLeft, Check, Lock} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerMilestoneDto} from '../../../../api/partnerTypes';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(4.1);

type Props = {
  milestones: PartnerMilestoneDto[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onEarnings: () => void;
};

function MilestonePill({m}: {m: PartnerMilestoneDto}) {
  const achieved = m.status === 'achieved';
  const active = m.status === 'in_progress';
  return (
    <View
      style={[
        styles.pill,
        achieved && styles.pillDone,
        active && styles.pillActive,
      ]}>
      <Text
        style={[
          styles.pillText,
          achieved && {color: colors.tagGreen},
          active && {color: agentColors.inProgressText},
        ]}>
        {m.label}
      </Text>
      {active ? <Text style={styles.pillSub}>In-progress</Text> : null}
    </View>
  );
}

function formatMilestoneDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DetailCard({m}: {m: PartnerMilestoneDto}) {
  const achieved = m.status === 'achieved';
  const active = m.status === 'in_progress';
  const locked = m.status === 'locked';
  const pct =
    active && m.currentCount != null && m.targetCount
      ? Math.min(100, (m.currentCount / m.targetCount) * 100)
      : achieved
        ? 100
        : 0;

  return (
    <View style={[styles.detailCard, active && styles.detailCardActive]}>
      <View style={styles.detailTop}>
        <View style={[styles.detailIcon, achieved && styles.detailIconDone, locked && styles.detailIconLocked]}>
          {achieved ? (
            <Check size={16} color={colors.white} />
          ) : locked ? (
            <Lock size={16} color={colors.textMuted} />
          ) : (
            <View style={styles.progressRing}>
              <Text style={styles.progressRingText}>
                {m.currentCount ?? 0}/{m.targetCount ?? '—'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.detailBody}>
          <Text style={agentType.cardTitle}>{m.label}</Text>
          {achieved ? (
            <Text style={[agentType.bodyMuted, {color: agentColors.doneText}]}>
              Done{m.achievedAt ? ` · ${formatMilestoneDate(m.achievedAt)}` : ''}
            </Text>
          ) : locked ? (
            <Text style={agentType.bodyMuted}>Locked</Text>
          ) : (
            <Text style={agentType.bodyMuted}>
              {m.currentCount ?? 0}/{m.targetCount ?? '—'}
            </Text>
          )}
        </View>
        {achieved ? (
          <Text style={styles.doneBadge}>Done</Text>
        ) : locked ? (
          <Text style={styles.lockedBadge}>Locked</Text>
        ) : null}
      </View>
      {!locked ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${pct}%`}]} />
        </View>
      ) : null}
      {active && m.targetCount != null && m.currentCount != null ? (
        <Text style={styles.detailMeta}>
          {m.targetCount - m.currentCount} more to unlock
          {m.rewardLabel ? ` · ${m.rewardLabel}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

export const AgentMilestonesScreen = memo(function AgentMilestonesScreen({
  milestones,
  loading,
  refreshing,
  onRefresh,
  onBack,
  onEarnings,
}: Props) {
  const insets = useSafeAreaInsets();
  const active = milestones.find(m => m.status === 'in_progress');
  const remaining =
    active?.targetCount != null && active.currentCount != null
      ? Math.max(0, active.targetCount - active.currentCount)
      : null;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.white} />
        </Pressable>
        <Text style={agentType.milestoneEyebrow}>MY MILESTONEs</Text>
        <Text style={agentType.milestoneHero}>Advisor journey</Text>
        <Pressable style={styles.earningsLink} onPress={onEarnings}>
          <Text style={styles.earningsLinkText}>View earning overview →</Text>
        </Pressable>
      </View>

      {loading && milestones.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 24}]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {milestones.map(m => (
              <MilestonePill key={m.id} m={m} />
            ))}
          </ScrollView>

          {remaining != null ? (
            <Text style={styles.remaining}>
              {remaining} more student{remaining === 1 ? '' : 's'} to your next milestone
            </Text>
          ) : null}

          <Text style={[agentType.sectionTitle, styles.sectionGap]}>Milestone Detail</Text>
          {milestones.map(m => (
            <DetailCard key={m.id} m={m} />
          ))}
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
  backRow: {marginBottom: 8},
  earningsLink: {marginTop: 10},
  earningsLinkText: {fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)'},
  spinner: {marginTop: 40},
  content: {paddingHorizontal: H_PAD, paddingTop: 16},
  pillRow: {gap: 8, paddingRight: 8, marginBottom: 12},
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: agentLayout.pillRadius,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pillDone: {backgroundColor: agentColors.mintLight, borderColor: colors.agentMint},
  pillActive: {backgroundColor: agentColors.inProgressBg, borderColor: colors.yellowBadge},
  pillText: {...agentType.pill, color: colors.textMuted},
  pillSub: {fontSize: 10, fontWeight: '700', color: agentColors.inProgressText, marginTop: 2},
  remaining: {...agentType.body, marginBottom: 16},
  sectionGap: {marginBottom: 10, marginTop: 4},
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  detailCardActive: {borderColor: colors.yellowBadge, borderWidth: 2},
  detailTop: {flexDirection: 'row', gap: 12, alignItems: 'center'},
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIconDone: {backgroundColor: colors.agentMint},
  detailIconLocked: {backgroundColor: colors.chipBg},
  progressRing: {alignItems: 'center', justifyContent: 'center'},
  progressRingText: {fontSize: 10, fontWeight: '800', color: colors.primary},
  detailBody: {flex: 1},
  doneBadge: {fontSize: 12, fontWeight: '700', color: colors.tagGreen},
  lockedBadge: {fontSize: 12, fontWeight: '700', color: colors.textMuted},
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.profileProgressTrack,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {height: 6, borderRadius: 3, backgroundColor: colors.agentMint},
  detailMeta: {...agentType.bodyMuted, marginTop: 6},
});
