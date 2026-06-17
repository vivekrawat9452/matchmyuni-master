import React, {useCallback, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgentCountrySelectScreen} from './AgentCountrySelectScreen';
import {getCountries} from '../../../api/publicApi';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function AgentCountrySelectContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'AgentCountrySelect'>>();
  const setField = useOnboardingStore(s => s.setField);
  const {data: countries = []} = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 30 * 60 * 1000,
  });

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return countries;
    }
    return countries.filter(
      c => c.name.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const onToggle = useCallback((id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const canSubmit = selectedIds.length > 0;

  const onContinue = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    const names = countries.filter(c => selectedIds.includes(c.id)).map(c => c.name);
    setField('operatingCountryIds', selectedIds);
    setField('countryIds', selectedIds);
    setField('countryName', names[0] ?? '');
    navigation.navigate('AgentPreparing');
  }, [canSubmit, countries, navigation, selectedIds, setField]);

  return (
    <AgentCountrySelectScreen
      search={search}
      onSearch={setSearch}
      countries={filteredCountries}
      selectedIds={selectedIds}
      onToggle={onToggle}
      onBack={() => navigation.goBack()}
      onContinue={onContinue}
      canSubmit={canSubmit}
    />
  );
}
