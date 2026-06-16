import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import {X} from 'lucide-react-native';
import {WaveHeader} from '../../../components/WaveHeader';
import {StepIndicator} from '../../../components/StepIndicator';
import {PrimaryButton} from '../../../components/PrimaryButton';
import {colors} from '../../../utils/colors';
import {en} from '../../../utils/strings/en';
import {FontSizes, Weights, Styles} from '../../../utils';
import {inputStyles} from '../../../utils/theme';
import {hPad, rad} from '../../../utils/sizes';
import type {CountryDto} from '../../../api/types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const H_PAD = hPad(5);
const SHEET_HEIGHT = '72%';
const MIN_NAME_LENGTH = 2;

type Props = {
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  countryName: string;
  onChange: (k: 'firstName' | 'lastName' | 'contact' | 'countryCode', v: string) => void;
  onOpenCountry: () => void;
  onCloseCountry: () => void;
  countryOpen: boolean;
  countries: CountryDto[];
  countriesLoading?: boolean;
  countriesError?: boolean;
  onRetryCountries?: () => void;
  onPickCountry: (c: CountryDto) => void;
  onContinue: () => void;
  onBack: () => void;
  canSubmit: boolean;
  countrySearch: string;
  onCountrySearch: (t: string) => void;
  stepTotal?: number;
};

export function AccountDetailsScreen({
  firstName,
  lastName,
  contact,
  countryCode,
  countryName,
  onChange,
  onOpenCountry,
  onCloseCountry,
  countryOpen,
  countries,
  countriesLoading,
  countriesError,
  onRetryCountries,
  onPickCountry,
  onContinue,
  onBack,
  canSubmit,
  countrySearch,
  onCountrySearch,
  stepTotal,
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
      return en.accountDetails.firstNameMinLength;
    }
    return null;
  }, [firstName, firstNameTouched, submitAttempted]);

  const lastNameError = useMemo(() => {
    if (!submitAttempted && !lastNameTouched) {
      return null;
    }
    if (lastName.trim().length < MIN_NAME_LENGTH) {
      return en.accountDetails.lastNameMinLength;
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

  const renderCountryRow: ListRenderItem<CountryDto> = ({item}) => (
    <Pressable
      style={styles.rowItem}
      onPress={() => onPickCountry(item)}
      android_ripple={{color: colors.inputBg}}>
      <Text style={styles.rowFlag}>{item.flag ?? '🌍'}</Text>
      <Text style={styles.rowItemT}>{item.name}</Text>
    </Pressable>
  );

  const listEmpty = () => {
    if (countriesLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.emptyText}>Loading countries…</Text>
        </View>
      );
    }
    if (countriesError) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Could not load countries.</Text>
          {onRetryCountries ? (
            <Pressable onPress={onRetryCountries} hitSlop={8}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          {countrySearch.trim()
            ? 'No countries match your search.'
            : 'No countries available.'}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        <WaveHeader title={en.accountDetails.title} subtitle={en.accountDetails.subtitle} onBack={onBack} />
        <StepIndicator currentStep={1} total={stepTotal} />
        <View style={styles.body}>
          <Field
            label={en.accountDetails.first}
            value={firstName}
            onChangeText={t => onChange('firstName', t)}
            onBlur={() => setFirstNameTouched(true)}
            error={firstNameError}
          />
          <Field
            label={en.accountDetails.last}
            value={lastName}
            onChangeText={t => onChange('lastName', t)}
            onBlur={() => setLastNameTouched(true)}
            error={lastNameError}
          />
          <Text style={styles.label}>{en.accountDetails.country}</Text>
          <Pressable onPress={onOpenCountry} style={styles.picker}>
            <Text style={countryName ? styles.pickerT : styles.pickerPh}>
              {countryName || 'Country'}
            </Text>
          </Pressable>
          <View style={styles.row}>
            <View style={styles.half30}>
              <Text style={styles.label}>Code</Text>
              <TextInput
                style={styles.input}
                value={countryCode}
                onChangeText={t => onChange('countryCode', t)}
                placeholder="+234"
              />
            </View>
            <View style={[styles.half70, {marginLeft: 10}]}>
              <Text style={styles.label}>{en.accountDetails.phone}</Text>
              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={t => onChange('contact', t)}
                keyboardType="phone-pad"
                placeholder="08012345678"
              />
            </View>
          </View>
        </View>
        <View style={{paddingHorizontal: 16, paddingBottom: insets.bottom + 8}}>
          <PrimaryButton
            label={en.continue}
            onPress={handleContinue}
            disabled={false}
            variant={!canSubmit ? 'muted' : 'solid'}
          />
        </View>
      </View>

      <Modal
        visible={countryOpen}
        animationType="slide"
        transparent
        onRequestClose={onCloseCountry}>
        <Pressable style={styles.modalBg} onPress={onCloseCountry}>
          <Pressable
            style={[styles.sheet, {paddingBottom: insets.bottom + 12, height: SHEET_HEIGHT}]}
            onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{en.accountDetails.country}</Text>
              <Pressable onPress={onCloseCountry} style={styles.closeBtn} hitSlop={12}>
                <X color={colors.textPrimary} size={18} strokeWidth={2.5} />
              </Pressable>
            </View>

            <TextInput
              style={[styles.search, styles.searchInSheet]}
              placeholder="Search country"
              value={countrySearch}
              onChangeText={onCountrySearch}
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
              importantForAutofill="no"
              textContentType="none"
              clearButtonMode="while-editing"
            />

            <FlatList
              style={styles.countryList}
              data={countries}
              keyExtractor={c => String(c.id)}
              renderItem={renderCountryRow}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              ListEmptyComponent={listEmpty}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={
                countries.length === 0 ? styles.listEmptyContainer : styles.listContent
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string | null;
}) {
  return (
    <View style={{marginBottom: 12}}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: Styles.screen,
  body: {padding: 16, paddingTop: 8, flex: 1},
  label: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.medium,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 15,
  },
  input: inputStyles.field,
  inputError: {borderColor: colors.primary, borderWidth: 1},
  fieldError: {
    fontSize: FontSizes.caption,
    color: colors.primary,
    marginTop: 4,
  },
  row: {flexDirection: 'row'},
  half30: {flex: 0.2},
  half70: {flex: 0.8},
  picker: {
    ...inputStyles.field,
    justifyContent: 'center',
    marginBottom: 12,
  },
  pickerT: {fontSize: FontSizes.body, color: colors.textPrimary},
  pickerPh: {fontSize: FontSizes.body, color: colors.textMuted},
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,
    borderTopRightRadius: rad.xl,
    paddingHorizontal: H_PAD,
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  sheetTitle: {
    fontSize: FontSizes.body,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: inputStyles.search,
  searchInSheet: {marginBottom: 12, height: 48},
  countryList: {flex: 1},
  listContent: {paddingBottom: 8},
  listEmptyContainer: {flexGrow: 1, justifyContent: 'center'},
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowFlag: {fontSize: 22, width: 28, textAlign: 'center'},
  rowItemT: {flex: 1, fontSize: FontSizes.body, color: colors.navy},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: FontSizes.chip,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryText: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
});
