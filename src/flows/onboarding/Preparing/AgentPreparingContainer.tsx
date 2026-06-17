import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {postSignup} from '../../../api/authApi';
import {getApiErrorMessage} from '../../../api/client';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {en} from '../../../utils/strings/en';
import {colors} from '../../../utils/colors';
import {font, hp, space, hPad} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {AuthStackParamList} from '../../../navigation/authTypes';

export function AgentPreparingContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'AgentPreparing'>>();
  const resetOnboarding = useOnboardingStore(s => s.reset);
  const [msg, setMsg] = useState<string | undefined>('Submitting your request…');
  const ran = useRef(false);

  const handleError = useCallback(
    (e: unknown) => {
      const m = getApiErrorMessage(e, en.errors.generic);
      Alert.alert('Sign up', m, [
        {
          text: 'OK',
          onPress: () => {
            ran.current = false;
            navigation.dispatch(CommonActions.goBack());
          },
        },
      ]);
    },
    [navigation],
  );

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;

    (async () => {
      try {
        setMsg('Creating your account…');
        const draft = useOnboardingStore.getState();

        await postSignup({
          email: draft.email,
          firstName: draft.firstName,
          lastName: draft.lastName,
          country: draft.countryName,
          countryCode: draft.countryCode,
          contact: draft.contact,
          password: draft.password,
        });

        resetOnboarding();
        setMsg(undefined);
        navigation.reset({
          index: 0,
          routes: [{name: 'AgentQueue'}],
        });
      } catch (e) {
        handleError(e);
        console.log('error_009', e);
      }
    })();
  }, [handleError, navigation, resetOnboarding]);

  return <AgentPreparingScreen message={msg} />;
}

function AgentPreparingScreen({message}: {message?: string}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.flex}>
      <View style={[styles.center, {paddingTop: insets.top + hp(20)}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? <Text style={styles.m}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, alignItems: 'center', padding: 32},
  m: {
    marginTop: space.lg,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: font.caption,
  },
});
