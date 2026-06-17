import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AgentMatchesContainer} from '../flows/agent/matches/AgentMatches/AgentMatchesContainer';
import {AgentMatchesCompareContainer} from '../flows/agent/matches/AgentMatchesCompare/AgentMatchesCompareContainer';
import {AgentMatchesShortlistContainer} from '../flows/agent/matches/AgentMatchesShortlist/AgentMatchesShortlistContainer';

export type AgentMatchesStackList = {
  MatchesHome: undefined;
  MatchesCompare: {
    userId: string;
    courseIds: [string, string];
  };
  MatchesShortlist: {
    userId: string;
    courseId: string;
    courseName: string;
    matchScore?: number;
  };
};

const Stack = createNativeStackNavigator<AgentMatchesStackList>();

export function AgentMatchesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MatchesHome" component={AgentMatchesContainer} />
      <Stack.Screen
        name="MatchesCompare"
        component={AgentMatchesCompareContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="MatchesShortlist"
        component={AgentMatchesShortlistContainer}
        options={{animation: 'slide_from_bottom'}}
      />
    </Stack.Navigator>
  );
}
