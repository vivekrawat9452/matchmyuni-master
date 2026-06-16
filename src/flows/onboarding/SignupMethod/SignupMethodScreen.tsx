import React from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Mail, Phone} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights} from '../../../utils';
import {hPad, space, font, rad} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ─── Brand logo SVG strings ────────────────────────────────────────────────────
// Google G mark — 4-color brand logo (matches Figma node 299:19288)
const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
</svg>`;

// Apple logo — single dark path (matches Figma node 299:19296, fill #1A1C29)
const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000">
  <path fill="#1A1C29" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 387.7 43 326.3 43 285.2c0-183.8 114.2-281.1 224.2-281.1 60.7 0 111.1 39.8 149.1 39.8 36 0 92.7-42.4 160.5-42.4 28.4 0 112.7 6.5 173.5 60.5zm-81.5-111.9c-5.8 23.4-6.4 45.1-6.4 49.4 0 3.2.6 6.4 1.3 9.5 7.8 2.6 16.1 4.5 25.8 4.5 35.3 0 77.8-37.6 77.8-91.4 0-6.4-.6-13-1.3-19.4-22.2 3.3-63.5 26.8-97.2 47.4z"/>
</svg>`;

type Props = {
  onEmail: () => void;
  onPhone: () => void;
  onGoogle: () => void;
  onApple: () => void;
  onBack: () => void;
  onLogIn: () => void;
};

export function SignupMethodScreen({onEmail, onPhone, onGoogle, onApple, onBack, onLogIn}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: insets.bottom + 24, flexGrow: 1}}
      style={{backgroundColor: colors.background}}>
      <WaveHeader
        title={en.signupMethod.title}
        subtitle={en.signupMethod.subtitle}
        onBack={onBack}
      />
      <StepIndicator currentStep={1} total={ONBOARDING_TOTAL_STEPS} />

      <View style={styles.body}>
        {/* ── Email / Phone method cards ── */}
        <MethodCard icon="mail" onPress={onEmail} label={en.signupMethod.email} />
        <MethodCard icon="phone" onPress={onPhone} label={en.signupMethod.phone} />

        {/* ── "or" separator ── */}
        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.or}>{en.signupMethod.or}</Text>
          <View style={styles.line} />
        </View>

        {/* ── Google ── */}
        <Pressable
          onPress={onGoogle}
          style={({pressed}) => [styles.socialBtn, pressed && {opacity: 0.85}]}>
          <SvgXml xml={GOOGLE_SVG} width={20} height={20} />
          <Text style={styles.socialBtnT}>{en.signupMethod.google}</Text>
          {/* spacer to balance icon and center text visually */}
          <View style={styles.iconPlaceholder} />
        </Pressable>

        {/* ── Apple ── Figma: fill=#FFFFFF stroke=#E7E1D9, icon fill=#1A1C29 ── */}
        <Pressable
          onPress={onApple}
          style={({pressed}) => [styles.socialBtn, pressed && {opacity: 0.85}]}>
          <SvgXml xml={APPLE_SVG} width={20} height={20} />
          <Text style={styles.socialBtnT}>{en.signupMethod.apple}</Text>
          <View style={styles.iconPlaceholder} />
        </Pressable>

        {/* ── Already have an account ── */}
        <Text style={styles.foot} onPress={onLogIn}>
          Already have an account?{'  '}
          <Text style={styles.footB}>Log in</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Method card (email / phone) ──────────────────────────────────────────────
// Figma: 358×64 r=18 fill=#FFFFFF stroke=#E7E1D9
// Icon ellipse: 36×36 fill=#E8613A; inner icon: 16×16 white
function MethodCard({
  icon,
  label,
  onPress,
}: {
  icon: 'mail' | 'phone';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && {opacity: 0.9}]}>
      <View style={styles.cardIcon}>
        {icon === 'mail' ? (
          <Mail color={colors.white} size={16} strokeWidth={2} />
        ) : (
          <Phone color={colors.white} size={16} strokeWidth={2} />
        )}
      </View>
      <Text style={styles.cardT}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: hPad(5),
    paddingTop: 8,
  },

  // ── Email / Phone card ──────────────────────────────────────────────────────
  // Figma: 358×64  r=18  fill=#FFFFFF  stroke=#E7E1D9 sw=1
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: colors.white,
    borderRadius: rad.lg,            // 18
    borderWidth: 1,
    borderColor: colors.border,      // #E7E1D9
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  // Figma: 36×36 ELLIPSE fill=#E8613A
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary, // #E8613A
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: TEXT 16px w600 fill=#1A1C29
  cardT: {
    marginLeft: 12,
    fontSize: font.body,
    fontWeight: Weights.semibold,
    color: colors.textPrimary,
  },

  // ── "or" separator ──────────────────────────────────────────────────────────
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: space.md,
  },
  line: {flex: 1, height: 1, backgroundColor: colors.border},
  or: {
    paddingHorizontal: 12,
    color: colors.textMuted,
    fontSize: FontSizes.caption,
    fontWeight: Weights.medium,
  },

  // ── Social buttons (Google & Apple) ────────────────────────────────────────
  // Figma: 358×54  r=100  fill=#FFFFFF  stroke=#E7E1D9 sw=1
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    backgroundColor: colors.white,  // #FFFFFF — both Google AND Apple are white
    borderRadius: 100,               // pill
    borderWidth: 1,
    borderColor: colors.border,      // #E7E1D9
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  // Figma: TEXT 16px w600 fill=#1A1C29 (centered)
  socialBtnT: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.body,
    fontWeight: Weights.semibold,
    color: colors.textPrimary,
  },
  // Balances the leading icon so text stays perfectly centred
  iconPlaceholder: {width: 20},

  // ── Footer ──────────────────────────────────────────────────────────────────
  foot: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: space.lg,
    fontSize: font.caption,
  },
  footB: {
    fontWeight: Weights.bold,
    color: colors.navy,
  },
});
