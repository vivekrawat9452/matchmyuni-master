import React, {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {StudyPreferencesScreen} from './StudyPreferencesScreen';
import {BUDGET_OPTIONS} from './profileConstants';
import {getUserDetails, patchStudentProfile} from '../../../api/userApi';
import {getApiErrorMessage} from '../../../api/client';
import {withLoader} from '../../../utils/loader';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';

type Nav = NativeStackNavigationProp<ProfileStackList, 'StudyPreferences'>;

function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function StudyPreferencesContainer() {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const {data: details} = useQuery({
    queryKey: ['user', 'details'],
    queryFn: getUserDetails,
  });

  const sp = details?.studentProfile;

  const [destinations, setDestinations] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>(BUDGET_OPTIONS[2]);
  const [fields, setFields] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDestinations(parseList(sp?.preferredDestination));
    const stored = sp?.budgetCurrency;
    if (stored && BUDGET_OPTIONS.includes(stored as (typeof BUDGET_OPTIONS)[number])) {
      setBudget(stored);
    }
    setFields(parseList(sp?.gradesObtained?.split('|')[1]));
  }, [sp]);

  const onToggleDestination = useCallback((d: string) => {
    setDestinations(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d],
    );
  }, []);

  const onToggleField = useCallback((f: string) => {
    setFields(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f],
    );
  }, []);

  const onApply = useCallback(async () => {
    setSaving(true);
    try {
      await withLoader(async () => {
        await patchStudentProfile({
          preferredDestination: destinations.join(', '),
          budgetCurrency: budget,
        });
        await qc.invalidateQueries({queryKey: ['user', 'details']});
      }, 'Saving…');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', getApiErrorMessage(e, 'Could not save preferences.'));
    } finally {
      setSaving(false);
    }
  }, [budget, destinations, navigation, qc]);

  return (
    <StudyPreferencesScreen
      destinations={destinations}
      budget={budget}
      fields={fields}
      onToggleDestination={onToggleDestination}
      onSelectBudget={setBudget}
      onToggleField={onToggleField}
      onClose={() => navigation.goBack()}
      onApply={onApply}
      saving={saving}
    />
  );
}
