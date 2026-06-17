import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentMilestonesScreen} from './AgentMilestonesScreen';
import {getPartnerMilestones} from '../../../../api/partnerApi';
import type {AgentHomeStackList} from '../../../../navigation/AgentHomeStackNavigator';

export function AgentMilestonesContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentHomeStackList>>();

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['partner', 'milestones'],
    queryFn: getPartnerMilestones,
    staleTime: 2 * 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onEarnings = useCallback(() => {
    navigation.navigate('AgentEarnings');
  }, [navigation]);

  return (
    <AgentMilestonesScreen
      milestones={data ?? []}
      loading={isLoading}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      onBack={onBack}
      onEarnings={onEarnings}
    />
  );
}
