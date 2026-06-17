import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgentAccountSecurityScreen} from './AgentAccountSecurityScreen';
import {getPartnerMe} from '../../../../api/partnerApi';
import {useQuery} from '@tanstack/react-query';
import type {AgentProfileStackList} from '../../../../navigation/AgentProfileStackNavigator';

export function AgentAccountSecurityContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentProfileStackList>>();

  const {data} = useQuery({
    queryKey: ['partner', 'me'],
    queryFn: getPartnerMe,
    staleTime: 60 * 1000,
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AgentAccountSecurityScreen
      email={data?.email ?? ''}
      organization={data?.organization ?? ''}
      country={data?.country ?? ''}
      onBack={onBack}
    />
  );
}
