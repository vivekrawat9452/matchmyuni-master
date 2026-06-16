import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, space, rad, touch} from '../../../utils/sizes';
import {inputStyles, text as T} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  email: string;
  onChangeEmail: (t: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onSignIn: () => void;
  loading: boolean;
  error?: string | null;
  /** When true the "Check your email" confirmation modal is shown */
  showSuccess: boolean;
  onDismissSuccess: () => void;
};

export function ForgotPasswordScreen({
  email,
  onChangeEmail,
  onSubmit,
  onBack,
  onSignIn,
  loading,
  error,
  showSuccess,
  onDismissSuccess,
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
          title={en.forgotPassword.title}
          subtitle={en.forgotPassword.subtitle}
          onBack={onBack}
        />

        <View style={styles.body}>
          {/* Email input — placeholder only, no label above (Figma: Frame 121075495) */}
          <TextInput
            value={email}
            onChangeText={onChangeEmail}
            style={[inputStyles.field, error ? styles.inputError : null]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={en.forgotPassword.emailLabel}
            placeholderTextColor={colors.textMuted}
            editable={!loading}
          />
          {error ? <Text style={styles.err}>{error}</Text> : null}

          {/* "Remember your password? Sign in." */}
          <Text style={styles.footer}>
            {en.forgotPassword.rememberPrefix}{' '}
            <Text style={styles.footerLink} onPress={onSignIn}>
              {en.forgotPassword.signIn}
            </Text>
          </Text>
        </View>

        <View style={[styles.btnWrap, {paddingBottom: insets.bottom + 8}]}>
          <PrimaryButton
            label={en.continue}
            onPress={onSubmit}
            loading={loading}
            disabled={!email.trim() || loading}
            variant={!email.trim() || loading ? 'muted' : 'solid'}
            style={{minHeight: touch.minHButton}}
          />
        </View>
      </ScrollView>

      {/* "Check your email" — iOS-style alert modal (Figma: node 299:19614 success state) */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{en.forgotPassword.successTitle}</Text>
            <Text style={styles.cardBody}>
              {en.forgotPassword.successBody}{'\n'}
              <Text style={styles.cardEmail}>{email}</Text>
            </Text>
            {/* iOS-style full-width divider */}
            <View style={styles.cardDivider} />
            <Pressable
              onPress={onDismissSuccess}
              style={({pressed}) => [styles.cardBtn, pressed && {opacity: 0.6}]}>
              <Text style={styles.cardBtnT}>{en.forgotPassword.successCta}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {paddingHorizontal: hPad(5), paddingTop: space.lg, flex: 1},

  inputError: {borderColor: colors.primary},
  err: {color: colors.primary, fontSize: FontSizes.caption, marginTop: 6},

  footer: {
    marginTop: space.md,
    ...T.captionLight,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: Weights.bold,
  },

  btnWrap: {paddingHorizontal: hPad(5), marginTop: 'auto'},

  /* ── Success modal — iOS UIAlertController style ── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: rad.xl,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  cardTitle: {
    fontSize: FontSizes.size17,
    fontWeight: Weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardEmail: {
    fontWeight: Weights.semibold,
    color: colors.textPrimary,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: '100%',
  },
  cardBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* iOS system blue for the action button (matches Figma screenshot 2.1.2) */
  cardBtnT: {
    fontSize: FontSizes.size17,
    fontWeight: Weights.regular,
    color: '#007AFF',
  },
});
