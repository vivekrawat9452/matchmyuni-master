import React from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, font, rad} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type BudgetOpt = {id: string; title: string; sub: string; tag?: string};

type Props = {
  options: BudgetOpt[];
  selected: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
};

export function BudgetSelectScreen({options, selected, onSelect, onBack, onSubmit, loading}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={Styles.screen}>
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom + 100, flexGrow: 1}}>
        <WaveHeader title={en.budget.title} subtitle={en.budget.subtitle} onBack={onBack} />
        <StepIndicator currentStep={5} />
        <Text style={styles.hint}>{en.budget.hint}</Text>
        <View style={styles.list}>
          {options.map(o => {
            const on = selected === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => onSelect(o.id)}
                style={[styles.card, on && styles.cardOn]}>
                <View style={styles.rowTop}>
                  <View style={{flex: 1}}>
                    <Text style={styles.t}>{o.title}</Text>
                    {o.sub ? <Text style={styles.s}>{o.sub}</Text> : null}
                  </View>
                  {o.tag ? (
                    <View style={[Styles.scholarshipBadge, {marginLeft: 8}]}>
                      <Text style={styles.badgeT}>{o.tag}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.status}>{en.budget.nearDone}</Text>
      </ScrollView>
      <View style={[Styles.footBar, {paddingBottom: insets.bottom + 8}]}>
        <PrimaryButton
          label={en.findMatches}
          onPress={onSubmit}
          disabled={!selected}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {paddingHorizontal: hPad(5), color: colors.textSecondary, fontSize: font.caption, marginTop: 4, marginBottom: 8},
  list: {padding: hPad(5), gap: 8},
  card: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardOn: {borderColor: colors.primary},
  rowTop: {flexDirection: 'row', alignItems: 'flex-start'},
  t: {fontSize: font.subtitle, fontWeight: Weights.bold, color: colors.navy},
  s: {fontSize: font.caption, color: colors.textSecondary, marginTop: 2},
  /** Figma node 334-7952 — bg:#FEF3D6  stroke:#F5A625 sw=0.5  r=6  pad T/B=5 L/R=7 */
  badgeT: {fontSize: FontSizes.micro, fontWeight: Weights.bold, color: '#F5A625'},
  status: {textAlign: 'center', color: colors.accentTeal, fontSize: font.caption, marginTop: 8, paddingHorizontal: hPad(5)},
});
