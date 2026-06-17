import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentNotificationsScreen} from '../../home/AgentNotifications/AgentNotificationsScreen';
import {getNotifications} from '../../../../api/notificationsApi';
import type {AgentProfileStackList} from '../../../../navigation/AgentProfileStackNavigator';

export function AgentProfileNotificationsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentProfileStackList>>();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AgentNotificationsScreen
      notifications={data ?? undefined}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onBack={onBack}
      onNotificationPress={() => {}}
    />
  );
}
