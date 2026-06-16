import React from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {Weights, Styles} from '../../../utils';
import {hPad, font, rad, touch} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {studyIconSvgs} from '../../../assets/studyIcons';

export type TlOption = {id: string; title: string; sub: string; svgKey: string};

type Props = {
  options: TlOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
  canSubmit: boolean;
};

export function StartTimelineScreen({
  options,
  selected,
  onSelect,
  onBack,
  onSkip,
  onContinue,
  canSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={Styles.screen}>
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom + 90, flexGrow: 1}}>
        <WaveHeader
          title={en.timeline.title}
          subtitle={en.timeline.subtitle}
          onBack={onBack}
          rightLabel="Skip"
          onRight={onSkip}
        />
        <StepIndicator currentStep={4} />
        <View style={styles.list}>
          {options.map(o => {
            const on = selected === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => onSelect(o.id)}
                style={[styles.card, on && styles.cardOn]}>
                <SvgXml
                  xml={studyIconSvgs[o.svgKey] ?? ''}
                  width={32}
                  height={32}
                />
                <View style={{flex: 1, marginLeft: 12}}>
                  <Text style={styles.t}>{o.title}</Text>
                  <Text style={styles.s}>{o.sub}</Text>
                </View>
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
          style={{minHeight: touch.minHButton}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {padding: hPad(5), paddingTop: 8, gap: 10},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardOn: {borderColor: colors.primary, backgroundColor: '#FFFBF9'},
  t: {fontSize: font.subtitle, fontWeight: Weights.bold, color: colors.navy},
  s: {fontSize: font.caption, color: colors.textSecondary, marginTop: 2},
});
