/**
 * TrackApplicationStatusContainer — Figma 593:846
 * Same screen as Application Status from Applied tab and post-submit flow.
 */
import React, {useCallback, useEffect, useMemo} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  TrackApplicationStatusScreen,
  type StatusRequiredDoc,
} from './TrackApplicationStatusScreen';
import {getCourseById} from '../../../api/publicApi';
import {
  documentMatchesUiKey,
} from '../../../api/documentTypes';
import {getApplicationsByIds, getUserDocuments} from '../../../api/userApi';
import type {AppStackList} from '../../../navigation/AppStackNavigator';
import type {CourseListItem, UserDocumentDto} from '../../../api/types';
import {DOCUMENT_TYPES} from '../Profile/profileConstants';
import {buildCourseCostBreakdown} from '../CourseDetails/courseCostBreakdown';

type Props = NativeStackScreenProps<AppStackList, 'TrackApplicationStatus'>;

const FLOW_LOG = '[TrackApplicationStatus 593:846]';
const DOCS_LOG = "[TrackApplicationStatus What you'll need]";

function logSkippedSection(section: string, reason: string) {
  console.log(FLOW_LOG, `${section} skipped — ${reason}`);
}

function mapUploadedDocs(docs: UserDocumentDto[] | undefined): StatusRequiredDoc[] {
  return DOCUMENT_TYPES.map(def => {
    const match = (docs ?? []).find(d =>
      documentMatchesUiKey(d.documentType, def.key, d.filename),
    );
    return {
      key: def.key,
      label: def.label,
      uploaded: !!match,
    };
  });
}

function mergeCourse(
  fromDetail: CourseListItem | undefined,
  fetched: CourseListItem | null | undefined,
  passed: CourseListItem | null,
): CourseListItem | null {
  if (fetched) {
    return {...(passed ?? fromDetail ?? {}), ...fetched} as CourseListItem;
  }
  if (passed) {
    return {...(fromDetail ?? {}), ...passed} as CourseListItem;
  }
  return fromDetail ?? null;
}

export function TrackApplicationStatusContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const {applicationId, courseData} = route.params;

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
      hasCourseData: !!courseData,
    });
  }, [applicationId, courseData]);

  const {data, isLoading, isError} = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => getApplicationsByIds([applicationId]),
    staleTime: 2 * 60 * 1000,
    select: rows => rows[0],
  });

  useEffect(() => {
    if (data) {
      console.log(FLOW_LOG, 'application detail ready', {
        source: 'GET /applications/by-ids',
        applicationId: data.application.id,
        status: data.application.status,
        submittedAt: data.application.submittedAt,
        intakeLabel: data.application.intakeLabel,
        courseId: data.application.courseId,
        courseName: data.course?.name,
      });
    }
  }, [data]);

  const courseId = data?.application.courseId ?? passedCourse?.id;

  const {data: fetchedCourse} = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: courseId != null,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchedCourse) {
      console.log(FLOW_LOG, 'course fee fields', {
        source: 'GET /courses/:id',
        courseId: fetchedCourse.id,
        applicableTuitionFee: fetchedCourse.applicableTuitionFee,
        isPrime: fetchedCourse.isPrime,
        duration: fetchedCourse.duration,
      });
    } else if (data && !courseId) {
      logSkippedSection(
        'GET /courses/:id',
        'no courseId on GET /applications/by-ids',
      );
    }
  }, [fetchedCourse, data, courseId]);

  const course = useMemo(
    () => mergeCourse(data?.course, fetchedCourse, passedCourse),
    [data?.course, fetchedCourse, passedCourse],
  );

  const costBreakdown = useMemo(
    () => (course ? buildCourseCostBreakdown(course) : null),
    [course],
  );

  useEffect(() => {
    if (!course || !costBreakdown) {
      if (course && !costBreakdown) {
        logSkippedSection(
          'Cost breakdown',
          'no fee fields on course payload — UI section hidden',
        );
      }
      return;
    }
    console.log(FLOW_LOG, 'Cost Breakdown', {
      source: data?.course?.applicableTuitionFee != null
        ? 'GET /applications/by-ids course'
        : 'GET /courses/:id fee fields',
      firstYearTotal: costBreakdown.firstYearTotal,
      lineItems: costBreakdown.lineItems.length,
    });
  }, [course, costBreakdown, data?.course?.applicableTuitionFee]);

  const {data: userDocs} = useQuery({
    queryKey: ['userDocuments'],
    queryFn: getUserDocuments,
    staleTime: 5 * 60 * 1000,
  });

  const requiredDocs = useMemo(() => mapUploadedDocs(userDocs), [userDocs]);

  useEffect(() => {
    if (userDocs == null) {
      return;
    }
    console.log(DOCS_LOG, 'document rows', {
      source: 'GET /user/documents',
      apiCount: userDocs.length,
      uiRows: requiredDocs.map(d => ({key: d.key, uploaded: d.uploaded})),
    });
  }, [userDocs, requiredDocs]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <TrackApplicationStatusScreen
      detail={data}
      course={course}
      costBreakdown={costBreakdown}
      requiredDocs={requiredDocs}
      loading={isLoading}
      loadFailed={isError}
      onBack={onBack}
    />
  );
}
