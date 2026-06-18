import React, {useCallback, useEffect, useMemo} from 'react';
import {Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CourseDetailsScreen} from './CourseDetailsScreen';
import {getCourseById} from '../../../api/publicApi';
import {
  addToShortlist,
  getShortlist,
  isShortlistApiUnavailable,
  removeFromShortlist,
} from '../../../api/shortlistApi';
import {getApiErrorMessage} from '../../../api/client';
import type {AppStackList} from '../../../navigation/AppStackNavigator';
import type {CourseListItem} from '../../../api/types';
import {en} from '../../../utils/strings/en';

type Props = NativeStackScreenProps<AppStackList, 'CourseDetails'>;

const DETAIL_LOG = '[CourseDetails discover_home_2_5]';

function logSkippedSection(section: string, reason: string) {
  console.log(DETAIL_LOG, `${section} skipped — ${reason}`);
}

function parseWhyMatch(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
      : [];
  } catch {
    return [];
  }
}

export function CourseDetailsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const queryClient = useQueryClient();
  const {courseId, matchPct = 88, courseData, whyMatchData} = route.params;

  const passedCourse: CourseListItem | null = (() => {
    if (!courseData) {
      return null;
    }
    try {
      return JSON.parse(courseData) as CourseListItem;
    } catch {
      return null;
    }
  })();

  const whyMatch = useMemo(() => parseWhyMatch(whyMatchData), [whyMatchData]);

  useEffect(() => {
    logSkippedSection(
      'Cost Breakdown',
      'no dedicated Cost Breakdown endpoint in prompts/API_Docs.md',
    );
    logSkippedSection(
      'Visa rate',
      'no visa rate field in prompts/API_Docs.md or prompts/apis',
    );
    logSkippedSection(
      'Why Prime',
      'no user journey / why-prime endpoint in prompts/API_Docs.md or prompts/apis',
    );
  }, []);

  useEffect(() => {
    if (whyMatch.length) {
      console.log(DETAIL_LOG, 'Why you match', {
        source: 'GET /recommendations/discover whyMatch',
        count: whyMatch.length,
        items: whyMatch,
      });
    } else {
      logSkippedSection(
        'Why you match',
        'no user journey endpoint — pass whyMatch from GET /recommendations/discover',
      );
    }
  }, [whyMatch]);

  const {data: fetchedCourse, isLoading} = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const {data: shortlist} = useQuery({
    queryKey: ['shortlist'],
    queryFn: getShortlist,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const course = fetchedCourse ?? passedCourse ?? null;
  const loading = isLoading && !course;

  useEffect(() => {
    if (course && !isLoading) {
      console.log(DETAIL_LOG, 'course detail ready', {
        courseId: course.id,
        source: fetchedCourse ? 'GET /courses/:id' : 'navigation courseData',
        scholarship: course.scholarshipDetails ?? course.scholarshipOnTuitionFee,
        duration: course.duration,
        isPrime: course.isPrime,
      });
    }
  }, [course, fetchedCourse, isLoading]);

  const isShortlisted = useMemo(
    () => (shortlist ?? []).some(c => c.id === courseId),
    [shortlist, courseId],
  );

  const {mutate: toggleShortlist, isPending: shortlistBusy} = useMutation({
    mutationFn: async (): Promise<'added' | 'removed'> => {
      if (isShortlisted) {
        await removeFromShortlist(courseId);
        return 'removed';
      }
      await addToShortlist(courseId, course ?? undefined);
      return 'added';
    },
    onSuccess: action => {
      queryClient.invalidateQueries({queryKey: ['shortlist']});
      console.log(DETAIL_LOG, 'shortlist updated', {courseId, action});
      Alert.alert(
        action === 'added'
          ? en.applicationFlow.shortlistAdded
          : en.applicationFlow.shortlistRemoved,
      );
    },
    onError: (e: Error) => {
      console.error(DETAIL_LOG, 'shortlist failed', {courseId, error: e.message});
      const msg = isShortlistApiUnavailable(e)
        ? 'Shortlist is not available yet. Please try again later.'
        : getApiErrorMessage(e, en.errors.generic);
      Alert.alert('Shortlist', msg);
    },
  });

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onShortlist = useCallback(() => {
    if (!course || shortlistBusy) {
      return;
    }
    toggleShortlist();
  }, [course, shortlistBusy, toggleShortlist]);

  const onStartApplication = useCallback(() => {
    if (!course) {
      return;
    }
    navigation.navigate('StartApplication', {
      courseId: course.id,
      courseName: course.name,
      universityName: course.universityName,
      matchPct,
      courseData: JSON.stringify(course),
    });
  }, [navigation, course, matchPct]);

  return (
    <CourseDetailsScreen
      course={course}
      matchPct={matchPct}
      whyMatch={whyMatch}
      loading={loading}
      isShortlisted={isShortlisted}
      onBack={onBack}
      onShortlist={onShortlist}
      onStartApplication={onStartApplication}
    />
  );
}
