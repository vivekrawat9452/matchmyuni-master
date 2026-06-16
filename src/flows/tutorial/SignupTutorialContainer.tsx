import React, {useCallback, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {SignupTutorialScreen} from './SignupTutorialScreen';
import {SignupTutorialRecommendedScreen} from './SignupTutorialRecommendedScreen';
import {getDiscoverRecommendations} from '../../api/recommendationApi';
import {
  SIGNUP_TUTORIAL_PENDING_KEY,
  SIGNUP_TUTORIAL_SEEN_KEY,
  TUTORIAL_STEPS,
} from './tutorialConstants';
import type {AppStackList} from '../../navigation/AppStackNavigator';

/** First two Figma frames — swipe tutorials only (645:3705, 645:4064). */
const SLIDE_STEPS = TUTORIAL_STEPS.slice(0, 2);

type Phase = 'slides' | 'recommended';

async function markTutorialComplete() {
  await Promise.all([
    AsyncStorage.removeItem(SIGNUP_TUTORIAL_PENDING_KEY),
    AsyncStorage.setItem(SIGNUP_TUTORIAL_SEEN_KEY, '1'),
  ]);
}

export function SignupTutorialContainer() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackList>>();
  const [phase, setPhase] = useState<Phase>('slides');
  const [slideIndex, setSlideIndex] = useState(0);
  const [recStep, setRecStep] = useState<2 | 3>(2);
  const [exiting, setExiting] = useState(false);

  const {data: discoverData, isLoading: discoverLoading} = useQuery({
    queryKey: ['signupTutorial', 'discover'],
    queryFn: () => getDiscoverRecommendations({page: 1, pageSize: 10}),
    staleTime: 5 * 60 * 1000,
    enabled: phase === 'recommended',
  });

  const matchByCourseId = useMemo(() => {
    const map: Record<number, number> = {};
    discoverData?.results?.forEach(r => {
      map[r.courseId] = r.matchScore;
    });
    return map;
  }, [discoverData?.results]);

  const courses = useMemo(
    () =>
      (discoverData?.results ?? []).map(r => ({
        ...r.course,
        id: r.course.id ?? r.courseId,
      })),
    [discoverData?.results],
  );

  const showRecommended = useCallback(() => {
    setPhase('recommended');
    setRecStep(2);
  }, []);

  const finishToDiscover = useCallback(async () => {
    setExiting(true);
    await markTutorialComplete();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Tabs',
          state: {
            routes: [{name: 'DiscoverTab'}],
            index: 0,
          },
        },
      ],
    });
  }, [navigation]);

  const onNext = useCallback(() => {
    if (slideIndex >= SLIDE_STEPS.length - 1) {
      showRecommended();
      return;
    }
    setSlideIndex(i => i + 1);
  }, [slideIndex, showRecommended]);

  const onSkip = useCallback(() => {
    showRecommended();
  }, [showRecommended]);

  const onRecDone = useCallback(() => {
    setRecStep(3);
  }, []);

  const onGoHome = useCallback(() => {
    void finishToDiscover();
  }, [finishToDiscover]);

  if (phase === 'recommended') {
    return (
      <SignupTutorialRecommendedScreen
        step={recStep}
        loading={discoverLoading}
        courses={courses}
        matchByCourseId={matchByCourseId}
        onDone={onRecDone}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <SignupTutorialScreen
      step={SLIDE_STEPS[slideIndex]}
      exiting={exiting}
      onNext={onNext}
      onSkip={onSkip}
    />
  );
}
