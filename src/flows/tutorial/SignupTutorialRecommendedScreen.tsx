/**
 * Post-signup tutorial — recommended courses (Figma 645:4423 → 645:3349).
 * Live course data from GET /recommendations/discover with tutorial overlays.
 */
import React from 'react';
import {
  View,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../utils/colors';
import {FontSizes, Weights} from '../../utils';
import {en} from '../../utils/strings/en';
import type {CourseListItem} from '../../api/types';
import {
  DiscoverCourseCard,
  DISCOVER_CARD_H,
  DISCOVER_CARD_W,
  DISCOVER_SIDE_PAD,
} from '../main/Discover/DiscoverCourseCard';

export type RecommendedTutorialStep = 2 | 3;

type Props = {
  step: RecommendedTutorialStep;
  loading: boolean;
  courses: CourseListItem[];
  matchByCourseId: Record<number, number>;
  onDone: () => void;
  onGoHome: () => void;
};

export function SignupTutorialRecommendedScreen({
  step,
  loading,
  courses,
  matchByCourseId,
  onDone,
  onGoHome,
}: Props) {
  const insets = useSafeAreaInsets();
  const footPad = Math.max(insets.bottom, 16);
  const topCourse = courses[0];
  const matchPct = topCourse
    ? (matchByCourseId[topCourse.id] ?? 88)
    : 88;

  return (
    <View style={styles.root}>
      {step === 3 ? (
        <>
          <View style={styles.bg} pointerEvents="none">
            <ImageBackground
              source={require('../../../assets/profile/tutorial_step4_go_home.png')}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessibilityLabel="Go to home tutorial"
            />
          </View>
          <View style={[styles.footer, {paddingBottom: footPad}]}>
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
        </>
      ) : (
        <>
          <View style={[styles.header, {paddingTop: insets.top + 8}]}>
            <Text style={styles.title}>{en.signupTutorial.recommended}</Text>
          </View>

          <View style={styles.deck}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : topCourse ? (
              <>
                {courses.slice(1, 3).map((c, i) => (
                  <View
                    key={c.id}
                    style={[
                      styles.backCard,
                      {
                        transform: [
                          {scale: 0.965 - i * 0.035},
                          {translateY: -(i + 1) * 16},
                        ],
                      },
                    ]}
                  />
                ))}
                <View style={styles.cardWrap}>
                  <DiscoverCourseCard
                    course={topCourse}
                    matchPct={matchPct}
                    width={DISCOVER_CARD_W}
                    height={DISCOVER_CARD_H}
                  />
                </View>

                <View style={styles.tapOverlay} pointerEvents="box-none">
                  <View style={styles.tapIconCircle}>
                    <Text style={styles.tapEmoji}>👆</Text>
                  </View>
                  <Text style={styles.tapText}>{en.signupTutorial.tapDetail}</Text>
                  <Pressable
                    style={({pressed}) => [
                      styles.doneCompactBtn,
                      pressed && styles.doneCompactBtnPressed,
                    ]}
                    onPress={onDone}
                    accessibilityRole="button"
                    accessibilityLabel={en.signupTutorial.done}>
                    <Text style={styles.doneCompactLabel}>
                      {en.signupTutorial.done}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No recommendations yet</Text>
                <Text style={styles.emptySub}>
                  Complete your study preferences to see personalised matches.
                </Text>
                <Pressable
                  style={({pressed}) => [
                    styles.doneCompactBtn,
                    pressed && styles.doneCompactBtnPressed,
                  ]}
                  onPress={onDone}
                  accessibilityRole="button"
                  accessibilityLabel={en.signupTutorial.done}>
                  <Text style={styles.doneCompactLabel}>
                    {en.signupTutorial.done}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  bg: {...StyleSheet.absoluteFillObject},
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
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DISCOVER_SIDE_PAD,
  },
  backCard: {
    position: 'absolute',
    width: DISCOVER_CARD_W,
    height: DISCOVER_CARD_H,
    borderRadius: 20,
    backgroundColor: colors.white,
    opacity: 0.55,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  cardWrap: {
    width: DISCOVER_CARD_W,
    height: DISCOVER_CARD_H,
    zIndex: 2,
  },
  tapOverlay: {
    position: 'absolute',
    width: DISCOVER_CARD_W,
    height: DISCOVER_CARD_H,
    backgroundColor: 'rgba(15,22,44,0.82)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 28,
    zIndex: 10,
  },
  tapIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapEmoji: {fontSize: 32},
  tapText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
  },
  doneCompactBtn: {
    height: 44,
    paddingHorizontal: 40,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  doneCompactBtnPressed: {backgroundColor: colors.primaryDark},
  doneCompactLabel: {
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
  empty: {
    flex: 1,
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
});
