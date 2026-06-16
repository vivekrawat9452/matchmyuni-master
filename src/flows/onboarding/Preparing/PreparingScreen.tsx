import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {Styles} from '../../../utils';
import {text} from '../../../utils/theme';
import {wp} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {message?: string};

/**
 * Post-registration loading screen — pixel-perfect Figma match.
 *
 * Figma node 383:9470 — "Frame 121075803" 326×163:
 *   TEXT "Findng your maches."  32px/800  lh=36  ls=-0.64  color=#1A1C29
 *   Frame 121075798 326×16 gap=-1   (animated progress bar)
 *     ELLIPSE 16×16 bg=#E8613A    (leading orange circle)
 *     RECT 293×3 bg=#E8613A       (animated orange line)
 *     POLYGON 28×20 bg=#E8613A    (arrowhead at end)
 *   TEXT "Comparing 247..."  12px/500  lh=15  color=#677899
 *   Chips: r=62 stroke=#E7E1D9 sw=1.5 pad T9R12B9L12 text 12px/600 lh=18 ls=-0.44
 */
export function PreparingScreen({message}: Props) {
  const insets = useSafeAreaInsets();

  // Progress bar: 0 → 1 over 3 s, loops
  const progress = useRef(new Animated.Value(0)).current;
  // Pulse scale for dot
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {toValue: 0, duration: 0, useNativeDriver: false}),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.5, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1,   duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();

    return () => {
      progress.stopAnimation();
      pulse.stopAnimation();
    };
  }, [progress, pulse]);

  // Figma: line is 293px at full progress
  const BAR_LINE_MAX = 293;
  const lineWidth = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, BAR_LINE_MAX],
  });
  const arrowLeft = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, BAR_LINE_MAX],
  });

  return (
    <View style={[Styles.screen, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
      <View style={styles.content}>
        {/* Headline — Figma: 32px/800 lh=36 ls=-0.64 color=#1A1C29 */}
        <Text style={text.heroLight}>{message ?? en.preparing.headline}</Text>

        {/* Animated progress bar — Figma: Frame 121075798 326×16 */}
        <View style={styles.barRow}>
          {/* Leading circle — Figma: Ellipse 101 16×16 bg=#E8613A */}
          <View style={styles.barCircle} />
          {/* Growing orange line — Figma: Rectangle 2800 293×3 */}
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, {width: lineWidth}]} />
          </View>
          {/* Arrowhead polygon — Figma: Polygon 1 28×20 bg=#E8613A */}
          <Animated.View style={[styles.arrowFrame, {left: arrowLeft}]}>
            <View style={styles.arrowHead} />
          </Animated.View>
        </View>

        {/* Sub-text — Figma: 12px/500 lh=15 color=#677899 */}
        <Text style={styles.sub}>{en.preparing.sub}</Text>

        {/* Filter chips — Figma: r=62 stroke=#E7E1D9 sw=1.5 pad T9R12B9L12 gap=5 */}
        <View style={styles.chips}>
          <Chip label="🇩🇪  Germany" />
          <Chip label="🎓  Engineering" />
          <Chip label="$6–12k/yr" />
        </View>

        {/* Pulsing loader dot */}
        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulseOuter, {transform: [{scale: pulse}]}]} />
          <View style={styles.pulseInner} />
        </View>
      </View>

      {/* Decorative teal quarter-circle (bottom-left) */}
      <View style={styles.tealDeco} pointerEvents="none" />
    </View>
  );
}

function Chip({label}: {label: string}) {
  return (
    <View style={styles.chip}>
      <Text style={text.captionMd}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 18,
  },
  /* ── Progress bar ── */
  /** Figma: Frame 121075798 326×16 gap=-1 */
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    position: 'relative',
  },
  /** Figma: Ellipse 101 16×16 bg=#E8613A */
  barCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  /** Track area (fills rest of row) */
  barTrack: {
    flex: 1,
    height: 3,
    position: 'relative',
    marginLeft: -1,  // gap=-1 in Figma
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  /** Arrowhead frame — absolute, moves with progress */
  arrowFrame: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,  // offset for leading circle width
  },
  /** Triangle pointing right — Figma: Polygon 1 28×20 bg=#E8613A */
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderLeftWidth: 14,
    borderLeftColor: colors.primary,
  },

  /** Figma: 12px/500 lh=15 color=#677899 */
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 15,
  },

  /* ── Chips ── */
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  /** Figma: r=61.7 stroke=#E7E1D9 sw=1.5 pad T9R12B9L12 */
  chip: {
    backgroundColor: colors.white,
    borderRadius: 62,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingTop: 9,
    paddingBottom: 9,
    paddingHorizontal: 12,
  },
  /* ── Pulse dot ── */
  pulseWrapper: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}30`,
  },
  pulseInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },

  /** Teal decorative quarter-circle (bottom-left corner) */
  tealDeco: {
    position: 'absolute',
    bottom: -wp(15),
    left: -wp(15),
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: colors.accentTeal,
    opacity: 0.7,
  },
});
