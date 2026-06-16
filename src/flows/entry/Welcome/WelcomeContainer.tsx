import React from 'react';
import {Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {WelcomeScreen} from './WelcomeScreen';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function WelcomeContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();

  return (
    <WelcomeScreen
      onGetStarted={() => navigation.navigate('RoleSelect')}
      onLogIn={() => navigation.navigate('Login')}
      onOpenTerms={() => {
        void Linking.openURL('https://matchmyuni.com/terms').catch(() =>
          Alert.alert('Unable to open link'),
        );
      }}
      onOpenPrivacy={() => {
        void Linking.openURL('https://matchmyuni.com/privacy').catch(() =>
          Alert.alert('Unable to open link'),
        );
      }}
    />
  );
}
