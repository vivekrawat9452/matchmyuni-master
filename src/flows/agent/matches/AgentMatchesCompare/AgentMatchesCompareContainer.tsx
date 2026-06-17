import React, {useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {AgentMatchesCompareScreen} from './AgentMatchesCompareScreen';
import {getPartnerStudentRecommendations} from '../../../../api/partnerApi';
import type {AgentMatchesStackList} from '../../../../navigation/AgentMatchesStackNavigator';

export function AgentMatchesCompareContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentMatchesStackList>>();
  const route = useRoute<RouteProp<AgentMatchesStackList, 'MatchesCompare'>>();
  const {userId, courseIds} = route.params;

  const {data, isLoading} = useQuery({
    queryKey: ['partner', 'student', userId, 'recommendations', 'compare'],
    queryFn: () => getPartnerStudentRecommendations(userId, {page: 1, limit: 50}),
    staleTime: 60 * 1000,
  });

  const courses = useMemo(() => {
    const map = new Map((data?.courses ?? []).map(c => [c.courseId, c]));
    return courseIds.map(id => map.get(id)).filter(Boolean);
  }, [courseIds, data?.courses]);

  return (
    <AgentMatchesCompareScreen
      courses={courses}
      loading={isLoading}
      onBack={() => navigation.goBack()}
      onShortlist={(courseId, courseName, matchScore) => {
        navigation.navigate('MatchesShortlist', {userId, courseId, courseName, matchScore});
      }}
    />
  );
}
