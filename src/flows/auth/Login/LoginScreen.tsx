import React from 'react';
import {View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {font, hPad, space, rad, touch} from '../../../utils/sizes';

type Props = {
  email: string;
  password: string;
  onChangeEmail: (t: string) => void;
  onChangePassword: (t: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  error?: string | null;
};

export function LoginScreen({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onBack,
  onForgotPassword,
  loading,
  error,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={Styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <WaveHeader title={en.login.title} subtitle={en.login.subtitle} onBack={onBack} />
      <View style={styles.body}>
        <Text style={Styles.inputLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="you@example.com"
        />
        <View style={styles.passwordRow}>
          <Text style={Styles.inputLabel}>Password</Text>
          <Text style={styles.forgotLink} onPress={onForgotPassword}>
            Forgot password?
          </Text>
        </View>
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
        />
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <PrimaryButton
          label="Sign in"
          onPress={onSubmit}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {padding: hPad(5), paddingTop: space.lg, flex: 1},
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    fontSize: font.body,
    color: colors.textPrimary,
    marginBottom: space.md,
    minHeight: 48,
  },
  err: {color: colors.primary, marginBottom: 8, fontSize: FontSizes.caption},
  btn: {marginTop: space.lg, minHeight: touch.minHButton},
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forgotLink: {
    fontSize: FontSizes.caption,
    color: colors.primary,
    fontWeight: Weights.semibold,
  },
});
