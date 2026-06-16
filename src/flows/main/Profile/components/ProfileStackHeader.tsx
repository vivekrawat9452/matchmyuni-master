import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../../utils/colors';
import {SCREEN_H_PADDING} from '../../../../utils/theme';

type Props = {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
};

/** Figma sub-screen header — 18px/700 title, back chevron */
export function ProfileStackHeader({title, onBack, right}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, {paddingTop: insets.top + 8}]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <ChevronLeft size={24} color={colors.navy} strokeWidth={2} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_H_PADDING,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backBtn: {width: 32, alignItems: 'flex-start'},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.18,
    lineHeight: 24,
  },
  right: {width: 32, alignItems: 'flex-end'},
  spacer: {width: 24},
});
