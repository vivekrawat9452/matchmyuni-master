import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StudyInterestsScreen, type StudyItem} from './StudyInterestsScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {studyIdsToCategories} from '../../../utils/recommendationMappers';
import type {AuthStackParamList} from '../../../navigation/authTypes';

// Emoji characters extracted directly from Figma node 301-21900 (fontSize 32, Plus Jakarta Sans)
const ITEMS: StudyItem[] = [
  {id: 'business',    label: 'Business',      emoji: '💼'},
  {id: 'engineering', label: 'Engineering',   emoji: '⚙️'},
  {id: 'medicine',    label: 'Medicine',      emoji: '🩺'},
  {id: 'law',         label: 'Law',           emoji: '⚖️'},
  {id: 'cs',          label: 'Computer Sci.', emoji: '💻'},
  {id: 'arts',        label: 'Arts & Design', emoji: '🎨'},
  {id: 'arch',        label: 'Architecture',  emoji: '🏛️'},
  {id: 'psych',       label: 'Psychology',    emoji: '🧠'},
  {id: 'finance',     label: 'Finance',       emoji: '📊'},
  {id: 'edu',         label: 'Education',     emoji: '📚'},
  {id: 'science',     label: 'Sciences',      emoji: '🔬'},
  {id: 'media',       label: 'Media',         emoji: '🎬'},
];

export function StudyInterestsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'StudyInterests'>>();
  const [sel, setSel] = useState<string[]>([]);
  const setField = useOnboardingStore(s => s.setField);

  const toggle = useCallback((id: string) => {
    setSel(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const canSubmit = useMemo(() => sel.length > 0, [sel]);

  const onContinue = useCallback(() => {
    setField('studyTags', sel);
    setField('preferredCategories', studyIdsToCategories(sel));
    navigation.navigate('LocationSelect');
  }, [navigation, sel, setField]);

  return (
    <StudyInterestsScreen
      items={ITEMS}
      selected={sel}
      onToggle={toggle}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('LocationSelect')}
      onContinue={onContinue}
      canSubmit={canSubmit}
    />
  );
}
