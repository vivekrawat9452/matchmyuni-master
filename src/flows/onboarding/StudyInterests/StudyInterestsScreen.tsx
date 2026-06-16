import React from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {Check} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles, IconSizes} from '../../../utils';
import {wp} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type StudyItem = {id: string; label: string; emoji: string};

type Props = {
  items: StudyItem[];
  selected: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
  canSubmit: boolean;
};

/** Column gap + 2 side paddings → 3 equal columns
 * Figma: H_PAD=16, GAP=8, TILE_W=114, TILE_H=96 (for 390pt screen)
 */
const H_PAD = 16;
const GAP = 8;
const TILE_W = (wp(100) - H_PAD * 2 - GAP * 2) / 3;
const TILE_H = TILE_W * (96 / 114); // maintain Figma 114:96 aspect ratio

export function StudyInterestsScreen({
  items,
  selected,
  onToggle,
  onBack,
  onSkip,
  onContinue,
  canSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={Styles.screen}>
      <ScrollView
        contentContainerStyle={{paddingBottom: insets.bottom + 88, flexGrow: 1}}
        style={styles.scroll}>
        <WaveHeader
          title={en.study.title}
          subtitle={en.study.subtitle}
          onBack={onBack}
          rightLabel="Skip"
          onRight={onSkip}
        />
        <StepIndicator currentStep={2} />

        <View style={styles.grid}>
          {items.map(item => {
            const on = selected.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => onToggle(item.id)}
                style={[styles.tile, on && styles.tileOn]}>
                {/* ─ Top-right checkmark badge when selected ─ */}
                {on && (
                  <View style={Styles.checkBadge}>
                    <Check color={colors.white} size={IconSizes.badge} strokeWidth={3.5} />
                  </View>
                )}
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={[styles.lbl, on && styles.lblOn]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[Styles.footBar, {paddingBottom: insets.bottom + 8}]}>
        <PrimaryButton
          label={en.continue}
          onPress={onContinue}
          disabled={!canSubmit}
          variant={!canSubmit ? 'muted' : 'solid'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {backgroundColor: colors.background},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    gap: GAP,
  },
  /**
   * Figma: Frame 121075495 114×96  r=18  bg=#FFFFFF  stroke=#E7E1D9  sw=1
   * pad: T16R12B16L12  gap=8
   */
  tile: {
    width: TILE_W,
    height: TILE_H,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,      // #E7E1D9
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 16,
    position: 'relative',
    // No overflow:hidden — prevents emoji clipping and renders crisply
  },
  tileOn: {
    borderColor: colors.primary,     // #E8613A
    backgroundColor: '#FFF4EE',
  },
  /** Figma: emoji at 32px centered, margin-bottom 8 before label */
  emoji: {
    fontSize: IconSizes.xl,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 2,
  },
  lbl: {
    fontSize: FontSizes.caption,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.navy,
    fontWeight: Weights.bold,
  },
  lblOn: {color: colors.primary},
});
