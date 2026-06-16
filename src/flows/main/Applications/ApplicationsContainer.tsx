/**
 * ApplicationsContainer — Figma 593:1755 / 593:2244
 * Shortlist: GET /user/shortlist (+ local cache when API unavailable)
 * Applied: GET /applications (grouped)
 */
import React, {useCallback, useMemo, useState} from 'react';
import {Alert} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  ApplicationsScreen,
  type ApplicationsTab,
} from './ApplicationsScreen';
import {
  getShortlist,
  isShortlistApiUnavailable,
  removeFromShortlist,
} from '../../../api/shortlistApi';
import {getApplications} from '../../../api/userApi';
import {flattenApplicationItems} from '../../../api/applicationsUtils';
import {getApiErrorMessage} from '../../../api/client';
import {useAuthStore} from '../../../stores/authStore';
import type {AppStackList} from '../../../navigation/AppStackNavigator';
import type {ApplicationListItemDto, CourseListItem} from '../../../api/types';
import {en} from '../../../utils/strings/en';

export function ApplicationsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const queryClient = useQueryClient();
  const isAuth = !!useAuthStore(s => s.user);
  const [tab, setTab] = useState<ApplicationsTab>('shortlist');
  const [shortlistBusyId, setShortlistBusyId] = useState<number | null>(null);

  const {
    data: shortlist,
    isLoading: shortlistLoading,
    refetch: refetchShortlist,
    isRefetching: refShortlist,
  } = useQuery({
    queryKey: ['shortlist'],
    queryFn: getShortlist,
    enabled: isAuth,
    staleTime: 0,
  });

  const {
    data: groupedApps,
    isLoading: appsLoading,
    refetch: refetchApps,
    isRefetching: refApps,
  } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    enabled: isAuth,
    staleTime: 5 * 60 * 1000,
  });

  const applications = useMemo(
    () => flattenApplicationItems(groupedApps),
    [groupedApps],
  );

  const {mutate: removeItem} = useMutation({
    mutationFn: removeFromShortlist,
    onMutate: courseId => {
      setShortlistBusyId(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shortlist']});
      Alert.alert('Shortlist', en.applicationFlow.shortlistRemoved);
    },
    onError: (e: Error) => {
      const msg = isShortlistApiUnavailable(e)
        ? 'Shortlist is not available yet. Please try again later.'
        : getApiErrorMessage(e, en.errors.generic);
      Alert.alert('Shortlist', msg);
    },
    onSettled: () => {
      setShortlistBusyId(null);
    },
  });

  const onRefresh = useCallback(() => {
    void refetchShortlist();
    void refetchApps();
  }, [refetchShortlist, refetchApps]);

  useFocusEffect(
    useCallback(() => {
      void refetchShortlist();
      void refetchApps();
    }, [refetchShortlist, refetchApps]),
  );

  const onOpenCourse = useCallback(
    (course: CourseListItem) => {
      navigation.navigate('CourseDetails', {
        courseId: course.id,
        matchPct: 88,
        courseData: JSON.stringify(course),
      });
    },
    [navigation],
  );

  const onStartApplication = useCallback(
    (course: CourseListItem) => {
      navigation.navigate('StartApplication', {
        courseId: course.id,
        courseName: course.name,
        universityName: course.universityName,
        courseData: JSON.stringify(course),
      });
    },
    [navigation],
  );

  const onTrackApplication = useCallback(
    (item: ApplicationListItemDto) => {
      navigation.navigate('TrackApplicationStatus', {
        applicationId: item.application.id,
        courseName: item.course.name,
        universityName: item.university.name,
        courseData: JSON.stringify(item.course),
      });
    },
    [navigation],
  );

  const onRemoveShortlist = useCallback(
    (courseId: number) => {
      removeItem(courseId);
    },
    [removeItem],
  );

  return (
    <ApplicationsScreen
      tab={tab}
      onTabChange={setTab}
      shortlist={shortlist ?? []}
      applications={applications}
      loading={shortlistLoading || appsLoading}
      refreshing={refShortlist || refApps}
      onRefresh={onRefresh}
      onStartApplication={onStartApplication}
      onOpenCourse={onOpenCourse}
      onTrackApplication={onTrackApplication}
      onRemoveShortlist={onRemoveShortlist}
      shortlistBusyId={shortlistBusyId}
    />
  );
}
