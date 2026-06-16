import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AccountDetailsScreen} from './AccountDetailsScreen';
import {getCountries} from '../../../api/publicApi';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {useAuthStore} from '../../../stores/authStore';
import {AGENT_TOTAL_STEPS, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import type {AuthStackParamList} from '../../../navigation/authTypes';
import type {CountryDto} from '../../../api/types';

export function AccountDetailsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'AccountDetails'>>();
  const {
    data: countries = [],
    isLoading: countriesLoading,
    isError: countriesError,
    refetch: refetchCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 30 * 60 * 1000,
  });
  const role = useAuthStore(s => s.role);

  // Pre-fill phone if it came from PhoneEntry screen
  const draft = useOnboardingStore.getState();
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [contact, setContact] = useState(draft.contact || '');
  const [countryCode, setCountryCode] = useState(draft.countryCode || '+1');
  const [countryName, setCountryName] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const setField = useOnboardingStore(s => s.setField);

  const stepTotal = useMemo(
    () => (role === 'agent' ? AGENT_TOTAL_STEPS : ONBOARDING_TOTAL_STEPS),
    [role],
  );

  const onChange = useCallback(
    (k: 'firstName' | 'lastName' | 'contact' | 'countryCode', v: string) => {
      if (k === 'firstName') {
        setFirst(v);
      }
      if (k === 'lastName') {
        setLast(v);
      }
      if (k === 'contact') {
        setContact(v);
      }
      if (k === 'countryCode') {
        setCountryCode(v);
      }
    },
    [],
  );

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return countries;
    }
    return countries.filter(c => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const onOpenCountry = useCallback(() => {
    setSearch('');
    setOpen(true);
  }, []);

  const onCloseCountry = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const onPickCountry = useCallback((c: CountryDto) => {
    setCountryName(c.name);
    setOpen(false);
    setSearch('');
  }, []);

  const canSubmit = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      contact.trim().length > 0 &&
      countryName.length > 0,
    [firstName, lastName, contact, countryName],
  );

  const onContinue = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    setField('firstName', firstName.trim());
    setField('lastName', lastName.trim());
    setField('contact', contact.trim());
    setField('countryCode', countryCode.trim());
    setField('countryName', countryName);
    // Agent goes directly to account creation; students continue with preferences
    if (role === 'agent') {
      navigation.navigate('AgentPreparing');
    } else {
      navigation.navigate('StudyInterests');
    }
  }, [
    canSubmit,
    contact,
    countryCode,
    countryName,
    firstName,
    lastName,
    navigation,
    role,
    setField,
  ]);

  return (
    <AccountDetailsScreen
      firstName={firstName}
      lastName={lastName}
      contact={contact}
      countryCode={countryCode}
      countryName={countryName}
      onChange={onChange}
      onOpenCountry={onOpenCountry}
      onCloseCountry={onCloseCountry}
      countryOpen={open}
      countries={filteredCountries}
      countriesLoading={countriesLoading}
      countriesError={countriesError}
      onRetryCountries={() => void refetchCountries()}
      onPickCountry={onPickCountry}
      onContinue={onContinue}
      onBack={() => navigation.goBack()}
      canSubmit={canSubmit}
      countrySearch={search}
      onCountrySearch={setSearch}
      stepTotal={stepTotal}
    />
  );
}
