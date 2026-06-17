import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AgentProfileContainer} from '../flows/agent/profile/AgentProfile/AgentProfileContainer';
import {AgentProfileNotificationsContainer} from '../flows/agent/profile/AgentProfileNotifications/AgentProfileNotificationsContainer';
import {AgentAccountSecurityContainer} from '../flows/agent/profile/AgentAccountSecurity/AgentAccountSecurityContainer';

export type AgentProfileStackList = {
  ProfileHome: undefined;
  ProfileNotifications: undefined;
  AccountSecurity: undefined;
};

const Stack = createNativeStackNavigator<AgentProfileStackList>();

export function AgentProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProfileHome" component={AgentProfileContainer} />
      <Stack.Screen
        name="ProfileNotifications"
        component={AgentProfileNotificationsContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AccountSecurity"
        component={AgentAccountSecurityContainer}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
