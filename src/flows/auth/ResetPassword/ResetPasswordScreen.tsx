import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Eye, EyeOff, Check} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, space, touch} from '../../../utils/sizes';
import {inputStyles, text as T} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type PasswordChecks = {
  len: boolean;
  upper: boolean;
  num: boolean;
  spec: boolean;
};

type Props = {
  token: string;
  onChangeToken: (t: string) => void;
  showTokenInput: boolean;
  password: string;
  onChangePassword: (t: string) => void;
  showPw: boolean;
  onTogglePw: () => void;
  confirm: string;
  onChangeConfirm: (t: string) => void;
  showConfirm: boolean;
  onToggleConfirm: () => void;
  checks: PasswordChecks;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
  canSubmit: boolean;
};

export function ResetPasswordScreen({
  token,
  onChangeToken,
  showTokenInput,
  password,
  onChangePassword,
  showPw,
  onTogglePw,
  confirm,
  onChangeConfirm,
  showConfirm,
  onToggleConfirm,
  checks,
  onSubmit,
  onBack,
  loading,
  error,
  canSubmit,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={Styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1, paddingBottom: insets.bottom + 12}}
        keyboardShouldPersistTaps="handled">
        <WaveHeader
          title={en.resetPassword.title}
          subtitle={en.resetPassword.subtitle}
          onBack={onBack}
        />

        <View style={styles.body}>
          {/* Reset token — only shown when NOT passed via deep-link */}
          {showTokenInput && (
            <View style={styles.section}>
              <TextInput
                value={token}
                onChangeText={onChangeToken}
                style={inputStyles.field}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={en.resetPassword.tokenLabel}
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.hint}>
                Open the link in your email on this device to auto-fill the token.
              </Text>
            </View>
          )}

          {/* New password — placeholder only, no label above (Figma: 2.1.3) */}
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={onChangePassword}
              style={[inputStyles.field, styles.inputPr]}
              secureTextEntry={!showPw}
              placeholder={en.resetPassword.newLabel}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={onTogglePw} style={styles.eye} hitSlop={10}>
              {showPw
                ? <EyeOff color={colors.primary} size={20} />
                : <Eye color={colors.primary} size={20} />}
            </Pressable>
          </View>

          {/* Password requirements (Figma: flat ✓ checkmarks, no circles) */}
          <View style={styles.reqs}>
            <Text style={styles.reqsTitle}>{en.resetPassword.requirementsTitle}</Text>
            <Req done={checks.len}   text={en.password.requirements.len} />
            <Req done={checks.upper} text={en.password.requirements.upper} />
            <Req done={checks.num}   text={en.password.requirements.number} />
            <Req done={checks.spec}  text={en.password.requirements.special} />
          </View>

          {/* Confirm password — placeholder only, no label above (Figma: 2.1.3) */}
          <View style={[styles.inputWrap, {marginTop: space.md}]}>
            <TextInput
              value={confirm}
              onChangeText={onChangeConfirm}
              style={[
                inputStyles.field,
                styles.inputPr,
                confirm.length > 0 && password !== confirm ? styles.inputError : null,
              ]}
              secureTextEntry={!showConfirm}
              placeholder={en.resetPassword.confirmLabel}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={onToggleConfirm} style={styles.eye} hitSlop={10}>
              {showConfirm
                ? <EyeOff color={colors.primary} size={20} />
                : <Eye color={colors.primary} size={20} />}
            </Pressable>
          </View>
          {confirm.length > 0 && password !== confirm ? (
            <Text style={styles.err}>{en.resetPassword.noMatch}</Text>
          ) : null}

          {error ? <Text style={[styles.err, {marginTop: 8}]}>{error}</Text> : null}
        </View>

        <View style={[styles.btnWrap, {paddingBottom: insets.bottom + 8}]}>
          <PrimaryButton
            label={en.resetPassword.cta}
            onPress={onSubmit}
            loading={loading}
            disabled={!canSubmit}
            variant={!canSubmit ? 'muted' : 'solid'}
            style={{minHeight: touch.minHButton}}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Requirement row — flat Check icon (Figma: 2.1.3 — no circle border, just icon + text)
 * Unchecked: Check icon in textMuted, text in textSecondary
 * Checked:   Check icon in accentTeal, text in navy bold
 */
function Req({done, text}: {done: boolean; text: string}) {
  return (
    <View style={styles.reqRow}>
      <Check
        color={done ? colors.accentTeal : colors.textMuted}
        size={14}
        strokeWidth={2.5}
      />
      <Text style={[styles.reqT, done && styles.reqTDone]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {paddingHorizontal: hPad(5), paddingTop: space.lg, flex: 1},
  section: {marginBottom: space.lg},
  hint: {...T.muted, marginTop: 4, lineHeight: 16},
  inputWrap: {position: 'relative', marginBottom: 4},
  inputPr: {paddingRight: 48},
  inputError: {borderColor: colors.primary},
  eye: {position: 'absolute', right: 14, top: 17},
  err: {color: colors.primary, fontSize: FontSizes.caption, marginTop: 4},

  /* Requirements block */
  reqs: {marginTop: space.md, marginBottom: 4},
  reqsTitle: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
    marginBottom: 10,
  },
  reqRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  reqT: {...T.captionLight, color: colors.textSecondary},
  reqTDone: {color: colors.navy, fontWeight: Weights.medium},

  btnWrap: {paddingHorizontal: hPad(5), marginTop: 'auto'},
});
