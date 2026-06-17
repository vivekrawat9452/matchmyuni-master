import React, {useState, useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PasswordCreateScreen} from './PasswordCreateScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {useAuthStore} from '../../../stores/authStore';
import {AGENT_TOTAL_STEPS, ONBOARDING_TOTAL_STEPS} from '../../../components/StepIndicator';
import type {AuthStackParamList} from '../../../navigation/authTypes';

function analyze(pw: string) {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    num: /[0-9]/.test(pw),
    spec: /[^A-Za-z0-9]/.test(pw),
  };
}

function meetsApi(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export function PasswordCreateContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'PasswordCreate'>>();
  const setField = useOnboardingStore(s => s.setField);
  const role = useAuthStore(s => s.role);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const checks = useMemo(() => analyze(value), [value]);
  const canSubmit = useMemo(() => meetsApi(value) && checks.spec, [value, checks]);
  const stepTotal = useMemo(
    () => (role === 'agent' ? AGENT_TOTAL_STEPS : ONBOARDING_TOTAL_STEPS),
    [role],
  );

  const onContinue = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    setField('password', value);
    // Agents collect personal details next; students go to account details.
    if (role === 'agent') {
      navigation.navigate('AgentPersonalDetails');
    } else {
      navigation.navigate('AccountDetails');
    }
  }, [canSubmit, navigation, role, setField, value]);

  return (
    <PasswordCreateScreen
      value={value}
      onChange={setValue}
      onContinue={onContinue}
      onBack={() => navigation.goBack()}
      showPw={show}
      onTogglePw={() => setShow(s => !s)}
      checks={checks}
      canSubmit={canSubmit}
      stepTotal={stepTotal}
    />
  );
}
