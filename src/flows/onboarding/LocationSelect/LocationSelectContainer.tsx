import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LocationSelectScreen} from './LocationSelectScreen';
import {
  getStudyDestinationCountries,
  FALLBACK_STUDY_DESTINATIONS,
} from '../../../api/studyDestinationCountries';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function LocationSelectContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LocationSelect'>>();
  const {data: apiCountries} = useQuery({
    queryKey: ['study-destination-countries'],
    queryFn: getStudyDestinationCountries,
    retry: 1,
    staleTime: 30 * 60 * 1000,
  });
  const countries =
    apiCountries && apiCountries.length > 0 ? apiCountries : FALLBACK_STUDY_DESTINATIONS;

  const [search, setSearch] = useState('');
  const [ids, setIds] = useState<number[]>(useOnboardingStore.getState().countryIds);
  const setField = useOnboardingStore(s => s.setField);

  const toggle = useCallback((id: number) => {
    setIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const canSubmit = useMemo(() => ids.length > 0, [ids]);

  const onContinue = useCallback(() => {
    setField('countryIds', ids);
    navigation.navigate('StartTimeline');
  }, [ids, navigation, setField]);

  return (
    <LocationSelectScreen
      search={search}
      onSearch={setSearch}
      countries={countries}
      selectedIds={ids}
      onToggle={toggle}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('StartTimeline')}
      onContinue={onContinue}
      canSubmit={canSubmit}
    />
  );
}
