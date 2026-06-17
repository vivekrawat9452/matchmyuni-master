import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator, AGENT_TOTAL_STEPS} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {CountryPickerModal} from '../../agent/students/AddStudent/CountryPickerModal';
import type {AgentCountryItem} from '../../agent/students/AddStudent/agentCountries';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {Styles} from '../../../utils';
import {inputStyles} from '../../../utils/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const MIN_NAME_LENGTH = 2;

type Props = {
  firstName: string;
  lastName: string;
  contact: string;
  organization: string;
  dialCountry: AgentCountryItem;
  dialCountries: AgentCountryItem[];
  dialSearch: string;
  dialPickerOpen: boolean;
  onChange: (k: 'firstName' | 'lastName' | 'contact' | 'organization', v: string) => void;
  onOpenDialPicker: () => void;
  onCloseDialPicker: () => void;
  onDialSearch: (q: string) => void;
  onPickDialCountry: (c: AgentCountryItem) => void;
  onContinue: () => void;
  onBack: () => void;
  canSubmit: boolean;
};

export function AgentPersonalDetailsScreen({
  firstName,
  lastName,
  contact,
  organization,
  dialCountry,
  dialCountries,
  dialSearch,
  dialPickerOpen,
  onChange,
  onOpenDialPicker,
  onCloseDialPicker,
  onDialSearch,
  onPickDialCountry,
  onContinue,
  onBack,
  canSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const firstNameError = useMemo(() => {
    if (!submitAttempted && !firstNameTouched) {
      return null;
    }
    if (firstName.trim().length < MIN_NAME_LENGTH) {
      return en.agentPersonalDetails.firstNameMinLength;
    }
    return null;
  }, [firstName, firstNameTouched, submitAttempted]);

  const lastNameError = useMemo(() => {
    if (!submitAttempted && !lastNameTouched) {
      return null;
    }
    if (lastName.trim().length < MIN_NAME_LENGTH) {
      return en.agentPersonalDetails.lastNameMinLength;
    }
    return null;
  }, [lastName, lastNameTouched, submitAttempted]);

  const handleContinue = useCallback(() => {
    setSubmitAttempted(true);
    const fnValid = firstName.trim().length >= MIN_NAME_LENGTH;
    const lnValid = lastName.trim().length >= MIN_NAME_LENGTH;
    if (!fnValid || !lnValid || !canSubmit) {
      return;
    }
    onContinue();
  }, [canSubmit, firstName, lastName, onContinue]);

  return (
    <KeyboardAvoidingView style={Styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        <WaveHeader
          title={en.agentPersonalDetails.title}
          subtitle={en.agentPersonalDetails.subtitle}
          onBack={onBack}
        />
        <StepIndicator currentStep={2} total={AGENT_TOTAL_STEPS} />

        <View style={styles.body}>
          <Field
            placeholder={en.agentPersonalDetails.firstName}
            value={firstName}
            onChangeText={t => onChange('firstName', t)}
            onBlur={() => setFirstNameTouched(true)}
            error={firstNameError}
          />
          <Field
            placeholder={en.agentPersonalDetails.lastName}
            value={lastName}
            onChangeText={t => onChange('lastName', t)}
            onBlur={() => setLastNameTouched(true)}
            error={lastNameError}
          />

          <View style={styles.phoneRow}>
            <Pressable style={styles.dialBox} onPress={onOpenDialPicker}>
              <Text style={styles.dialFlag}>{dialCountry.flag}</Text>
              <Text style={styles.dialCode}>{dialCountry.dialCode}</Text>
            </Pressable>
            <TextInput
              style={[inputStyles.field, styles.phoneInput]}
              value={contact}
              onChangeText={t => onChange('contact', t)}
              keyboardType="phone-pad"
              placeholder={en.agentPersonalDetails.phone}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Field
            placeholder={en.agentPersonalDetails.organization}
            value={organization}
            onChangeText={t => onChange('organization', t)}
          />
        </View>

        <View style={{paddingHorizontal: 16, paddingBottom: insets.bottom + 8}}>
          <PrimaryButton
            label={en.continue}
            onPress={handleContinue}
            variant={!canSubmit ? 'muted' : 'solid'}
          />
        </View>
      </View>

      <CountryPickerModal
        visible={dialPickerOpen}
        countries={dialCountries}
        search={dialSearch}
        onSearchChange={onDialSearch}
        onSelect={onPickDialCountry}
        onClose={onCloseDialPicker}
      />
    </KeyboardAvoidingView>
  );
}

function Field({
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string | null;
}) {
  return (
    <View style={styles.fieldWrap}>
      <TextInput
        style={[inputStyles.field, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  body: {padding: 16, paddingTop: 8, flex: 1},
  fieldWrap: {marginBottom: 12},
  inputError: {borderColor: colors.primary, borderWidth: 1},
  fieldError: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dialBox: {
    ...inputStyles.field,
    width: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  dialFlag: {fontSize: 18},
  dialCode: {fontSize: 16, fontWeight: '600', color: colors.textPrimary},
  phoneInput: {flex: 1},
});
