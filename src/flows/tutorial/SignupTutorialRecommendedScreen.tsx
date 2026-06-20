/**
 * Post-signup tutorial — recommended courses (Figma 645:4423 → 645:3349).
 * Live discover deck with swipe/shortlist parity to DiscoverContainer.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../utils/colors';
import {FontSizes, Weights} from '../../utils';
import {en} from '../../utils/strings/en';
import type {CourseListItem} from '../../api/types';
import {
  addToShortlist,
  getShortlist,
  resolveCourseId,
} from '../../api/shortlistApi';
import type {AppStackList} from '../../navigation/AppStackNavigator';
import {
  DiscoverCardTutorialOverlay,
  DiscoverDeckActions,
  discoverDeckStyles,
  PrevCardsPeek,
  SwipeCard,
} from '../main/Discover/DiscoverSwipeDeck';

export type RecommendedTutorialPhase = 'overlay' | 'interactive';

const SIGNUP_TUTORIAL_SLIDES = [
  {emoji: '👉', text: en.signupTutorial.rightSwipe},
  {emoji: '👈', text: en.signupTutorial.leftSwipe},
  {emoji: '👆', text: en.signupTutorial.tapDetail},
] as const;

type Props = {
  phase: RecommendedTutorialPhase;
  overlayIndex: number;
  loading: boolean;
  courses: CourseListItem[];
  matchByCourseId: Record<number, number>;
  whyMatchByCourseId: Record<number, string[]>;
  onOverlayNext: () => void;
  onOverlaySkip: () => void;
  onGoHome: () => void;
};

export function SignupTutorialRecommendedScreen({
  phase,
  overlayIndex,
  loading,
  courses,
  matchByCourseId,
  whyMatchByCourseId,
  onOverlayNext,
  onOverlaySkip,
  onGoHome,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const queryClient = useQueryClient();
  const [cardIndex, setCardIndex] = useState(0);
  const [prevCards, setPrevCards] = useState<CourseListItem[]>([]);

  const {data: shortlist} = useQuery({
    queryKey: ['shortlist'],
    queryFn: getShortlist,
    staleTime: 5 * 60 * 1000,
  });

  const shortlistedIds = useMemo(
    () =>
      new Set(
        (shortlist ?? [])
          .map(c => resolveCourseId(c))
          .filter((id): id is number => id != null),
      ),
    [shortlist],
  );

  const visibleCourses = courses.slice(cardIndex, cardIndex + 3);
  const total = courses.length;
  const remaining = Math.max(0, total - cardIndex);
  const topCourse = visibleCourses[0];
  const showOverlay = phase === 'overlay' && visibleCourses.length > 0 && !loading;
  const gesturesEnabled = phase === 'interactive';

  const onSwipeRight = useCallback(
    (c: CourseListItem) => {
      const courseId = resolveCourseId(c);
      if (courseId && !shortlistedIds.has(courseId)) {
        const entry = {...c, id: courseId};
        queryClient.setQueryData<CourseListItem[]>(['shortlist'], prev => {
          const list = prev ?? [];
          if (list.some(item => item.id === courseId)) {
            return list;
          }
          return [entry, ...list];
        });
        void addToShortlist(courseId, entry)
          .then(() => {
            queryClient.invalidateQueries({queryKey: ['shortlist']});
          })
          .catch(() => {
            queryClient.invalidateQueries({queryKey: ['shortlist']});
          });
      }
      setPrevCards(prev => [c, ...prev].slice(0, 3));
      setCardIndex(i => i + 1);
    },
    [queryClient, shortlistedIds],
  );

  const onSwipeLeft = useCallback((c: CourseListItem) => {
    setPrevCards(prev => [c, ...prev].slice(0, 3));
    setCardIndex(i => i + 1);
  }, []);

  const onTap = useCallback(
    (c: CourseListItem) => {
      const whyMatch = whyMatchByCourseId[c.id] ?? [];
      navigation.navigate('CourseDetails', {
        courseId: c.id,
        matchPct: matchByCourseId[c.id] ?? 88,
        courseData: JSON.stringify(c),
        whyMatchData: JSON.stringify(whyMatch),
      });
    },
    [matchByCourseId, navigation, whyMatchByCourseId],
  );

  const handleOverlayNext = useCallback(() => {
    if (overlayIndex >= SIGNUP_TUTORIAL_SLIDES.length - 1) {
      onOverlaySkip();
      return;
    }
    onOverlayNext();
  }, [onOverlayNext, onOverlaySkip, overlayIndex]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.screen, {paddingTop: insets.top}]}>
        <View style={styles.header}>
          <Text style={styles.title}>{en.signupTutorial.recommended}</Text>
        </View>

        <PrevCardsPeek cards={prevCards} />

        <View style={discoverDeckStyles.deckArea}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : visibleCourses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No recommendations yet</Text>
              <Text style={styles.emptySub}>
                Complete your study preferences to see personalised matches.
              </Text>
              <Pressable
                style={({pressed}) => [
                  styles.emptyBtn,
                  pressed && styles.emptyBtnPressed,
                ]}
                onPress={phase === 'overlay' ? onOverlaySkip : onGoHome}
                accessibilityRole="button"
                accessibilityLabel={
                  phase === 'overlay' ? en.signupTutorial.next : en.signupTutorial.goHome
                }>
                <Text style={styles.emptyBtnLabel}>
                  {phase === 'overlay' ? en.signupTutorial.next : en.signupTutorial.goHome}
                </Text>
              </Pressable>
            </View>
          ) : (
            [...visibleCourses].reverse().map((c, revIdx) => {
              const stackIndex = visibleCourses.length - 1 - revIdx;
              const isTop = stackIndex === 0;
              const matchPct =
                matchByCourseId[c.id] ??
                Math.max(60, 99 - cardIndex * 2 - stackIndex * 5);
              return (
                <SwipeCard
                  key={`${c.id}-${cardIndex}`}
                  course={c}
                  matchPct={matchPct}
                  isTop={isTop}
                  stackIndex={stackIndex}
                  gesturesEnabled={gesturesEnabled && !(isTop && showOverlay)}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft}
                  onTap={onTap}
                />
              );
            })
          )}

          {showOverlay ? (
            <View style={discoverDeckStyles.deckTutorial} pointerEvents="box-none">
              <DiscoverCardTutorialOverlay
                slideIndex={overlayIndex}
                slides={SIGNUP_TUTORIAL_SLIDES}
                nextLabel={en.signupTutorial.next}
                doneLabel={en.signupTutorial.next}
                skipLabel={en.signupTutorial.skip}
                onNext={handleOverlayNext}
                onSkip={onOverlaySkip}
              />
            </View>
          ) : null}
        </View>

        {phase === 'interactive' && topCourse && !loading ? (
          <DiscoverDeckActions
            topCourse={topCourse}
            remaining={remaining}
            bottomInset={insets.bottom + 62}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            onTap={onTap}
          />
        ) : null}

        {phase === 'interactive' ? (
          <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
            <Pressable
              style={({pressed}) => [
                styles.goHomeBtn,
                pressed && styles.goHomeBtnPressed,
              ]}
              onPress={onGoHome}
              accessibilityRole="button"
              accessibilityLabel={en.signupTutorial.goHome}>
              <Text style={styles.goHomeLabel}>{en.signupTutorial.goHome}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  screen: {flex: 1, backgroundColor: colors.background},
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: FontSizes.display,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    letterSpacing: -0.5,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: FontSizes.size17,
    fontWeight: Weights.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSizes.size15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBtnPressed: {opacity: 0.9},
  emptyBtnLabel: {
    fontSize: FontSizes.size15,
    fontWeight: Weights.extrabold,
    color: colors.white,
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 20,
  },
  goHomeBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.darkButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goHomeBtnPressed: {opacity: 0.9},
  goHomeLabel: {
    fontSize: FontSizes.size17,
    fontWeight: Weights.bold,
    color: colors.white,
  },
});
