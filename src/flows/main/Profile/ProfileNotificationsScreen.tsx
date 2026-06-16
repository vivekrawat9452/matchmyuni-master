import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ProfileStackHeader} from './components/ProfileStackHeader';
import {ProfileToggle} from './components/ProfileToggle';
import {colors} from '../../../utils/colors';
import {profileStyles as ps} from './profileStyles';
import {SCREEN_H_PADDING} from '../../../utils/theme';

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
};

export type NotificationSection = {
  id: string;
  title: string;
  items: NotificationItem[];
};

export type ProfileNotificationsScreenProps = {
  sections: NotificationSection[];
  toggles: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
  onBack: () => void;
};

function ToggleRow({
  item,
  value,
  onValueChange,
}: {
  item: NotificationItem;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSub}>{item.subtitle}</Text>
      </View>
      <ProfileToggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

export function ProfileNotificationsScreen({
  sections,
  toggles,
  onToggle,
  onBack,
}: ProfileNotificationsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={ps.screen}>
      <ProfileStackHeader title="Notification" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <View key={section.id} style={ps.section}>
            <Text style={ps.sectionTitle}>{section.title}</Text>
            {section.items.map(item => (
              <ToggleRow
                key={item.id}
                item={item}
                value={!!toggles[item.id]}
                onValueChange={v => onToggle(item.id, v)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {paddingHorizontal: SCREEN_H_PADDING},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  rowText: {flex: 1},
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 18,
  },
  rowSub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
