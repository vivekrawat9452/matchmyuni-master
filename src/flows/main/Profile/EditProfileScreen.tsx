import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  avatarInitial: string;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeCountryCode: (v: string) => void;
  onChangeContact: (v: string) => void;
  onChangeCountry: (v: string) => void;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[inputStyles.field, !editable && styles.readOnly]}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        placeholderTextColor={colors.textMuted}
        editable={editable}
      />
    </View>
  );
}

export function EditProfileScreen({
  firstName,
  lastName,
  email,
  countryCode,
  contact,
  country,
  avatarInitial,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangeCountryCode,
  onChangeContact,
  onChangeCountry,
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
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 24},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>

        <Text style={styles.groupTitle}>Personal Info</Text>
        <View style={ps.section}>
          <Field label="First name" value={firstName} onChangeText={onChangeFirstName} />
          <Field label="Last name" value={lastName} onChangeText={onChangeLastName} />
          <Field
            label="Email"
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            editable={false}
          />
          <View style={styles.phoneRow}>
            <View style={styles.codeWrap}>
              <Text style={inputStyles.label}>Code</Text>
              <TextInput
                value={countryCode}
                onChangeText={onChangeCountryCode}
                style={[inputStyles.field, styles.codeField]}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.phoneWrap}>
              <Text style={inputStyles.label}>Phone</Text>
              <TextInput
                value={contact}
                onChangeText={onChangeContact}
                style={inputStyles.field}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <Field label="Country" value={country} onChangeText={onChangeCountry} />
        </View>

        <PrimaryButton
          label="Update profile"
          onPress={onSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {paddingHorizontal: SCREEN_H_PADDING},
  avatarWrap: {alignItems: 'center', marginBottom: 20},
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 36, fontWeight: '800', color: colors.white},
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 10,
  },
  fieldWrap: {marginBottom: 12},
  readOnly: {opacity: 0.7},
  phoneRow: {flexDirection: 'row', gap: 10},
  codeWrap: {width: 72},
  codeField: {paddingHorizontal: 12},
  phoneWrap: {flex: 1},
  saveBtn: {marginTop: 8},
});
