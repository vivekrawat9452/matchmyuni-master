import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StartTimelineScreen, type TlOption} from './StartTimelineScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {TIMELINE_ID_TO_INTENDED_START} from '../../../utils/recommendationMappers';
import type {AuthStackParamList} from '../../../navigation/authTypes';

const OPTIONS: TlOption[] = [
  {id: 'y0',  title: 'This year',    sub: 'Ready to apply now',    svgKey: 'rocket'},
  {id: 'y1',  title: 'Next year',    sub: 'Planning ahead',        svgKey: 'calendar'},
  {id: 'y23', title: 'In 2–3 years', sub: 'Early research phase',  svgKey: 'business'},
  {id: 'exp', title: 'Just exploring', sub: 'No timeline yet',     svgKey: 'eyes'},
];

export function StartTimelineContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'StartTimeline'>>();
  const [id, setId] = useState<string | null>(null);
  const setField = useOnboardingStore(s => s.setField);

  const canSubmit = useMemo(() => id != null, [id]);
  const selected = useMemo(
    () => (id == null ? null : OPTIONS.find(o => o.id === id)?.title ?? null),
    [id],
  );

  const onContinue = useCallback(() => {
    if (selected && id) {
      setField('timeline', selected);
      const apiStart = TIMELINE_ID_TO_INTENDED_START[id];
      if (apiStart) {
        setField('intendedStart', apiStart);
      }
    }
    navigation.navigate('BudgetSelect');
  }, [id, navigation, selected, setField]);

  return (
    <StartTimelineScreen
      options={OPTIONS}
      selected={id}
      onSelect={setId}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('BudgetSelect')}
      onContinue={onContinue}
      canSubmit={canSubmit}
    />
  );
}
