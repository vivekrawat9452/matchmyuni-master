import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AgentMatchesShortlistScreen} from './AgentMatchesShortlistScreen';
import {addPartnerStudentShortlist} from '../../../../api/partnerApi';
import {getApiErrorMessage} from '../../../../api/client';
import type {AgentMatchesStackList} from '../../../../navigation/AgentMatchesStackNavigator';

export function AgentMatchesShortlistContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentMatchesStackList>>();
  const route = useRoute<RouteProp<AgentMatchesStackList, 'MatchesShortlist'>>();
  const {userId, courseId, courseName, matchScore} = route.params;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addPartnerStudentShortlist(userId, {courseId, matchScore}),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['partner', 'student', userId, 'recommendations'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['partner', 'student', userId, 'shortlist'],
      });
      Alert.alert('Shortlisted', `${courseName} added to shortlist.`, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    },
    onError: (e: unknown) => {
      Alert.alert('Shortlist', getApiErrorMessage(e, 'Could not add to shortlist.'));
    },
  });

  const onConfirm = useCallback(() => mutation.mutate(), [mutation]);
  const onCancel = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AgentMatchesShortlistScreen
      courseName={courseName}
      matchScore={matchScore}
      loading={mutation.isPending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
