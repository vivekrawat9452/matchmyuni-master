/**
 * ProfileStackNavigator — nested stack inside the Profile tab.
 *
 * Screens (Figma file pHnQspQkvUJvE9TyiQN5Zv):
 *   ProfileMain          620:894   My Profile tab
 *   EditProfile          645:4938  Edit profile
 *   StudyPreferences     680:11309 Study preferences overlay
 *   ProfileNotifications 644:2248  Notification settings
 *   ProfileAbout         683:11934 About (WebView)
 *   ProfileAccount       683:12385 Account & security (placeholder)
 *   ProfileHelp          683:12692 Help & support (WebView)
 */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileContainer} from '../flows/main/Profile/ProfileContainer';
import {EditProfileContainer} from '../flows/main/Profile/EditProfileContainer';
import {StudyPreferencesContainer} from '../flows/main/Profile/StudyPreferencesContainer';
import {ProfileNotificationsContainer} from '../flows/main/Profile/ProfileNotificationsContainer';
import {ProfileWebViewScreen} from '../flows/main/Profile/ProfileWebViewScreen';
import {ProfileAccountScreen} from '../flows/main/Profile/ProfileAccountScreen';

export type ProfileStackList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  StudyPreferences: undefined;
  ProfileNotifications: undefined;
  ProfileAbout: undefined;
  ProfileAccount: undefined;
  ProfileHelp: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ProfileMain" component={ProfileContainer} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="StudyPreferences"
        component={StudyPreferencesContainer}
        options={{animation: 'slide_from_bottom', presentation: 'modal'}}
      />
      <Stack.Screen
        name="ProfileNotifications"
        component={ProfileNotificationsContainer}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ProfileAbout"
        component={ProfileWebViewScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ProfileAccount"
        component={ProfileAccountScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ProfileHelp"
        component={ProfileWebViewScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
