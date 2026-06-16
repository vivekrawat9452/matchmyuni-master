import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import {colors} from '../utils/colors';
import {FontSizes, Weights} from '../utils';
import {font, touch} from '../utils/sizes';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'muted' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  style,
}: Props) {
  const isMuted = variant === 'muted';
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.base,
        isOutline && styles.outline,
        isMuted && styles.muted,
        !isMuted && !isOutline && styles.solid,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text
          style={[
            styles.label,
            isOutline && {color: colors.textPrimary},
            isMuted && styles.labelMuted,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /**
   * Figma: Instance "Primary Button"  358×54  r=1000  bg=#E8613A
   * paddingH=16 (handled by parent container width = 358)
   */
  base: {
    height: 54,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  solid: {backgroundColor: colors.primary},       // #E8613A
  muted: {backgroundColor: colors.primaryMuted},   // #F49F79
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {opacity: 0.7},
  pressed: {opacity: 0.92},
  /**
   * Figma: TEXT "Continue "  16px/600  lh=22  ls=-0.16  color=#FFFFFF
   */
  label: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: Weights.semibold,
    lineHeight: 22,
    letterSpacing: -0.16,
  },
  labelMuted: {color: colors.white},
});
