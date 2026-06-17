/**
 * All applications list — Figma nodes 834:4587
 * API: GET /partner/applications
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerApplicationListItemDto} from '../../../../api/partnerTypes';
import {AgentStackHeader} from '../../components/AgentStackHeader';
import {formatAgentMoney} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  filter: 'all' | 'needs_action';
  items: PartnerApplicationListItemDto[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onApplicationPress: (applicationId: string) => void;
};

export const AgentApplicationsListScreen = memo(function AgentApplicationsListScreen({
  filter,
  items,
  loading,
  refreshing,
  onRefresh,
  onBack,
  onApplicationPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const title = filter === 'needs_action' ? 'Needs action' : 'All applications';

  return (
    <View style={styles.fill}>
      <AgentStackHeader title={title} onBack={onBack} />

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: insets.bottom + 24},
            items.length === 0 && styles.emptyList,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {filter === 'needs_action'
                ? 'No applications need action right now.'
                : 'No applications yet.'}
            </Text>
          }
          renderItem={({item}) => (
            <Pressable style={styles.row} onPress={() => onApplicationPress(item.id)}>
              <View style={styles.rowBody}>
                <Text style={agentType.cardTitle}>{item.studentName}</Text>
                <Text style={agentType.bodyMuted} numberOfLines={1}>
                  {item.courseName} · {item.universityName}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.status}>{item.statusLabel}</Text>
                  {item.urgencyLabel ? (
                    <Text style={styles.urgency}>{item.urgencyLabel}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.commission}>
                  {formatAgentMoney(item.estimatedCommission, item.commissionCurrency)}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  spinner: {marginTop: 48},
  list: {paddingHorizontal: H_PAD, paddingTop: 8},
  emptyList: {flexGrow: 1, justifyContent: 'center'},
  empty: {textAlign: 'center', color: colors.textSecondary, fontSize: 14},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 8,
  },
  rowBody: {flex: 1, gap: 4},
  metaRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  status: {fontSize: 11, fontWeight: '700', color: colors.agentMint},
  urgency: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  right: {alignItems: 'flex-end', gap: 4},
  commission: {fontSize: 12, fontWeight: '700', color: colors.navy},
});
