import React, {useCallback} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {AgentApplicationsListScreen} from './AgentApplicationsListScreen';
import {getPartnerApplications} from '../../../../api/partnerApi';
import type {AgentApplicationsStackList} from '../../../../navigation/AgentApplicationsStackNavigator';

export function AgentApplicationsListContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentApplicationsStackList>>();
  const route = useRoute<RouteProp<AgentApplicationsStackList, 'ApplicationsList'>>();
  const filter = route.params?.filter ?? 'all';

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'applications', 'list', filter],
    queryFn: () =>
      getPartnerApplications({
        filter: filter === 'needs_action' ? 'needs_action' : 'all',
        page: 1,
        limit: 50,
      }),
    staleTime: 60 * 1000,
  });

  const items =
    filter === 'needs_action' ? (data?.needsAction ?? []) : (data?.applications ?? []);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onApplicationPress = useCallback(
    (applicationId: string) => {
      navigation.navigate('ApplicationDetail', {applicationId});
    },
    [navigation],
  );

  return (
    <AgentApplicationsListScreen
      filter={filter}
      items={items}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onBack={onBack}
      onApplicationPress={onApplicationPress}
    />
  );
}
