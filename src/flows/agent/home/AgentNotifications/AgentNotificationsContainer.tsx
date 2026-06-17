import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentNotificationsScreen} from './AgentNotificationsScreen';
import {getNotifications} from '../../../../api/notificationsApi';
import type {NotificationDto} from '../../../../api/notificationsApi';
import type {AgentHomeStackList} from '../../../../navigation/AgentHomeStackNavigator';

export function AgentNotificationsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentHomeStackList>>();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onNotificationPress = useCallback(
    (notification: NotificationDto) => {
      if (notification.applicationId) {
        navigation.getParent()?.navigate('MyStudentsTab', {
          screen: 'StudentApplication',
          params: {applicationId: notification.applicationId},
        });
      }
    },
    [navigation],
  );

  return (
    <AgentNotificationsScreen
      notifications={data ?? undefined}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onBack={onBack}
      onNotificationPress={onNotificationPress}
    />
  );
}
