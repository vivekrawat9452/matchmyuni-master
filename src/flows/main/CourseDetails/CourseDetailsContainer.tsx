import React, {useCallback, useMemo} from 'react';
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

export function CourseDetailsContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const route = useRoute<Props['route']>();
  const queryClient = useQueryClient();
  const {courseId, matchPct = 88, courseData} = route.params;

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

  const {data: fetchedCourse, isLoading} = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !passedCourse,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const {data: shortlist} = useQuery({
    queryKey: ['shortlist'],
    queryFn: getShortlist,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const course = passedCourse ?? fetchedCourse ?? null;
  const loading = isLoading && !course;

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
      Alert.alert(
        action === 'added'
          ? en.applicationFlow.shortlistAdded
          : en.applicationFlow.shortlistRemoved,
      );
    },
    onError: (e: Error) => {
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
      loading={loading}
      isShortlisted={isShortlisted}
      onBack={onBack}
      onShortlist={onShortlist}
      onStartApplication={onStartApplication}
    />
  );
}
