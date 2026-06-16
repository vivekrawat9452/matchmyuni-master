import React, {useState, useCallback} from 'react';
import {useNavigation, CommonActions} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {z} from 'zod';
import {ForgotPasswordScreen} from './ForgotPasswordScreen';
import {postForgotPassword} from '../../../api/authApi';
import {getApiErrorMessage} from '../../../api/client';
import {en} from '../../../utils/strings/en';
import type {AuthStackParamList} from '../../../navigation/authTypes';

const emailSchema = z.string().email();

export function ForgotPasswordContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const onChangeEmail = useCallback((t: string) => {
    setEmail(t);
    setError(null);
  }, []);

  const onSubmit = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!emailSchema.safeParse(trimmed).success) {
      setError(en.errors.invalidEmail);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await postForgotPassword(trimmed);
      setShowSuccess(true);
    } catch (e) {
      setError(getApiErrorMessage(e, en.errors.generic));
    } finally {
      setLoading(false);
    }
  }, [email]);

  // After user taps "Alright" — pop back to Login, removing ForgotPassword from the stack
  const onDismissSuccess = useCallback(() => {
    setShowSuccess(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: 'Welcome'}, {name: 'Login'}],
      }),
    );
  }, [navigation]);

  // "Sign in" footer link also goes back to Login
  const onSignIn = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <ForgotPasswordScreen
      email={email}
      onChangeEmail={onChangeEmail}
      onSubmit={onSubmit}
      onBack={() => navigation.goBack()}
      onSignIn={onSignIn}
      loading={loading}
      error={error}
      showSuccess={showSuccess}
      onDismissSuccess={onDismissSuccess}
    />
  );
}
