import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {AuthStackParamList} from './authTypes';
import {WelcomeContainer} from '../flows/entry/Welcome/WelcomeContainer';
import {LoginContainer} from '../flows/auth/Login/LoginContainer';
import {ForgotPasswordContainer} from '../flows/auth/ForgotPassword/ForgotPasswordContainer';
import {ResetPasswordContainer} from '../flows/auth/ResetPassword/ResetPasswordContainer';
import {RoleSelectContainer} from '../flows/onboarding/RoleSelect/RoleSelectContainer';
import {SignupMethodContainer} from '../flows/onboarding/SignupMethod/SignupMethodContainer';
import {PhoneEntryContainer} from '../flows/onboarding/PhoneEntry/PhoneEntryContainer';
import {EmailEntryContainer} from '../flows/onboarding/EmailEntry/EmailEntryContainer';
import {PasswordCreateContainer} from '../flows/onboarding/PasswordCreate/PasswordCreateContainer';
import {AccountDetailsContainer} from '../flows/onboarding/AccountDetails/AccountDetailsContainer';
import {StudyInterestsContainer} from '../flows/onboarding/StudyInterests/StudyInterestsContainer';
import {LocationSelectContainer} from '../flows/onboarding/LocationSelect/LocationSelectContainer';
import {StartTimelineContainer} from '../flows/onboarding/StartTimeline/StartTimelineContainer';
import {BudgetSelectContainer} from '../flows/onboarding/BudgetSelect/BudgetSelectContainer';
import {PreparingContainer} from '../flows/onboarding/Preparing/PreparingContainer';
import {AgentPreparingContainer} from '../flows/onboarding/Preparing/AgentPreparingContainer';
import {AgentPersonalDetailsContainer} from '../flows/onboarding/AgentPersonalDetails/AgentPersonalDetailsContainer';
import {AgentCountrySelectContainer} from '../flows/onboarding/AgentCountrySelect/AgentCountrySelectContainer';
import {AgentQueueContainer} from '../flows/onboarding/AgentQueue/AgentQueueContainer';
import {BrandSplashContainer} from '../flows/entry/BrandSplash/BrandSplashContainer';

import {colors} from '../utils/colors';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const anim = {animation: 'slide_from_right' as const, gestureEnabled: true};

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        ...anim,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen name="Welcome" component={WelcomeContainer} />
      <Stack.Screen name="Login" component={LoginContainer} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordContainer} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordContainer} />
      <Stack.Screen name="RoleSelect" component={RoleSelectContainer} />
      <Stack.Screen name="SignupMethod" component={SignupMethodContainer} />
      <Stack.Screen name="PhoneEntry" component={PhoneEntryContainer} />
      <Stack.Screen name="EmailEntry" component={EmailEntryContainer} />
      <Stack.Screen name="PasswordCreate" component={PasswordCreateContainer} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsContainer} />
      <Stack.Screen name="AgentPersonalDetails" component={AgentPersonalDetailsContainer} />
      <Stack.Screen name="AgentCountrySelect" component={AgentCountrySelectContainer} />
      <Stack.Screen name="StudyInterests" component={StudyInterestsContainer} />
      <Stack.Screen name="LocationSelect" component={LocationSelectContainer} />
      <Stack.Screen name="StartTimeline" component={StartTimelineContainer} />
      <Stack.Screen name="BudgetSelect" component={BudgetSelectContainer} />
      <Stack.Screen name="Preparing" component={PreparingContainer} options={{...anim, gestureEnabled: false}} />
      <Stack.Screen name="AgentPreparing" component={AgentPreparingContainer} options={{...anim, gestureEnabled: false}} />
      <Stack.Screen name="AgentQueue" component={AgentQueueContainer} options={{...anim, gestureEnabled: false}} />
      <Stack.Screen name="BrandSplash" component={BrandSplashContainer} options={{...anim, gestureEnabled: false}} />
    </Stack.Navigator>
  );
}
