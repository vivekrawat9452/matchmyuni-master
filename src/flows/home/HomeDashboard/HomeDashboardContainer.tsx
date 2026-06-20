import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {HomeDashboardScreen} from './HomeDashboardScreen';
import {getUserMe} from '../../../api/userApi';
import {getDiscoverRecommendations} from '../../../api/recommendationApi';
import {searchCourses} from '../../../api/publicApi';
import {useAuthStore} from '../../../stores/authStore';
import type {CourseListItem, CourseSearchResult} from '../../../api/types';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

const HOME_LOG = '[Home discover_home_1_0]';

/** No matching endpoint in prompts/API_Docs.md — section UI commented out in screen. */
function logSkippedSection(section: string) {
  console.log(HOME_LOG, `${section} skipped — no API in API_Docs.md`);
}

export function HomeDashboardContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const u = useAuthStore(s => s.user);
  const isAuth = !!u;

  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 300);
  }, []);

  const {data: searchResults = [], isFetching: searchLoading} = useQuery({
    queryKey: ['courses', 'search', debouncedSearch],
    queryFn: () => searchCourses(debouncedSearch),
    enabled: debouncedSearch.trim().length > 0,
    staleTime: 30 * 1000,
  });

  const onSelectSearchCourse = useCallback(
    (course: CourseSearchResult) => {
      setSearchQuery('');
      setDebouncedSearch('');
      navigation.navigate('CourseDetails', {courseId: course.id});
    },
    [navigation],
  );

  useEffect(() => {
    logSkippedSection('User Journey');
    logSkippedSection('Complete your profile');
    logSkippedSection('Scholarships for You');
  }, []);

  const {data: me, isLoading: meLoading, refetch: refetchMe, isRefetching: refMe} =
    useQuery({
      queryKey: ['user', 'me'],
      queryFn: getUserMe,
      enabled: isAuth,
      staleTime: 5 * 60 * 1000,
    });

  const {
    data: discoverData,
    isLoading: discoverLoading,
    refetch: refetchDiscover,
    isRefetching: refDiscover,
  } = useQuery({
    queryKey: ['home', 'discover'],
    queryFn: () => getDiscoverRecommendations({page: 1, pageSize: 10}),
    enabled: isAuth,
    staleTime: 5 * 60 * 1000,
  });

  const matchCourses = useMemo(
    () =>
      (discoverData?.results ?? []).map(r => ({
        ...r.course,
        id: r.course.id ?? r.courseId,
        matchPct: r.matchScore,
      })),
    [discoverData?.results],
  );

  const displayName = useMemo(() => {
    const first = me?.firstName ?? u?.firstName ?? '';
    const last = me?.lastName ?? u?.lastName ?? '';
    if (first && last) {
      return `${first} ${last.charAt(0)}`;
    }
    return first || 'Student';
  }, [me?.firstName, me?.lastName, u?.firstName, u?.lastName]);

  const onRefresh = useCallback(() => {
    void refetchMe();
    void refetchDiscover();
  }, [refetchMe, refetchDiscover]);

  const onOpenCourse = useCallback(
    (c: CourseListItem & {matchPct?: number}) => {
      const matchResult = discoverData?.results?.find(
        r => (r.course.id ?? r.courseId) === c.id,
      );
      navigation.navigate('CourseDetails', {
        courseId: c.id,
        matchPct: c.matchPct ?? matchResult?.matchScore ?? 0,
        courseData: JSON.stringify(c),
        whyMatchData: JSON.stringify(matchResult?.whyMatch ?? []),
      });
    },
    [navigation, discoverData?.results],
  );

  const onSeeAllMatches = useCallback(() => {
    navigation.navigate('Tabs', {screen: 'DiscoverTab'} as never);
  }, [navigation]);

  const onBell = useCallback(() => {
    Alert.alert('Notifications', 'No new notifications.');
  }, []);

  return (
    <HomeDashboardScreen
      displayName={displayName}
      matchCourses={matchCourses}
      hasPreferences={discoverData?.hasPreferences === true}
      loading={meLoading || discoverLoading}
      refreshing={refMe || refDiscover}
      onRefresh={onRefresh}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchResults={searchResults}
      searchLoading={searchLoading}
      onSelectSearchCourse={onSelectSearchCourse}
      onOpenCourse={onOpenCourse}
      onSeeAllMatches={onSeeAllMatches}
      onBell={onBell}
    />
  );
}
