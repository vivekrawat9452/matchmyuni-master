import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AgentApplicationsOverviewContainer} from '../flows/agent/applications/AgentApplicationsOverview/AgentApplicationsOverviewContainer';
import {AgentApplicationsShortlistContainer} from '../flows/agent/applications/AgentApplicationsShortlist/AgentApplicationsShortlistContainer';
import {AgentApplicationsListContainer} from '../flows/agent/applications/AgentApplicationsList/AgentApplicationsListContainer';
import {AgentApplicationDetailContainer} from '../flows/agent/applications/AgentApplicationDetail/AgentApplicationDetailContainer';

export type AgentApplicationsStackList = {
  ApplicationsOverview: undefined;
  ApplicationsShortlist: undefined;
  ApplicationsList: {filter?: 'all' | 'needs_action'};
  ApplicationDetail: {applicationId: string};
};

const Stack = createNativeStackNavigator<AgentApplicationsStackList>();

export function AgentApplicationsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="ApplicationsOverview"
        component={AgentApplicationsOverviewContainer}
      />
      <Stack.Screen
        name="ApplicationsShortlist"
        component={AgentApplicationsShortlistContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ApplicationsList"
        component={AgentApplicationsListContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ApplicationDetail"
        component={AgentApplicationDetailContainer}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
