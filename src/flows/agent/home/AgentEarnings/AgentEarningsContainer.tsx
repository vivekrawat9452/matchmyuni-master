import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentEarningsScreen} from './AgentEarningsScreen';
import {getPartnerApplications, getPartnerDashboard} from '../../../../api/partnerApi';
import type {AgentHomeStackList} from '../../../../navigation/AgentHomeStackNavigator';

export function AgentEarningsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentHomeStackList>>();

  const dashboardQuery = useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: getPartnerDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const applicationsQuery = useQuery({
    queryKey: ['partner', 'applications', 'earnings'],
    queryFn: () => getPartnerApplications({filter: 'all', page: 1, limit: 50}),
    staleTime: 2 * 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onRefresh = useCallback(() => {
    void dashboardQuery.refetch();
    void applicationsQuery.refetch();
  }, [dashboardQuery, applicationsQuery]);

  const onApplicationPress = useCallback(
    (applicationId: string) => {
      navigation.getParent()?.navigate('MyStudentsTab', {
        screen: 'StudentApplication',
        params: {applicationId},
      });
    },
    [navigation],
  );

  const apps = applicationsQuery.data;
  const allApps = [...(apps?.needsAction ?? []), ...(apps?.applications ?? [])];

  return (
    <AgentEarningsScreen
      earnings={dashboardQuery.data?.earnings}
      applications={allApps}
      loading={dashboardQuery.isLoading || applicationsQuery.isLoading}
      refreshing={dashboardQuery.isRefetching || applicationsQuery.isRefetching}
      onRefresh={onRefresh}
      onBack={onBack}
      onApplicationPress={onApplicationPress}
    />
  );
}
