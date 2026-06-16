import React from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {GraduationCap, Briefcase} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights} from '../../../utils';
import {hPad, space, font, rad, touch} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Role = 'student' | 'agent';

type Props = {
  onSelect: (r: Role) => void;
  onBack: () => void;
  onFooterLink: () => void;
};

export function RoleSelectScreen({onSelect, onBack, onFooterLink}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={[styles.grow, {paddingBottom: insets.bottom + 24}]}>
      <WaveHeader
        title={en.whoAreYou.title}
        subtitle={en.whoAreYou.subtitle}
        onBack={onBack}
      />
      <StepIndicator currentStep={1} total={ONBOARDING_TOTAL_STEPS} />
      <View style={styles.body}>
        <Pressable
          style={({pressed}) => [styles.card, pressed && {opacity: 0.92}]}
          onPress={() => onSelect('student')}>
          <View style={styles.iconStudent}>
            <GraduationCap color={colors.white} size={24} />
          </View>
          <View style={styles.txt}>
            <Text style={styles.title}>{en.student.title}</Text>
            <Text style={styles.sub}>{en.student.sub}</Text>
          </View>
        </Pressable>
        <Pressable
          style={({pressed}) => [styles.card, pressed && {opacity: 0.92}, {marginTop: 14}]}
          onPress={() => onSelect('agent')}>
          <View style={styles.iconAgent}>
            <Briefcase color={colors.white} size={24} />
          </View>
          <View style={styles.txt}>
            <Text style={styles.title}>{en.agent.title}</Text>
            <Text style={styles.sub}>{en.agent.sub}</Text>
          </View>
        </Pressable>
        <Text style={styles.footer} onPress={onFooterLink}>
          {en.partner}
          <Text style={styles.footerBold}>{en.signInHere}</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grow: {flexGrow: 1, backgroundColor: colors.background},
  body: {padding: hPad(5), paddingTop: 8, flex: 1},
  /**
   * Figma: Frame 121075498/504  358×92/95  r=18  bg=#FFFFFF  stroke=#E7E1D9  sw=1
   * pad: T16R16B16L16  gap=16
   */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(26,43,72,0.08)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconStudent: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAgent: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.agentMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {marginLeft: 14, flex: 1},
  title: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.navy},
  sub: {fontSize: FontSizes.chip, color: colors.textSecondary, marginTop: 3, lineHeight: 18},
  footer: {
    textAlign: 'center',
    marginTop: space.xl,
    color: colors.textSecondary,
    fontSize: FontSizes.small,
  },
  footerBold: {fontWeight: Weights.bold, color: colors.navy},
});
