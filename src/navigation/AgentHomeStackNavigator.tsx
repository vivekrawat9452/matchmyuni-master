import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AgentDashboardContainer} from '../flows/agent/home/AgentDashboard/AgentDashboardContainer';
import {AgentNotificationsContainer} from '../flows/agent/home/AgentNotifications/AgentNotificationsContainer';
import {AgentMilestonesContainer} from '../flows/agent/home/AgentMilestones/AgentMilestonesContainer';
import {AgentEarningsContainer} from '../flows/agent/home/AgentEarnings/AgentEarningsContainer';

export type AgentHomeStackList = {
  AgentDashboard: undefined;
  AgentNotifications: undefined;
  AgentMilestones: undefined;
  AgentEarnings: undefined;
};

const Stack = createNativeStackNavigator<AgentHomeStackList>();

export function AgentHomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AgentDashboard" component={AgentDashboardContainer} />
      <Stack.Screen
        name="AgentNotifications"
        component={AgentNotificationsContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AgentMilestones"
        component={AgentMilestonesContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AgentEarnings"
        component={AgentEarningsContainer}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
