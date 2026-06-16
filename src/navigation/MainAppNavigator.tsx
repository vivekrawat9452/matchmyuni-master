/**
 * MainAppNavigator — 5-tab bottom navigation.
 *
 * Tabs (Figma node 402:4486 / home5.png):
 *   1. Home        — house icon
 *   2. Discover    — compass icon
 *   3. Application — file-text icon
 *   4. Message     — message-circle icon
 *   5. Profile     — user icon
 */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeDashboardContainer} from '../flows/home/HomeDashboard/HomeDashboardContainer';
import {DiscoverContainer} from '../flows/main/Discover/DiscoverContainer';
import {ApplicationsContainer} from '../flows/main/Applications/ApplicationsContainer';
import {MessagesContainer} from '../flows/main/Messages/MessagesContainer';
import {ProfileStackNavigator} from './ProfileStackNavigator';
import {
  TabHomeIcon,
  TabDiscoverIcon,
  TabApplicationIcon,
  TabMessageIcon,
  TabProfileIcon,
} from '../components/icons/TabIcons';
import {colors} from '../utils/colors';

export type TabList = {
  Home: undefined;
  DiscoverTab: undefined;
  ApplicationTab: undefined;
  MessageTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabList>();

const tabBarStyle = {
  backgroundColor: colors.white,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  height: 64,
  paddingBottom: 8,
  paddingTop: 8,
};

export function MainAppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.navy,
        tabBarStyle,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '500'},
      }}>
      <Tab.Screen
        name="Home"
        component={HomeDashboardContainer}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({size, focused}) => (
            <TabHomeIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverContainer}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({size, focused}) => (
            <TabDiscoverIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ApplicationTab"
        component={ApplicationsContainer}
        options={{
          tabBarLabel: 'Application',
          tabBarIcon: ({size, focused}) => (
            <TabApplicationIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MessageTab"
        component={MessagesContainer}
        options={{
          tabBarLabel: 'Message',
          tabBarIcon: ({size, focused}) => (
            <TabMessageIcon size={size ?? 22} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({size, color}) => (
            <TabProfileIcon size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
