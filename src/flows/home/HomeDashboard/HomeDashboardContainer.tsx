import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {HomeDashboardScreen} from './HomeDashboardScreen';
import {getUserMe, getApplications} from '../../../api/userApi';
import {
  flattenApplicationItems,
  toApplicationDtos,
} from '../../../api/applicationsUtils';
import {getCourses} from '../../../api/publicApi';
import {useAuthStore} from '../../../stores/authStore';
import type {CourseListItem} from '../../../api/types';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

export function HomeDashboardContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const u = useAuthStore(s => s.user);
  const isAuth = !!u;

  const {data: me, isLoading: meLoading, refetch: refetchMe, isRefetching: refMe} =
    useQuery({
      queryKey: ['user', 'me'],
      queryFn: getUserMe,
      enabled: isAuth,
      staleTime: 5 * 60 * 1000,
    });

  const {data: coursesPage, isLoading: cLoading, refetch: refetchCourses, isRefetching: refC} =
    useQuery({
      queryKey: ['courses', 'home'],
      queryFn: () => getCourses({limit: 10, page: 1}),
      staleTime: 10 * 60 * 1000,
    });

  const {data: applications, refetch: refetchApps, isRefetching: refA} =
    useQuery({
      queryKey: ['applications'],
      queryFn: getApplications,
      enabled: isAuth,
      staleTime: 5 * 60 * 1000,
      select: grouped => toApplicationDtos(flattenApplicationItems(grouped)),
    });

  const onRefresh = useCallback(() => {
    void refetchMe();
    void refetchCourses();
    void refetchApps();
  }, [refetchMe, refetchCourses, refetchApps]);

  const onOpenCourse = useCallback(
    (c: CourseListItem) => {
      navigation.navigate('CourseDetails', {
        courseId:   c.id,
        matchPct:   88,
        courseData: JSON.stringify(c),
      });
    },
    [navigation],
  );

  const onViewMatches = useCallback(() => {
    navigation.navigate('Tabs', {screen: 'DiscoverTab'} as never);
  }, [navigation]);

  const onSeeAllMatches = useCallback(() => {
    navigation.navigate('Tabs', {screen: 'DiscoverTab'} as never);
  }, [navigation]);

  const onCompleteProfile = useCallback(() => {
    navigation.navigate('Tabs', {screen: 'ProfileTab'} as never);
  }, [navigation]);

  const onBell = useCallback(() => {
    Alert.alert('Notifications', 'No new notifications.');
  }, []);

  const firstName =
    (me as {firstName?: string} | undefined)?.firstName ?? u?.firstName ?? '';

  return (
    <HomeDashboardScreen
      firstName={firstName}
      courses={coursesPage?.courses}
      applications={applications}
      loading={meLoading || cLoading}
      refreshing={refMe || refC || refA}
      onRefresh={onRefresh}
      onSearchPress={() => navigation.navigate('Tabs', {screen: 'DiscoverTab'} as never)}
      onOpenCourse={onOpenCourse}
      onViewMatches={onViewMatches}
      onSeeAllMatches={onSeeAllMatches}
      onCompleteProfile={onCompleteProfile}
      onBell={onBell}
    />
  );
}
