import React from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {Eye, EyeOff, Check} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, space, touch} from '../../../utils/sizes';
import {inputStyles} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  value: string;
  onChange: (t: string) => void;
  onContinue: () => void;
  onBack: () => void;
  showPw: boolean;
  onTogglePw: () => void;
  checks: {len: boolean; upper: boolean; num: boolean; spec: boolean};
  canSubmit: boolean;
  stepTotal?: number;
};

export function PasswordCreateScreen({
  value,
  onChange,
  onContinue,
  onBack,
  showPw,
  onTogglePw,
  checks,
  canSubmit,
  stepTotal,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={Styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom + 16, flexGrow: 1}}>
        <WaveHeader title={en.password.title} subtitle={en.password.subtitle} onBack={onBack} />
        {/* Password is still step 1 — same as Email entry */}
        <StepIndicator currentStep={1} total={stepTotal} />
        <View style={styles.body}>
          <View style={styles.inputWrap}>
            <TextInput
              value={value}
              onChangeText={onChange}
              style={[inputStyles.field, styles.input]}
              secureTextEntry={!showPw}
              placeholder={en.password.placeholder}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={onTogglePw} style={styles.eye} hitSlop={10}>
              {showPw ? (
                <EyeOff color={colors.primary} size={20} />
              ) : (
                <Eye color={colors.primary} size={20} />
              )}
            </Pressable>
          </View>

          {/* Requirement checklist — matches Figma: orange filled circle + white checkmark when met */}
          <View style={styles.reqs}>
            <Req done={checks.len}   text={en.password.requirements.len} />
            <Req done={checks.upper} text={en.password.requirements.upper} />
            <Req done={checks.num}   text={en.password.requirements.number} />
            <Req done={checks.spec}  text={en.password.requirements.special} />
          </View>
        </View>

        <View style={[styles.footer, {paddingBottom: insets.bottom + 6}]}>
          <PrimaryButton
            label={en.continue}
            onPress={onContinue}
            disabled={!canSubmit}
            variant={!canSubmit ? 'muted' : 'solid'}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Single requirement row
 * Figma: Frame 121075603/608/609/610 (358×15, gap=9)
 *   Dot:  Ellipse 100  13×13  bg=#EFEAE2  (unchecked) / #E8613A (checked)
 *   Text: 12px/500 lh=15 color=#1B2A4A
 */
function Req({done, text}: {done: boolean; text: string}) {
  return (
    <View style={styles.reqRow}>
      <View style={[styles.bullet, done && styles.bulletDone]}>
        {done && <Check color={colors.white} size={8} strokeWidth={2.5} />}
      </View>
      <Text style={[styles.reqText, done && styles.reqTextDone]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {padding: hPad(5), paddingTop: 8, flex: 1},
  inputWrap: {position: 'relative'},
  input: {paddingRight: 50},
  eye: {position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center'},
  reqs: {marginTop: 16, gap: 12},
  reqRow: {flexDirection: 'row', alignItems: 'center', gap: 9},
  /**
   * Figma: Frame 121075797 13×13, Ellipse 100 13×13 bg=#EFEAE2
   * Unchecked → #EFEAE2 gray circle (no border)
   */
  bullet: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletDone: {backgroundColor: colors.primary},
  /** Figma: 12px/500 lh=15 color=#1B2A4A */
  reqText: {
    fontSize: FontSizes.caption,
    lineHeight: 15,
    fontWeight: Weights.medium,
    color: colors.navy,
  },
  reqTextDone: {color: colors.navy},
  footer: {paddingHorizontal: hPad(5), marginTop: space.lg},
  btn: {minHeight: touch.minHButton},
});
