import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PhoneEntryScreen} from './PhoneEntryScreen';
import type {CountryItem} from './PhoneEntryScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {useAuthStore} from '../../../stores/authStore';
import {AGENT_TOTAL_STEPS, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import type {AuthStackParamList} from '../../../navigation/authTypes';

// ── Common countries with real ITU dial codes and flag emoji ──────────────────
const COUNTRIES: CountryItem[] = [
  {name: 'United States',   dialCode: '+1',   flag: '🇺🇸'},
  {name: 'Canada',          dialCode: '+1',   flag: '🇨🇦'},
  {name: 'United Kingdom',  dialCode: '+44',  flag: '🇬🇧'},
  {name: 'Australia',       dialCode: '+61',  flag: '🇦🇺'},
  {name: 'India',           dialCode: '+91',  flag: '🇮🇳'},
  {name: 'Pakistan',        dialCode: '+92',  flag: '🇵🇰'},
  {name: 'Bangladesh',      dialCode: '+880', flag: '🇧🇩'},
  {name: 'Nigeria',         dialCode: '+234', flag: '🇳🇬'},
  {name: 'Ghana',           dialCode: '+233', flag: '🇬🇭'},
  {name: 'Kenya',           dialCode: '+254', flag: '🇰🇪'},
  {name: 'South Africa',    dialCode: '+27',  flag: '🇿🇦'},
  {name: 'Egypt',           dialCode: '+20',  flag: '🇪🇬'},
  {name: 'UAE',             dialCode: '+971', flag: '🇦🇪'},
  {name: 'Saudi Arabia',    dialCode: '+966', flag: '🇸🇦'},
  {name: 'Turkey',          dialCode: '+90',  flag: '🇹🇷'},
  {name: 'Germany',         dialCode: '+49',  flag: '🇩🇪'},
  {name: 'France',          dialCode: '+33',  flag: '🇫🇷'},
  {name: 'Italy',           dialCode: '+39',  flag: '🇮🇹'},
  {name: 'Spain',           dialCode: '+34',  flag: '🇪🇸'},
  {name: 'Netherlands',     dialCode: '+31',  flag: '🇳🇱'},
  {name: 'Sweden',          dialCode: '+46',  flag: '🇸🇪'},
  {name: 'Norway',          dialCode: '+47',  flag: '🇳🇴'},
  {name: 'Ireland',         dialCode: '+353', flag: '🇮🇪'},
  {name: 'New Zealand',     dialCode: '+64',  flag: '🇳🇿'},
  {name: 'Malaysia',        dialCode: '+60',  flag: '🇲🇾'},
  {name: 'Singapore',       dialCode: '+65',  flag: '🇸🇬'},
  {name: 'China',           dialCode: '+86',  flag: '🇨🇳'},
  {name: 'Japan',           dialCode: '+81',  flag: '🇯🇵'},
  {name: 'South Korea',     dialCode: '+82',  flag: '🇰🇷'},
  {name: 'Brazil',          dialCode: '+55',  flag: '🇧🇷'},
  {name: 'Mexico',          dialCode: '+52',  flag: '🇲🇽'},
  {name: 'Colombia',        dialCode: '+57',  flag: '🇨🇴'},
  {name: 'Argentina',       dialCode: '+54',  flag: '🇦🇷'},
  {name: 'Indonesia',       dialCode: '+62',  flag: '🇮🇩'},
  {name: 'Philippines',     dialCode: '+63',  flag: '🇵🇭'},
  {name: 'Sri Lanka',       dialCode: '+94',  flag: '🇱🇰'},
  {name: 'Nepal',           dialCode: '+977', flag: '🇳🇵'},
  {name: 'Zimbabwe',        dialCode: '+263', flag: '🇿🇼'},
  {name: 'Uganda',          dialCode: '+256', flag: '🇺🇬'},
  {name: 'Tanzania',        dialCode: '+255', flag: '🇹🇿'},
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // United States +1

export function PhoneEntryContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'PhoneEntry'>>();
  const setField = useOnboardingStore(s => s.setField);
  const role = useAuthStore(s => s.role);

  // ── Phone state ────────────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(() => {
    const stored = useOnboardingStore.getState().countryCode;
    return COUNTRIES.find(c => c.dialCode === stored) ?? DEFAULT_COUNTRY;
  });
  const [phone, setPhone] = useState(useOnboardingStore.getState().contact || '');

  // ── Picker state ───────────────────────────────────────────────────────────
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const stepTotal = useMemo(
    () => (role === 'agent' ? AGENT_TOTAL_STEPS : ONBOARDING_TOTAL_STEPS),
    [role],
  );

  const disabled = useMemo(
    () => phone.trim().length < 7,
    [phone],
  );

  const filteredCountries = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [pickerSearch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onOpenPicker = useCallback(() => {
    setPickerSearch('');
    setPickerVisible(true);
  }, []);

  const onClosePicker = useCallback(() => {
    setPickerVisible(false);
  }, []);

  const onSelectCountry = useCallback(
    (country: CountryItem) => {
      setSelectedCountry(country);
      setPickerVisible(false);
    },
    [],
  );

  const onContinue = useCallback(() => {
    if (disabled) {
      return;
    }
    setField('countryCode', selectedCountry.dialCode.trim());
    setField('contact', phone.trim());
    navigation.navigate('EmailEntry');
  }, [disabled, selectedCountry, phone, navigation, setField]);

  return (
    <PhoneEntryScreen
      selectedCountry={selectedCountry}
      phone={phone}
      onChangePhone={setPhone}
      onOpenPicker={onOpenPicker}
      pickerVisible={pickerVisible}
      pickerSearch={pickerSearch}
      onPickerSearch={setPickerSearch}
      onSelectCountry={onSelectCountry}
      onClosePicker={onClosePicker}
      filteredCountries={filteredCountries}
      onContinue={onContinue}
      onBack={() => navigation.goBack()}
      disabled={disabled}
      stepTotal={stepTotal}
    />
  );
}
