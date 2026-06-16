/**
 * Post-signup tutorial — Figma nodes 645:3705, 645:4064.
 * Swipe tutorial slides; Skip / final Next opens recommended courses.
 */
import React from 'react';
import {
  View,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../utils/colors';
import {FontSizes, Weights} from '../../utils';
import {en} from '../../utils/strings/en';
import type {TutorialStep} from './tutorialConstants';

type Props = {
  step: TutorialStep;
  exiting?: boolean;
  onNext: () => void;
  onSkip: () => void;
};

/** Figma frame 390×844 — inline Next on swipe slides (645:3705, 645:4064). */
const FIGMA_W = 390;
const FIGMA_H = 844;
const INLINE_NEXT = {left: 95, top: 610, width: 200, height: 48};

export function SignupTutorialScreen({
  step,
  exiting = false,
  onNext,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();
  const {width: winW, height: winH} = useWindowDimensions();
  const footPad = Math.max(insets.bottom, 16);

  const frameH = winW * (FIGMA_H / FIGMA_W);
  const frameTop = Math.max(0, (winH - frameH) / 2);
  const scale = winW / FIGMA_W;
  const inlineNextStyle = {
    left: INLINE_NEXT.left * scale,
    top: INLINE_NEXT.top * scale,
    width: INLINE_NEXT.width * scale,
    height: INLINE_NEXT.height * scale,
  };

  if (exiting) {
    return (
      <View style={[styles.root, styles.exiting]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[styles.frame, {width: winW, height: frameH, top: frameTop}]}
        pointerEvents="box-none">
        <ImageBackground
          source={step.image}
          style={StyleSheet.absoluteFill}
          resizeMode="stretch"
          accessibilityLabel={`Tutorial step ${step.id + 1}`}
        />

        <Pressable
          style={[styles.inlineNextHit, inlineNextStyle]}
          onPress={onNext}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={en.signupTutorial.next}
        />
      </View>

      <View
        style={[styles.footer, {paddingBottom: footPad}]}
        pointerEvents="box-none">
        <Pressable
          onPress={onSkip}
          style={styles.skipBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={en.signupTutorial.skip}>
          <Text style={styles.skipLabel}>{en.signupTutorial.skip}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  exiting: {alignItems: 'center', justifyContent: 'center'},
  frame: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
  },
  inlineNextHit: {
    position: 'absolute',
    zIndex: 15,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 20,
  },
  skipBtn: {alignItems: 'center', paddingVertical: 4},
  skipLabel: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.medium,
    color: colors.white,
    opacity: 0.85,
  },
});
