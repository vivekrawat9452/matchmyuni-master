import React, {useCallback, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {AgentMatchesScreen} from './AgentMatchesScreen';
import {
  getPartnerStudentRecommendations,
  getPartnerStudents,
} from '../../../../api/partnerApi';
import type {AgentMatchesStackList} from '../../../../navigation/AgentMatchesStackNavigator';

export type MatchesFilterState = {
  country: string | null;
  minScore: number;
  sortBy: 'match' | 'fees';
};

const DEFAULT_FILTER: MatchesFilterState = {
  country: null,
  minScore: 0,
  sortBy: 'match',
};

export function AgentMatchesContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AgentMatchesStackList>>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MatchesFilterState>(DEFAULT_FILTER);
  const [filterVisible, setFilterVisible] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const studentsQuery = useQuery({
    queryKey: ['partner', 'students', 'matches-picker'],
    queryFn: () => getPartnerStudents({page: 1, limit: 50}),
    staleTime: 60 * 1000,
  });

  const students = studentsQuery.data?.students ?? [];
  const activeUserId = selectedUserId ?? students[0]?.userId ?? null;

  const recommendationsQuery = useQuery({
    queryKey: ['partner', 'student', activeUserId, 'recommendations', 'matches-tab'],
    queryFn: () => getPartnerStudentRecommendations(activeUserId!, {page: 1, limit: 30}),
    enabled: activeUserId != null,
    staleTime: 60 * 1000,
  });

  const courses = useMemo(() => {
    let list = recommendationsQuery.data?.courses ?? [];
    if (filter.country) {
      list = list.filter(c => c.country === filter.country);
    }
    if (filter.minScore > 0) {
      list = list.filter(c => c.matchScore >= filter.minScore);
    }
    if (filter.sortBy === 'fees') {
      list = [...list].sort((a, b) => (a.fees?.amount ?? 0) - (b.fees?.amount ?? 0));
    } else {
      list = [...list].sort((a, b) => b.matchScore - a.matchScore);
    }
    return list;
  }, [filter.country, filter.minScore, filter.sortBy, recommendationsQuery.data?.courses]);

  const countries = useMemo(() => {
    const set = new Set((recommendationsQuery.data?.courses ?? []).map(c => c.country));
    return Array.from(set).sort();
  }, [recommendationsQuery.data?.courses]);

  const onToggleCompare = useCallback((courseId: string) => {
    setCompareIds(prev => {
      if (prev.includes(courseId)) return prev.filter(id => id !== courseId);
      if (prev.length >= 2) return [prev[1], courseId];
      return [...prev, courseId];
    });
  }, []);

  const onCompare = useCallback(() => {
    if (!activeUserId || compareIds.length < 2) return;
    navigation.navigate('MatchesCompare', {
      userId: activeUserId,
      courseIds: [compareIds[0], compareIds[1]],
    });
  }, [activeUserId, compareIds, navigation]);

  const onShortlist = useCallback(
    (courseId: string, courseName: string, matchScore?: number) => {
      if (!activeUserId) return;
      navigation.navigate('MatchesShortlist', {
        userId: activeUserId,
        courseId,
        courseName,
        matchScore,
      });
    },
    [activeUserId, navigation],
  );

  return (
    <AgentMatchesScreen
      students={students}
      selectedUserId={activeUserId}
      courses={courses}
      compareIds={compareIds}
      filter={filter}
      filterVisible={filterVisible}
      countries={countries}
      message={recommendationsQuery.data?.message}
      loading={studentsQuery.isLoading || recommendationsQuery.isLoading}
      refreshing={recommendationsQuery.isRefetching}
      onRefresh={() => void recommendationsQuery.refetch()}
      onSelectStudent={setSelectedUserId}
      onToggleCompare={onToggleCompare}
      onCompare={onCompare}
      onShortlist={onShortlist}
      onOpenFilter={() => setFilterVisible(true)}
      onCloseFilter={() => setFilterVisible(false)}
      onApplyFilter={setFilter}
    />
  );
}
