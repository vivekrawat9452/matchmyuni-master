import React, {useCallback} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {TrackApplicationStatusScreen} from './TrackApplicationStatusScreen';
import {getApplicationsByIds} from '../../../api/userApi';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

type Props = NativeStackScreenProps<AppStackList, 'TrackApplicationStatus'>;

export function TrackApplicationStatusContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const {applicationId} = route.params;

  const {data, isLoading, isError} = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplicationsByIds([applicationId]),
    staleTime: 2 * 60 * 1000,
    select: rows => rows[0],
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <TrackApplicationStatusScreen
      detail={data}
      loading={isLoading}
      loadFailed={isError}
      onBack={onBack}
    />
  );
}
