import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RoleSelectScreen} from './RoleSelectScreen';
import {useAuthStore} from '../../../stores/authStore';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function RoleSelectContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>>();
  const setRole = useAuthStore(s => s.setRole);

  const onSelect = useCallback(
    (r: 'student' | 'agent') => {
      setRole(r);
      navigation.navigate('SignupMethod');
    },
    [navigation, setRole],
  );

  return (
    <RoleSelectScreen
      onSelect={onSelect}
      onBack={() => navigation.goBack()}
      onFooterLink={() => navigation.navigate('Login')}
    />
  );
}
