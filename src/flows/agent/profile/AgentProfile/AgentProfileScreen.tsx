/**
 * Agent profile — Figma node 831:3548
 * API: GET /partner/me
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
import {ChevronRight, Bell, Shield, LogOut} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerMeDto} from '../../../../api/partnerTypes';
import {MilestoneTracker} from '../../components/MilestoneTracker';
import {formatAgentMoney, studentInitials} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  profile: PartnerMeDto | null | undefined;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onNotifications: () => void;
  onAccountSecurity: () => void;
  onLogout: () => void;
};

function SettingsRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export const AgentProfileScreen = memo(function AgentProfileScreen({
  profile,
  loading,
  refreshing,
  onRefresh,
  onNotifications,
  onAccountSecurity,
  onLogout,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 16}]}>
        {loading && !profile ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{studentInitials(profile?.name ?? 'A')}</Text>
            </View>
            <Text style={styles.name}>{profile?.name ?? 'Partner'}</Text>
            <Text style={styles.email}>{profile?.email}</Text>
            <Text style={styles.org}>{profile?.organization}</Text>
          </>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.stats.students ?? 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.stats.applications ?? 0}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.stats.offers ?? 0}</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.stats.enrolled ?? 0}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
        </View>

        {profile?.earnings ? (
          <View style={styles.section}>
            <Text style={agentType.sectionTitle}>Earnings</Text>
            <View style={styles.earningsCard}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Confirmed</Text>
                <Text style={styles.earningsValue}>
                  {formatAgentMoney(profile.earnings.confirmed, profile.earnings.currency)}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Pending</Text>
                <Text style={styles.earningsValue}>
                  {formatAgentMoney(profile.earnings.pending, profile.earnings.currency)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {(profile?.milestones?.length ?? 0) > 0 ? (
          <View style={styles.section}>
            <Text style={agentType.sectionTitle}>Milestones</Text>
            <View style={styles.milestoneCard}>
              <MilestoneTracker milestones={profile!.milestones} />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={agentType.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon={<Bell size={18} color={colors.primary} />}
              label="Notifications"
              onPress={onNotifications}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon={<Shield size={18} color={colors.primary} />}
              label="Account & security"
              onPress={onAccountSecurity}
            />
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={18} color={colors.primary} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: 24,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {fontSize: 24, fontWeight: '800', color: colors.white},
  name: {fontSize: 22, fontWeight: '800', color: colors.white},
  email: {fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 4},
  org: {fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 2},
  scroll: {paddingHorizontal: H_PAD, paddingTop: 16, gap: 20},
  statsRow: {flexDirection: 'row', gap: 8},
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {fontSize: 16, fontWeight: '800', color: colors.navy},
  statLabel: {fontSize: 9, fontWeight: '600', color: colors.textSecondary, marginTop: 2},
  section: {gap: 10},
  earningsCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  earningsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  earningsLabel: agentType.bodyMuted,
  earningsValue: {fontSize: 14, fontWeight: '700', color: colors.navy},
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  settingsLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  settingsLabel: {fontSize: 15, fontWeight: '600', color: colors.navy},
  divider: {height: 1, backgroundColor: colors.border, marginHorizontal: 14},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {fontSize: 15, fontWeight: '700', color: colors.primary},
});
