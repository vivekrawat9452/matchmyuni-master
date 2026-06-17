/**
 * AgentAppStackNavigator — post-login agent app shell.
 */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AgentMainNavigator} from './AgentMainNavigator';

export type AgentAppStackList = {
  AgentTabs: undefined;
};

const Stack = createNativeStackNavigator<AgentAppStackList>();

export function AgentAppStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AgentTabs" component={AgentMainNavigator} />
    </Stack.Navigator>
  );
}
