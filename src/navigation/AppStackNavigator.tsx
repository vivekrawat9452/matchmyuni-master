/**
 * AppStackNavigator — sits between AppRoot and the bottom tabs.
 *
 * Screen graph:
 *   SignupTutorial    (first-time student post-signup — Figma 645:3705…3349)
 *   Tabs              (MainAppNavigator — bottom tab bar)
 *   CourseDetails     (full-screen, slide from right)
 *   StartApplication  (full-screen, slide from bottom, modal-style)
 */
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainAppNavigator} from './MainAppNavigator';
import {CourseDetailsContainer} from '../flows/main/CourseDetails/CourseDetailsContainer';
import {StartApplicationContainer} from '../flows/main/StartApplication/StartApplicationContainer';
import {ApplicationSubmittedContainer} from '../flows/main/ApplicationSubmitted/ApplicationSubmittedContainer';
import {ApplicationPaymentContainer} from '../flows/main/ApplicationPayment/ApplicationPaymentContainer';
import {TrackApplicationStatusContainer} from '../flows/main/TrackApplicationStatus/TrackApplicationStatusContainer';
import {SignupTutorialContainer} from '../flows/tutorial/SignupTutorialContainer';
import {SIGNUP_TUTORIAL_PENDING_KEY} from '../flows/tutorial/tutorialConstants';
import {colors} from '../utils/colors';

export type AppStackList = {
  /** Post-signup discover tutorial (first signup only) */
  SignupTutorial: undefined;
  /** Bottom tab navigator */
  Tabs: undefined;
  /** Course detail — opened from Discover card or Home top-matches */
  CourseDetails: {courseId: number; matchPct?: number; courseData?: string};
  /** Application start wizard — opened from CourseDetails */
  StartApplication: {
    courseId: number;
    courseName: string;
    universityName?: string;
    matchPct?: number;
    courseData?: string;
  };
  /** Placeholder payment step when application fee > 0 */
  ApplicationPayment: {
    applicationId: string;
    courseId: number;
    courseName: string;
    universityName?: string;
    applicationFee: number;
    currencySymbol?: string;
  };
  /** Success screen after free application or payment placeholder */
  ApplicationSubmitted: {
    applicationId?: string;
    courseName: string;
    universityName?: string;
  };
  /** Track status — Figma 593:846, from Applied tab */
  TrackApplicationStatus: {
    applicationId: string;
    courseName: string;
    universityName?: string;
    courseData?: string;
  };
};

const Stack = createNativeStackNavigator<AppStackList>();

export function AppStackNavigator() {
  const [initialRoute, setInitialRoute] = useState<
    keyof AppStackList | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pending = await AsyncStorage.getItem(SIGNUP_TUTORIAL_PENDING_KEY);
      if (!cancelled) {
        setInitialRoute(pending === '1' ? 'SignupTutorial' : 'Tabs');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="SignupTutorial"
        component={SignupTutorialContainer}
        options={{gestureEnabled: false, animation: 'fade'}}
      />
      <Stack.Screen name="Tabs" component={MainAppNavigator} />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="StartApplication"
        component={StartApplicationContainer}
        options={{animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="ApplicationPayment"
        component={ApplicationPaymentContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ApplicationSubmitted"
        component={ApplicationSubmittedContainer}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen
        name="TrackApplicationStatus"
        component={TrackApplicationStatusContainer}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
