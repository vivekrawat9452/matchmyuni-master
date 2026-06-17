/**
 * Shared header for agent stack screens with back button.
 */
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {agentColors, agentType} from '../agentStyles';
import {hPad, rad} from '../../../utils/sizes';

const H_PAD = hPad(4.1);

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  variant?: 'cream' | 'orange' | 'teal';
};

export function AgentStackHeader({title, subtitle, onBack, variant = 'cream'}: Props) {
  const insets = useSafeAreaInsets();
  const isOrange = variant === 'orange' || variant === 'teal';
  const light = isOrange;

  return (
    <View
      style={[
        styles.wrap,
        isOrange && styles.orange,
        {paddingTop: insets.top + 8},
      ]}>
      <Pressable style={styles.back} onPress={onBack} hitSlop={12}>
        <ChevronLeft size={22} color={light ? colors.white : colors.navy} />
        <Text style={[styles.backLabel, light && styles.backLabelLight]}>Back</Text>
      </Pressable>
      <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sub, light && styles.subLight]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
  },
  orange: {
    backgroundColor: agentColors.header,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  back: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  backLabel: {fontSize: 16, color: colors.navy, fontWeight: '500'},
  backLabelLight: {color: colors.white},
  title: agentType.screenTitle,
  titleLight: {color: colors.white, fontSize: 22, fontWeight: '800'},
  sub: agentType.bodyMuted,
  subLight: {color: 'rgba(255,255,255,0.9)'},
});
