import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentDashboardScreen} from './AgentDashboardScreen';
import {getPartnerDashboard} from '../../../../api/partnerApi';
import type {AgentHomeStackList} from '../../../../navigation/AgentHomeStackNavigator';

export function AgentDashboardContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentHomeStackList>>();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: getPartnerDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onBell = useCallback(() => {
    navigation.navigate('AgentNotifications');
  }, [navigation]);

  const onMilestones = useCallback(() => {
    navigation.navigate('AgentMilestones');
  }, [navigation]);

  const onActionPress = useCallback(
    (applicationId: string) => {
      navigation.getParent()?.navigate('ApplicationsTab', {
        screen: 'ApplicationDetail',
        params: {applicationId},
      });
    },
    [navigation],
  );

  const onAddStudent = useCallback(() => {
    navigation.getParent()?.navigate('MyStudentsTab', {screen: 'AddStudent'});
  }, [navigation]);

  const onEarnings = useCallback(() => {
    navigation.navigate('AgentEarnings');
  }, [navigation]);

  const onPipelineSeeAll = useCallback(() => {
    navigation.getParent()?.navigate('ApplicationsTab');
  }, [navigation]);

  const onExploreCourses = useCallback(() => {
    navigation.getParent()?.navigate('MatchesTab');
  }, [navigation]);

  return (
    <AgentDashboardScreen
      dashboard={data}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={onRefresh}
      onBell={onBell}
      onMilestones={onMilestones}
      onEarnings={onEarnings}
      onAddStudent={onAddStudent}
      onExploreCourses={onExploreCourses}
      onActionPress={onActionPress}
      onPipelineSeeAll={onPipelineSeeAll}
    />
  );
}
