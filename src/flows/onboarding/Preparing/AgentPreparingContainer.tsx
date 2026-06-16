import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {LinearGradient} from 'react-native-linear-gradient';
import {postSignup} from '../../../api/authApi';
import {getApiErrorMessage} from '../../../api/client';
import {useAuthStore} from '../../../stores/authStore';
import {useOnboardingStore} from '../../../stores/onboardingStore';
import {en} from '../../../utils/strings/en';
import {colors} from '../../../utils/colors';
import {font, hp, space, hPad} from '../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function AgentPreparingContainer() {
  const navigation = useNavigation();
  const setSession = useAuthStore(s => s.setSession);
  const resetOnboarding = useOnboardingStore(s => s.reset);
  const [msg, setMsg] = useState<string | undefined>('Setting up your account…');
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

        const {user, session} = await postSignup({
          email: draft.email,
          firstName: draft.firstName,
          lastName: draft.lastName,
          country: draft.countryName,
          countryCode: draft.countryCode,
          contact: draft.contact,
          password: draft.password,
        });

        await setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          user,
        });

        resetOnboarding();
        setMsg(undefined);
        // AppRoot detects accessToken → auto-navigates to MainAppNavigator
      } catch (e) {
        handleError(e);
        console.log('error_009', e);

      }
    })();
  }, [handleError, resetOnboarding, setSession]);

  return <AgentPreparingScreen message={msg} />;
}

function AgentPreparingScreen({message}: {message?: string}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#67BAA0', '#4E9A84', '#3A7A68']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={[styles.top, {paddingTop: insets.top + hp(4)}]}>
        <Text style={styles.h}>{en.agentPreparing.headline}</Text>
        <Text style={styles.s}>{en.agentPreparing.sub}</Text>
      </LinearGradient>
      <View style={styles.bottom}>
        <ActivityIndicator size="large" color={colors.agentMint} />
        {message ? <Text style={styles.m}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.white},
  top: {
    minHeight: hp(50),
    paddingHorizontal: hPad(6),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  h: {
    color: colors.white,
    fontSize: font.hero,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: space.lg,
  },
  s: {
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontSize: font.subtitle,
    marginTop: 10,
  },
  bottom: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  m: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: font.caption,
  },
});
