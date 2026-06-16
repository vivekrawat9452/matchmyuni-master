import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {z} from 'zod';
import {EmailEntryScreen} from './EmailEntryScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {useAuthStore} from '../../../stores/authStore';
import {AGENT_TOTAL_STEPS, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import type {AuthStackParamList} from '../../../navigation/authTypes';

const emailSchema = z.string().email();

export function EmailEntryContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'EmailEntry'>>();
  const setField = useOnboardingStore(s => s.setField);
  const role = useAuthStore(s => s.role);
  const [value, setValue] = useState(useOnboardingStore.getState().email);

  const valid = useMemo(() => emailSchema.safeParse(value.trim()).success, [value]);

  const stepTotal = useMemo(
    () => (role === 'agent' ? AGENT_TOTAL_STEPS : ONBOARDING_TOTAL_STEPS),
    [role],
  );

  const onContinue = useCallback(() => {
    if (!valid) {
      return;
    }
    setField('email', value.trim().toLowerCase());
    navigation.navigate('PasswordCreate');
  }, [navigation, setField, valid, value]);

  return (
    <EmailEntryScreen
      value={value}
      onChange={setValue}
      onContinue={onContinue}
      onBack={() => navigation.goBack()}
      disabled={!valid}
      stepTotal={stepTotal}
    />
  );
}
