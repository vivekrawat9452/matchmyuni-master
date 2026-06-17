/**
 * AgentMainNavigator — 5-tab bottom navigation.
 * Home, My Students, Applications, Matches, Profile.
 */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AgentHomeStackNavigator} from './AgentHomeStackNavigator';
import {AgentStudentsStackNavigator} from './AgentStudentsStackNavigator';
import {AgentApplicationsStackNavigator} from './AgentApplicationsStackNavigator';
import {AgentMatchesStackNavigator} from './AgentMatchesStackNavigator';
import {AgentProfileStackNavigator} from './AgentProfileStackNavigator';
import {
  AgentTabApplicationsIcon,
  AgentTabHomeIcon,
  AgentTabMatchesIcon,
  AgentTabProfileIcon,
  AgentTabStudentsIcon,
} from '../components/icons/AgentTabIcons';
import {colors} from '../utils/colors';

export type AgentTabList = {
  HomeTab: undefined;
  MyStudentsTab: undefined;
  ApplicationsTab: undefined;
  MatchesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AgentTabList>();

const tabBarStyle = {
  backgroundColor: colors.white,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  height: 64,
  paddingBottom: 8,
  paddingTop: 8,
};

export function AgentMainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.navy,
        tabBarStyle,
        tabBarLabelStyle: {fontSize: 10, fontWeight: '500'},
      }}>
      <Tab.Screen
        name="HomeTab"
        component={AgentHomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({size, focused}) => (
            <AgentTabHomeIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyStudentsTab"
        component={AgentStudentsStackNavigator}
        options={{
          tabBarLabel: 'Students',
          tabBarIcon: ({size, focused}) => (
            <AgentTabStudentsIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ApplicationsTab"
        component={AgentApplicationsStackNavigator}
        options={{
          tabBarLabel: 'Applications',
          tabBarIcon: ({size, focused}) => (
            <AgentTabApplicationsIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={AgentMatchesStackNavigator}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({size, focused}) => (
            <AgentTabMatchesIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={AgentProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({size, focused}) => (
            <AgentTabProfileIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
