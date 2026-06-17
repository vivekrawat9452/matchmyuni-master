import React, {useCallback, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgentPersonalDetailsScreen} from './AgentPersonalDetailsScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {
  AGENT_COUNTRIES,
  DEFAULT_AGENT_COUNTRY,
  type AgentCountryItem,
} from '../../agent/students/AddStudent/agentCountries';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function AgentPersonalDetailsContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'AgentPersonalDetails'>>();
  const setField = useOnboardingStore(s => s.setField);
  const draft = useOnboardingStore.getState();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState(draft.contact || '');
  const [organization, setOrganization] = useState(draft.organization || '');
  const [dialCountry, setDialCountry] = useState<AgentCountryItem>(() => {
    const match = AGENT_COUNTRIES.find(c => c.dialCode === draft.countryCode);
    return match ?? DEFAULT_AGENT_COUNTRY;
  });
  const [dialPickerOpen, setDialPickerOpen] = useState(false);
  const [dialSearch, setDialSearch] = useState('');

  const filteredDialCountries = useMemo(() => {
    const q = dialSearch.trim().toLowerCase();
    if (!q) {
      return AGENT_COUNTRIES;
    }
    return AGENT_COUNTRIES.filter(
      c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q),
    );
  }, [dialSearch]);

  const onChange = useCallback(
    (k: 'firstName' | 'lastName' | 'contact' | 'organization', v: string) => {
      if (k === 'firstName') {
        setFirstName(v);
      }
      if (k === 'lastName') {
        setLastName(v);
      }
      if (k === 'contact') {
        setContact(v);
      }
      if (k === 'organization') {
        setOrganization(v);
      }
    },
    [],
  );

  const canSubmit = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      contact.trim().length > 0 &&
      organization.trim().length > 0,
    [contact, firstName, lastName, organization],
  );

  const onContinue = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    setField('firstName', firstName.trim());
    setField('lastName', lastName.trim());
    setField('contact', contact.trim());
    setField('countryCode', dialCountry.dialCode);
    setField('organization', organization.trim());
    navigation.navigate('AgentCountrySelect');
  }, [canSubmit, contact, dialCountry.dialCode, firstName, lastName, navigation, organization, setField]);

  return (
    <AgentPersonalDetailsScreen
      firstName={firstName}
      lastName={lastName}
      contact={contact}
      organization={organization}
      dialCountry={dialCountry}
      dialCountries={filteredDialCountries}
      dialSearch={dialSearch}
      dialPickerOpen={dialPickerOpen}
      onChange={onChange}
      onOpenDialPicker={() => {
        setDialSearch('');
        setDialPickerOpen(true);
      }}
      onCloseDialPicker={() => {
        setDialPickerOpen(false);
        setDialSearch('');
      }}
      onDialSearch={setDialSearch}
      onPickDialCountry={c => {
        setDialCountry(c);
        setDialPickerOpen(false);
        setDialSearch('');
      }}
      onContinue={onContinue}
      onBack={() => navigation.goBack()}
      canSubmit={canSubmit}
    />
  );
}
