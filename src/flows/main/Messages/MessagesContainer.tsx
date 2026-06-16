import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MessageCircle} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {font, hPad} from '../../../utils/sizes';

export function MessagesContainer() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.flex, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.empty}>
        <View style={styles.iconWrap}>
          <MessageCircle size={36} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySub}>Your conversations with universities will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: hPad(5),
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {fontSize: font.title, fontWeight: '800', color: colors.navy},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.navy},
  emptySub: {fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18},
});
