/**
 * Agent Notifications — screen 2.1
 * API: GET /notifications
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
import {ChevronLeft, FileText} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NotificationDto} from '../../../../api/notificationsApi';
import {colors} from '../../../../utils/colors';
import {agentLayout, agentType} from '../../agentStyles';
import {hPad} from '../../../../utils/sizes';

const H_PAD = hPad(4.1);

type Props = {
  notifications: NotificationDto[] | undefined;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onNotificationPress: (notification: NotificationDto) => void;
};

export const AgentNotificationsScreen = memo(function AgentNotificationsScreen({
  notifications,
  loading,
  refreshing,
  onRefresh,
  onBack,
  onNotificationPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const items = notifications ?? [];

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.navy} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={agentType.screenTitle}>Notification</Text>
      </View>

      {loading && !notifications ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: insets.bottom + 24},
            items.length === 0 && styles.emptyList,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>You're all caught up — no new notifications.</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({item}) => (
            <Pressable style={styles.row} onPress={() => onNotificationPress(item)}>
              <View style={styles.iconWrap}>
                <FileText size={20} color={colors.primary} />
              </View>
              <View style={styles.rowBody}>
                <Text style={agentType.notificationTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={agentType.notificationBody} numberOfLines={2}>
                  {item.body}
                </Text>
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
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: H_PAD,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  backLabel: {fontSize: 16, color: colors.navy, fontWeight: '500'},
  spinner: {marginTop: 40},
  list: {paddingHorizontal: H_PAD, paddingTop: 12},
  emptyList: {flexGrow: 1, justifyContent: 'center'},
  empty: {textAlign: 'center', color: colors.textSecondary, fontSize: 14},
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.matchBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {flex: 1},
  separator: {height: 1, backgroundColor: colors.border},
});
