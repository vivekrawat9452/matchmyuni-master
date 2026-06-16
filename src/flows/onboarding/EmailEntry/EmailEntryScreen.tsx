import React from 'react';
import {View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {inputStyles} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  value: string;
  onChange: (t: string) => void;
  onContinue: () => void;
  onBack: () => void;
  disabled: boolean;
  stepTotal?: number;
};

export function EmailEntryScreen({value, onChange, onContinue, onBack, disabled, stepTotal}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={Styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: insets.bottom + 12}}>
        <WaveHeader title={en.emailScreen.title} subtitle={en.emailScreen.subtitle} onBack={onBack} />
        <StepIndicator currentStep={1} total={stepTotal} />
        <View style={styles.body}>
          <Text style={styles.label}>{en.emailLabel}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@university.edu"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
          <PrimaryButton
            label={en.continue}
            onPress={onContinue}
            disabled={disabled}
            variant={disabled ? 'muted' : 'solid'}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {paddingHorizontal: 16, paddingTop: 24, flex: 1},
  /**
   * Figma: TEXT "Email address" 12px/700 lh=15 color=#7B705F (used as label)
   */
  label: {fontSize: FontSizes.caption, fontWeight: Weights.bold, color: colors.textMuted, marginBottom: 8, lineHeight: 15},
  /**
   * Figma: Frame 121075495  358×54  r=14  bg=#EFEAE2  stroke=#E7E1D9
   * Uses global inputStyles.field from theme.ts
   */
  input: inputStyles.field,
  footer: {paddingHorizontal: 16, marginTop: 'auto'},
});
