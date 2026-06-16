/**
 * WaveHeader — pixel-perfect match to Figma header component.
 *
 * Figma structure (file pHnQspQkvUJvE9TyiQN5Zv):
 *   Frame 121075767  390 × 256  (full header)
 *     Frame 121075752  390 × 103  bg=#E8613A  (status + nav row)
 *     Frame 121075761  390 × 153  (wave + title/subtitle)
 *       Frame 121075764  395 × 174 (wave vector frame, bottom 21px clipped)
 *         Vector  395 × 83  fill=#E8613A  (wave S-curve, exact SVG below)
 *         Vector  390 × 190 fill=#E8613A  (solid orange bg fill)
 *       Frame 121075551  355 × 66  gap=8  (title + subtitle text)
 *
 * Wave SVG path — downloaded directly from Figma API node 297:17811
 * viewBox = "0 0 395 174"
 * Main path: M1 127L23 133C44 139 88 151 131 149C174 147 218 131 261 131
 *            C304 131 348 147 369 154L391 162V-28H369...H1L1 127Z
 */

import React from 'react';
import {Pressable, StyleSheet, Text, View, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChevronLeft} from 'lucide-react-native';
import Svg, {Path} from 'react-native-svg';
import {colors} from '../utils/colors';
import {text as T} from '../utils/theme';

const {width: SCREEN_W} = Dimensions.get('window');

/**
 * Wave section total height = 153px (Figma: Frame 121075761)
 * SVG viewBox = "0 0 395 174", we clip at y=153 to match Figma.
 */
const WAVE_SECTION_H = 153;
const SVG_VB_W = 395;
const SVG_VB_H = 174;

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightLabel?: string;
  onRight?: () => void;
};

export function WaveHeader({title, subtitle, onBack, rightLabel, onRight}: Props) {
  const insets = useSafeAreaInsets();
  const statusBarH = insets.top + 8;

  return (
    <View style={styles.wrap}>
      {/* ── 1. Orange nav block (Frame 121075752: 390×103) ─────────────── */}
      <View style={[styles.navBlock, {paddingTop: statusBarH}]}>
        <View style={styles.navRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={styles.backRow}
              accessibilityRole="button"
              accessibilityLabel="Back">
              <ChevronLeft color={colors.white} size={22} strokeWidth={2} />
              <Text style={T.backLabel}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navPlaceholder} />
          )}

          {rightLabel && onRight ? (
            <Pressable onPress={onRight} hitSlop={12}>
              <Text style={T.navSkip}>{rightLabel}</Text>
            </Pressable>
          ) : (
            <View style={styles.navPlaceholder} />
          )}
        </View>
      </View>

      {/* ── 2. Wave section (Frame 121075761: 390×153) ──────────────────── */}
      <View style={styles.waveSection}>
        {/* Exact Figma SVG — viewBox 0 0 395 174, clipped at 153px */}
        <Svg
          width={SCREEN_W}
          height={WAVE_SECTION_H}
          viewBox={`0 0 ${SVG_VB_W} ${SVG_VB_H}`}
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}>
          {/* Solid orange bg — Vector 390×190 (fills above wave curve) */}
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d={`M1 127L23 133C44 139 88 151 131 149C174 147 218 131 261 131C304 131 348 147 369 154L391 162V-28H369C348 -28 304 -28 261 -28C218 -28 174 -28 131 -28C88 -28 44 -28 23 -28H1L1 127Z`}
            fill={colors.primary}
          />
          {/* Subtle wave detail overlay — Vector 395×83 (opacity=0.1) */}
          <Path
            opacity={0.1}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.11204 124.98L23.0627 131.727C44.0065 138.441 87.9079 151.936 131.277 151.405C174.645 150.874 219.495 136.385 262.796 137.853C306.097 139.321 349.863 156.814 370.773 164.527L392.656 173.273L395.028 103.313L372.874 102.562C351.727 101.846 307.419 100.344 264.118 98.8756C220.817 97.4077 176.509 95.9057 133.208 94.4378C89.9068 92.9699 45.5988 91.4679 24.4518 90.751L2.29785 90L1.11204 124.98Z"
            fill={colors.primary}
          />
        </Svg>

        {/* Title and subtitle (Frame 121075551: 355×66, gap=8) */}
        <View style={styles.textBlock}>
          <Text style={T.waveTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? (
            <Text style={T.waveSubtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,  // cream, visible through wave curve
  },

  /** Orange status + nav area — Figma: Frame 121075752 390×103 bg=#E8613A */
  navBlock: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 10,
    minHeight: 56,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navPlaceholder: {width: 64},

  /** Wave + text area — Figma: Frame 121075761 390×153 */
  waveSection: {
    height: WAVE_SECTION_H,
    overflow: 'hidden',
  },

  /** Title + subtitle overlay (Figma: Frame 121075551 positioned within wave area) */
  textBlock: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    gap: 8,
  },
});
