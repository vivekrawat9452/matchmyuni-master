/**
 * Account & security — Figma node 909:2236
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AgentStackHeader} from '../../components/AgentStackHeader';
import {colors} from '../../../../utils/colors';
import {agentLayout, agentType} from '../../agentStyles';
import {hPad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  email: string;
  organization: string;
  country: string;
  onBack: () => void;
};

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export const AgentAccountSecurityScreen = memo(function AgentAccountSecurityScreen({
  email,
  organization,
  country,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <AgentStackHeader title="Account & security" onBack={onBack} />
      <ScrollView contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        <Text style={agentType.sectionTitle}>Account details</Text>
        <View style={styles.card}>
          <InfoRow label="Email" value={email} />
          <InfoRow label="Organization" value={organization} />
          <InfoRow label="Country" value={country} />
        </View>

        <Text style={agentType.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <Text style={styles.note}>
            Password changes and two-factor authentication are managed through your MatchMyUni
            account portal. Contact your account manager if you need to update your login email.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  scroll: {paddingHorizontal: H_PAD, paddingTop: 16, gap: 12},
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  infoRow: {gap: 4},
  infoLabel: agentType.bodyMuted,
  infoValue: {fontSize: 15, fontWeight: '700', color: colors.navy},
  note: {fontSize: 13, fontWeight: '500', color: colors.textSecondary, lineHeight: 20},
});
