/**
 * ApplicationSubmittedContainer — Figma 567:1943 (success screen)
 * Track flow uses shared TrackApplicationStatusScreen — Figma 593:846
 *
 * Course context: navigation courseData from StartApplication
 * Application detail: GET /applications/by-ids when applicationId present
 */
import React, {useCallback, useEffect, useMemo} from 'react';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {ApplicationSubmittedScreen} from './ApplicationSubmittedScreen';
import {getApplicationsByIds} from '../../../api/userApi';
import type {AppStackList} from '../../../navigation/AppStackNavigator';
import type {CourseListItem} from '../../../api/types';

type Props = NativeStackScreenProps<AppStackList, 'ApplicationSubmitted'>;

const FLOW_LOG = '[ApplicationSubmitted 567:1943]';

function resetToApplicationsTab(
  navigation: NativeStackNavigationProp<AppStackList>,
) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'Tabs',
          state: {
            index: 2,
            routes: [
              {name: 'Home'},
              {name: 'DiscoverTab'},
              {name: 'ApplicationTab'},
              {name: 'MessageTab'},
              {name: 'ProfileTab'},
            ],
          },
        },
      ],
    }),
  );
}

export function ApplicationSubmittedContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const {
    applicationId,
    courseId,
    courseName,
    universityName,
    matchPct,
    courseData,
    intakeLabel: routeIntakeLabel,
  } = route.params;

  const passedCourse: CourseListItem | null = useMemo(() => {
    if (!courseData) {
      return null;
    }
    try {
      return JSON.parse(courseData) as CourseListItem;
    } catch {
      console.warn(FLOW_LOG, 'courseData parse failed');
      return null;
    }
  }, [courseData]);

  useEffect(() => {
    console.log(FLOW_LOG, 'route params', {
      applicationId,
      courseId,
      courseName,
      universityName,
      matchPct,
      hasCourseData: !!courseData,
      intakeLabel: routeIntakeLabel,
    });
  }, [
    applicationId,
    courseId,
    courseName,
    universityName,
    matchPct,
    courseData,
    routeIntakeLabel,
  ]);

  useEffect(() => {
    if (passedCourse) {
      console.log(FLOW_LOG, 'course ready', {
        source: 'navigation courseData',
        courseId: passedCourse.id,
        name: passedCourse.name,
        universityName: passedCourse.universityName,
        duration: passedCourse.duration,
        isPrime: passedCourse.isPrime,
        intakes:
          passedCourse.upcomingIntakes?.length ?? passedCourse.intakes?.length ?? 0,
      });
    }
  }, [passedCourse]);

  const {
    data: applicationDetail,
    isLoading: detailLoading,
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplicationsByIds([applicationId!]),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000,
    select: rows => rows[0],
  });

  useEffect(() => {
    if (applicationDetail) {
      console.log(FLOW_LOG, 'application detail ready', {
        source: 'GET /applications/by-ids',
        applicationId: applicationDetail.application.id,
        status: applicationDetail.application.status,
        submittedAt: applicationDetail.application.submittedAt,
        intakeLabel: applicationDetail.application.intakeLabel,
      });
    }
  }, [applicationDetail]);

  const course = applicationDetail?.course ?? passedCourse;
  const resolvedUniversityName =
    applicationDetail?.university.name ??
    course?.universityName ??
    universityName;
  const resolvedCourseName = course?.name ?? courseName;
  const resolvedIntakeLabel =
    applicationDetail?.application.intakeLabel ??
    routeIntakeLabel ??
    course?.upcomingIntakes?.[0]?.label ??
    course?.intakes?.[0] ??
    null;
  const submittedAt = applicationDetail?.application.submittedAt ?? null;
  const applicationStatus = applicationDetail?.application.status ?? 'applied';

  const onTrackApplication = useCallback(() => {
    if (!applicationId) {
      resetToApplicationsTab(navigation);
      return;
    }
    navigation.navigate('TrackApplicationStatus', {
      applicationId,
      courseName: resolvedCourseName,
      universityName: resolvedUniversityName,
      courseData: course ? JSON.stringify(course) : courseData,
    });
  }, [
    navigation,
    applicationId,
    resolvedCourseName,
    resolvedUniversityName,
    course,
    courseData,
  ]);

  const onViewApplications = useCallback(() => {
    resetToApplicationsTab(navigation);
  }, [navigation]);

  const onDone = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Tabs'}],
      }),
    );
  }, [navigation]);

  return (
    <ApplicationSubmittedScreen
      courseName={resolvedCourseName}
      universityName={resolvedUniversityName}
      course={course}
      matchPct={matchPct}
      intakeLabel={resolvedIntakeLabel}
      submittedAt={submittedAt}
      applicationStatus={applicationStatus}
      detailLoading={detailLoading && !!applicationId}
      onTrackApplication={onTrackApplication}
      onViewApplications={onViewApplications}
      onDone={onDone}
    />
  );
}
