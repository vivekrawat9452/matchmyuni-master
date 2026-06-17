import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentApplicationsOverviewScreen} from './AgentApplicationsOverviewScreen';
import {getPartnerApplications} from '../../../../api/partnerApi';
import type {AgentApplicationsStackList} from '../../../../navigation/AgentApplicationsStackNavigator';

export function AgentApplicationsOverviewContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentApplicationsStackList>>();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'applications', 'overview'],
    queryFn: () => getPartnerApplications({filter: 'all', page: 1, limit: 5}),
    staleTime: 60 * 1000,
  });

  const onViewShortlist = useCallback(() => {
    navigation.navigate('ApplicationsShortlist');
  }, [navigation]);

  const onSeeAllApplications = useCallback(() => {
    navigation.navigate('ApplicationsList', {filter: 'all'});
  }, [navigation]);

  const onSeeNeedsAction = useCallback(() => {
    navigation.navigate('ApplicationsList', {filter: 'needs_action'});
  }, [navigation]);

  const onApplicationPress = useCallback(
    (applicationId: string) => {
      navigation.navigate('ApplicationDetail', {applicationId});
    },
    [navigation],
  );

  return (
    <AgentApplicationsOverviewScreen
      data={data}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onViewShortlist={onViewShortlist}
      onSeeAllApplications={onSeeAllApplications}
      onSeeNeedsAction={onSeeNeedsAction}
      onApplicationPress={onApplicationPress}
    />
  );
}
