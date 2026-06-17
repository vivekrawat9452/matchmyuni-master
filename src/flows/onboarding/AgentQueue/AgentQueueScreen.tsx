import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {Zap} from 'lucide-react-native';
import {agentFlowAssets} from '../../agent/agentAssets';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  onContactSupport: () => void;
};

export function AgentQueueScreen({onContactSupport}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        Styles.screen,
        styles.root,
        {paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24},
      ]}>
      <View style={styles.iconWrap}>
        <View style={styles.iconHalo} />
        <View style={styles.iconCircle}>
          <Image source={agentFlowAssets.checkDone} style={styles.checkIcon} resizeMode="contain" />
        </View>
      </View>

      <Text style={styles.headline}>{en.agentQueue.headline}</Text>
      <Text style={styles.body}>{en.agentQueue.body}</Text>

      <View style={styles.badge}>
        <Zap size={14} color={colors.yellowBadge} fill={colors.yellowBadge} />
        <Text style={styles.badgeText}>{en.agentQueue.badge}</Text>
      </View>

      <View style={styles.spacer} />

      <Pressable
        onPress={onContactSupport}
        style={({pressed}) => [styles.cta, pressed && styles.ctaPressed]}
        accessibilityRole="button">
        <Text style={styles.ctaLabel}>{en.agentQueue.contactSupport}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.tagGreenBg,
    opacity: 0.55,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 36,
    height: 36,
  },
  headline: {
    fontSize: FontSizes.hero,
    fontWeight: Weights.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  body: {
    fontSize: FontSizes.body,
    fontWeight: Weights.medium,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
  },
  spacer: {flex: 1},
  cta: {
    width: '100%',
    height: 54,
    borderRadius: 1000,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  ctaPressed: {opacity: 0.92},
  ctaLabel: {
    fontSize: FontSizes.body,
    fontWeight: Weights.semibold,
    color: colors.primary,
    lineHeight: 22,
  },
});
