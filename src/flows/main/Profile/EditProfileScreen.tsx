import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Pencil} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {ProfileStackHeader} from './components/ProfileStackHeader';
import {colors} from '../../../utils/colors';
import {inputStyles} from '../../../utils/theme';
import {profileStyles as ps} from './profileStyles';
import {SCREEN_H_PADDING} from '../../../utils/theme';

export type EditProfileScreenProps = {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  contact: string;
  country: string;
  countryFlag: string;
  avatarInitial: string;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeCountryCode: (v: string) => void;
  onChangeContact: (v: string) => void;
  onChangeCountry: (v: string) => void;
  onEditAvatar?: () => void;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
};

/** Figma 645:4938 — label-free cream input, h=54, r=14 */
function ProfileInput({
  value,
  onChangeText,
  keyboardType,
  editable = true,
  placeholder,
}: {
  value: string;
  onChangeText?: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, !editable && styles.inputReadOnly]}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      editable={editable}
    />
  );
}

/** Figma node 645:4938 — Edit profile */
export function EditProfileScreen({
  firstName,
  lastName,
  email,
  countryCode,
  contact,
  country,
  countryFlag,
  avatarInitial,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangeCountryCode,
  onChangeContact,
  onChangeCountry,
  onEditAvatar,
  onBack,
  onSave,
  saving,
}: EditProfileScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={ps.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProfileStackHeader title="Edit profile" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 120},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Avatar — Figma: 126×126 gold circle + orange edit badge */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          {/* Avatar upload — no API yet; keep control for later wiring */}
          <Pressable
            style={({pressed}) => [
              styles.avatarEditBtn,
              pressed && styles.avatarEditBtnPressed,
            ]}
            onPress={onEditAvatar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo">
            <Pencil size={16} color={colors.background} strokeWidth={2.5} />
          </Pressable>
        </View>

        <Text style={styles.groupTitle}>Personal Info</Text>

        <View style={styles.fields}>
          <ProfileInput
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholder="First name"
          />
          <ProfileInput
            value={lastName}
            onChangeText={onChangeLastName}
            placeholder="Last name"
          />
          <ProfileInput
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            editable={false}
            placeholder="Email"
          />

          {/* Phone row — Figma: code 81px r=8 + phone flex r=8 */}
          <View style={styles.phoneRow}>
            <View style={styles.codeField}>
              <View style={styles.codeFlagCircle}>
                <Text style={styles.codeFlag}>{countryFlag}</Text>
              </View>
              <TextInput
                value={countryCode}
                onChangeText={onChangeCountryCode}
                style={styles.codeInput}
                keyboardType="phone-pad"
                placeholder="+1"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <TextInput
              value={contact}
              onChangeText={onChangeContact}
              style={[styles.input, styles.phoneInput]}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Country — Figma: full-width field with flag prefix */}
          <View style={styles.countryField}>
            <Text style={styles.countryFlag}>{countryFlag}</Text>
            <TextInput
              value={country}
              onChangeText={onChangeCountry}
              style={styles.countryInput}
              placeholder="Country"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer — Figma Frame 121075830 */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + 16}]}>
        <PrimaryButton
          label="Update profile"
          onPress={onSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  scrollContent: {
    paddingHorizontal: SCREEN_H_PADDING,
    paddingTop: 8,
  },
  avatarWrap: {
    alignSelf: 'center',
    width: 126,
    height: 126,
    marginBottom: 16,
  },
  avatarRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: colors.yellowBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 50,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 60,
  },
  avatarEditBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBtnPressed: {opacity: 0.88},
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.16,
    lineHeight: 22,
    marginBottom: 12,
  },
  fields: {gap: 8},
  input: {
    ...inputStyles.field,
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
  },
  inputReadOnly: {opacity: 0.85},
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  codeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 81,
    height: 54,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  codeFlagCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeFlag: {fontSize: 14, lineHeight: 18},
  codeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    padding: 0,
  },
  phoneInput: {
    flex: 1,
    borderRadius: 8,
    fontWeight: '600',
    color: colors.textMuted,
  },
  countryField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  countryFlag: {fontSize: 16, lineHeight: 20},
  countryInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    padding: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_H_PADDING,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveBtn: {minHeight: 54, borderRadius: 1000},
});
