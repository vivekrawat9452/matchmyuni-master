import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BudgetSelectScreen, type BudgetOpt} from './BudgetSelectScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {BUDGET_ID_TO_API} from '../../../utils/recommendationMappers';
import type {AuthStackParamList} from '../../../navigation/authTypes';

const OPTIONS: BudgetOpt[] = [
  {id: 't1', title: 'Under $3,000/yr', sub: 'Heavily scholarship-dependent', tag: 'Scholarships'},
  {id: 't2', title: '$3,000–6,000/yr', sub: 'Eastern Europe, some Asian universities'},
  {id: 't3', title: '$6,000–12,000/yr', sub: 'Most of Europe, Malaysia, some UK'},
  {id: 't4', title: '$12,000–25,000/yr', sub: 'UK, Australia, mid-tier Canada'},
  {id: 't5', title: '$25,000+/yr', sub: 'Premium destinations'},
];

export function BudgetSelectContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'BudgetSelect'>>();
  const [id, setId] = useState<string | null>(null);
  const setField = useOnboardingStore(s => s.setField);

  const onSubmit = useCallback(() => {
    if (!id) {
      return;
    }
    const opt = OPTIONS.find(o => o.id === id);
    if (opt) {
      setField('budgetTier', opt.title);
      const apiBudget = BUDGET_ID_TO_API[id];
      if (apiBudget) {
        setField('budget', apiBudget);
      }
    }
    navigation.navigate('Preparing');
  }, [id, navigation, setField]);

  return (
    <BudgetSelectScreen
      options={OPTIONS}
      selected={id}
      onSelect={setId}
      onBack={() => navigation.goBack()}
      onSubmit={onSubmit}
      loading={false}
    />
  );
}
