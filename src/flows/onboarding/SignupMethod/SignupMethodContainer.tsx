import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SignupMethodScreen} from './SignupMethodScreen';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {en} from '../../../utils/strings/en';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function SignupMethodContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignupMethod'>>();
  const setField = useOnboardingStore(s => s.setField);

  const onEmail = useCallback(() => {
    setField('signupMethod', 'email');
    navigation.navigate('EmailEntry');
  }, [navigation, setField]);

  const onPhone = useCallback(() => {
    setField('signupMethod', 'phone');
    navigation.navigate('PhoneEntry');
  }, [navigation, setField]);

  const onGoogle = useCallback(() => {
    setField('signupMethod', 'google');
    Alert.alert('Google sign-in', en.comingSoon.google);
  }, [setField]);

  const onApple = useCallback(() => {
    setField('signupMethod', 'apple');
    Alert.alert('Apple sign-in', en.comingSoon.apple);
  }, [setField]);

  return (
    <SignupMethodScreen
      onEmail={onEmail}
      onPhone={onPhone}
      onGoogle={onGoogle}
      onApple={onApple}
      onBack={() => navigation.goBack()}
      onLogIn={() => navigation.navigate('Login')}
    />
  );
}
