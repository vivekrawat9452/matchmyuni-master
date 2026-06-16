import React, {useEffect, useMemo, useState} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '../stores/authStore';
import {useAuthHydrated} from '../hooks/useAuthHydrated';
import {AuthNavigator} from './AuthNavigator';
import {AppStackNavigator} from './AppStackNavigator';
import {BrandSplashScreen} from '../flows/entry/BrandSplash/BrandSplashScreen';
import {GlobalLoader} from '../components/GlobalLoader';
import {ErrorBoundary} from '../components/ErrorBoundary';
import {colors} from '../utils/colors';

/** Minimum time (ms) the splash is guaranteed to be visible. */
const SPLASH_MIN_MS = 1500;

type RootP = {Auth: undefined; App: undefined};

const Stack = createNativeStackNavigator<RootP>();

export function AppRoot() {
  const hydrated = useAuthHydrated();
  const accessToken = useAuthStore(s => s.accessToken);

  // Tracks whether the 1.5 s minimum display window has elapsed.
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.background,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
      },
    }),
    [],
  );

  // Keep the splash visible until BOTH conditions are satisfied:
  //   1. Zustand has finished rehydrating from AsyncStorage
  //   2. At least 1.5 s have elapsed (so the splash is actually seen)
  if (!hydrated || !minDelayDone) {
    return <BrandSplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <ErrorBoundary>
        <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
          {accessToken ? (
            <Stack.Screen name="App" component={AppStackNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </ErrorBoundary>
      {/* Global overlay loader — sits above all screens */}
      <GlobalLoader />
    </NavigationContainer>
  );
}
