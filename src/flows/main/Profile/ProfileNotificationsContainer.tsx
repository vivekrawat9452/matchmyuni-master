import React, {useCallback, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProfileNotificationsScreen,
  type NotificationSection,
} from './ProfileNotificationsScreen';
import type {ProfileStackList} from '../../../navigation/ProfileStackNavigator';

type Nav = NativeStackNavigationProp<ProfileStackList, 'ProfileNotifications'>;

const STORAGE_KEY = 'profile_notification_prefs_v1';

const SECTIONS: NotificationSection[] = [
  {
    id: 'apps',
    title: 'Applications & Deadlines',
    items: [
      {id: 'status_updates', title: 'Status updates', subtitle: 'Lorem ipsum dolor sit amet'},
      {id: 'deadline_reminders', title: 'Deadline reminders', subtitle: 'Lorem ipsum dolor sit amet'},
      {id: 'document_reminders', title: 'Document submission reminders', subtitle: 'Lorem ipsum dolor sit amet'},
      {id: 'offer_updates', title: 'Offer letter updates', subtitle: 'Lorem ipsum dolor sit amet'},
    ],
  },
  {
    id: 'matches',
    title: 'University Matches',
    items: [
      {id: 'new_matches', title: 'New university matches', subtitle: 'Lorem ipsum dolor sit amet'},
      {id: 'recommended', title: 'Recommended universities', subtitle: 'Lorem ipsum dolor sit amet'},
      {id: 'course_recs', title: 'Course recommendations', subtitle: 'Lorem ipsum dolor sit amet'},
    ],
  },
  {
    id: 'scholarships',
    title: 'Scholarships & Offers',
    items: [
      {id: 'scholarship', title: 'Scholarship opportunities', subtitle: 'Lorem ipsum dolor sit amet'},
    ],
  },
  {
    id: 'channels',
    title: 'Notification Channels',
    items: [
      {id: 'push', title: 'Push Notifications', subtitle: 'Lorem ipsum dolor sit amet'},
    ],
  },
];

const DEFAULT_TOGGLES = Object.fromEntries(
  SECTIONS.flatMap(s => s.items.map(i => [i.id, true])),
);

export function ProfileNotificationsContainer() {
  const navigation = useNavigation<Nav>();
  const [toggles, setToggles] = useState<Record<string, boolean>>(DEFAULT_TOGGLES);

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          setToggles({...DEFAULT_TOGGLES, ...JSON.parse(raw)});
        } catch {
          /* keep defaults */
        }
      }
    });
  }, []);

  const onToggle = useCallback((id: string, value: boolean) => {
    setToggles(prev => {
      const next = {...prev, [id]: value};
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ProfileNotificationsScreen
      sections={SECTIONS}
      toggles={toggles}
      onToggle={onToggle}
      onBack={() => navigation.goBack()}
    />
  );
}
