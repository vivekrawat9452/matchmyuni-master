/**
 * Shared swipe deck used by Discover tab and signup tutorial recommended screen.
 */
import React, {useCallback} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {Check, Heart, Info, X} from 'lucide-react-native';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import type {CourseListItem} from '../../../api/types';
import {
  DiscoverCourseCard,
  DISCOVER_CARD_H as CARD_H,
  DISCOVER_CARD_W as CARD_W,
} from './DiscoverCourseCard';

const {width: W} = Dimensions.get('window');
const H_PAD = hPad(5);
export const SWIPE_THRESHOLD = W * 0.28;

export {CARD_H, CARD_W, H_PAD};

export const DISCOVER_TUTORIAL_SLIDES = [
  {emoji: '👉', text: 'Right swipe to add in recommendation\nand also shortlisted'},
  {emoji: '👈', text: 'Left swipe to remove from recommendation'},
  {emoji: '👆', text: 'On click to view course detail page'},
] as const;

type SwipeCardProps = {
  course: CourseListItem;
  matchPct: number;
  isTop: boolean;
  stackIndex: number;
  gesturesEnabled: boolean;
  onSwipeRight: (c: CourseListItem) => void;
  onSwipeLeft: (c: CourseListItem) => void;
  onTap: (c: CourseListItem) => void;
};

export function SwipeCard({
  course,
  matchPct,
  isTop,
  stackIndex,
  gesturesEnabled,
  onSwipeRight,
  onSwipeLeft,
  onTap,
}: SwipeCardProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const swiped = useSharedValue(false);

  const doRight = useCallback(() => onSwipeRight(course), [onSwipeRight, course]);
  const doLeft = useCallback(() => onSwipeLeft(course), [onSwipeLeft, course]);
  const doTap = useCallback(() => onTap(course), [onTap, course]);

  const pan = Gesture.Pan()
    .enabled(isTop && gesturesEnabled)
    .onUpdate(e => {
      if (swiped.value) return;
      tx.value = e.translationX;
      ty.value = e.translationY * 0.2;
      rot.value = (e.translationX / W) * 16;
    })
    .onEnd(e => {
      if (swiped.value) return;
      const goRight = e.translationX > SWIPE_THRESHOLD || e.velocityX > 900;
      const goLeft = e.translationX < -SWIPE_THRESHOLD || e.velocityX < -900;
      if (goRight) {
        swiped.value = true;
        tx.value = withTiming(W * 1.6, {duration: 300});
        rot.value = withTiming(25, {duration: 300});
        runOnJS(doRight)();
      } else if (goLeft) {
        swiped.value = true;
        tx.value = withTiming(-W * 1.6, {duration: 300});
        rot.value = withTiming(-25, {duration: 300});
        runOnJS(doLeft)();
      } else {
        tx.value = withSpring(0, {damping: 18, stiffness: 200});
        ty.value = withSpring(0, {damping: 18, stiffness: 200});
        rot.value = withSpring(0, {damping: 18, stiffness: 200});
      }
    });

  const tapG = Gesture.Tap()
    .enabled(isTop && gesturesEnabled)
    .maxDuration(200)
    .onEnd(() => runOnJS(doTap)());

  const composed = Gesture.Simultaneous(pan, tapG);

  const scaleBack = 1 - stackIndex * 0.035;
  const tyBack = -stackIndex * 16;

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      return {transform: [{scale: scaleBack}, {translateY: tyBack}]};
    }
    return {
      transform: [
        {translateX: tx.value},
        {translateY: ty.value},
        {rotate: `${rot.value}deg`},
      ],
    };
  });

  const rightOpacity = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP)
      : 0,
  }));
  const leftOpacity = useAnimatedStyle(() => ({
    opacity: isTop
      ? interpolate(tx.value, [0, -SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP)
      : 0,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[deckStyles.cardWrap, cardStyle]}>
        <DiscoverCourseCard
          course={course}
          matchPct={matchPct}
          onViewDetail={doTap}
        />

        <Animated.View style={[deckStyles.swipeOverlay, rightOpacity]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(22,163,74,0.55)', 'rgba(22,163,74,0.55)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[deckStyles.swipeCircle, {backgroundColor: '#16A34A'}]}>
            <Check size={38} color={colors.white} strokeWidth={3} />
          </View>
        </Animated.View>

        <Animated.View style={[deckStyles.swipeOverlay, leftOpacity]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(220,38,38,0.55)', 'rgba(220,38,38,0.55)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[deckStyles.swipeCircle, {backgroundColor: '#DC2626'}]}>
            <X size={38} color={colors.white} strokeWidth={3} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export function PrevCardsPeek({cards}: {cards: CourseListItem[]}) {
  if (cards.length === 0) return null;
  return (
    <View style={peekStyles.row}>
      {cards.map((c, i) => (
        <View
          key={`${c.id}-${i}`}
          style={[peekStyles.thumb, {opacity: 1 - i * 0.25, transform: [{scale: 1 - i * 0.06}]}]}>
          {c.universityLogo ? (
            <Image source={{uri: c.universityLogo}} style={peekStyles.img} resizeMode="cover" />
          ) : (
            <View style={peekStyles.fallback}>
              <Text style={peekStyles.initial}>{c.universityName?.charAt(0) ?? 'U'}</Text>
            </View>
          )}
          <View style={peekStyles.overlay} />
        </View>
      ))}
      <Text style={peekStyles.label} numberOfLines={1}>
        {cards[0].name}
      </Text>
    </View>
  );
}

type TutorialOverlayProps = {
  slideIndex: number;
  slides?: ReadonlyArray<{emoji: string; text: string}>;
  nextLabel?: string;
  doneLabel?: string;
  skipLabel?: string;
  onNext: () => void;
  onSkip: () => void;
};

export function DiscoverCardTutorialOverlay({
  slideIndex,
  slides = DISCOVER_TUTORIAL_SLIDES,
  nextLabel = 'Next',
  doneLabel = 'Done',
  skipLabel = 'Skip',
  onNext,
  onSkip,
}: TutorialOverlayProps) {
  const slide = slides[slideIndex] ?? slides[0];
  const isLast = slideIndex >= slides.length - 1;

  return (
    <View style={tutStyles.wrap} pointerEvents="auto" collapsable={false}>
      <View style={tutStyles.iconCircle}>
        <Text style={tutStyles.emoji}>{slide.emoji}</Text>
      </View>
      <Text style={tutStyles.text}>{slide.text}</Text>
      <TouchableOpacity
        style={tutStyles.btn}
        activeOpacity={0.85}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel={isLast ? doneLabel : nextLabel}>
        <Text style={tutStyles.btnLabel}>{isLast ? doneLabel : nextLabel}</Text>
      </TouchableOpacity>
      {!isLast ? (
        <TouchableOpacity
          onPress={onSkip}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={skipLabel}>
          <Text style={tutStyles.skip}>{skipLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

type DeckActionsProps = {
  topCourse: CourseListItem;
  remaining: number;
  bottomInset: number;
  onSwipeLeft: (c: CourseListItem) => void;
  onSwipeRight: (c: CourseListItem) => void;
  onTap: (c: CourseListItem) => void;
};

export function DiscoverDeckActions({
  topCourse,
  remaining,
  bottomInset,
  onSwipeLeft,
  onSwipeRight,
  onTap,
}: DeckActionsProps) {
  return (
    <View style={[deckStyles.actionsRow, {paddingBottom: bottomInset + 8}]}>
      <View style={deckStyles.actionsButtons}>
        <Pressable
          style={deckStyles.actionReject}
          onPress={() => onSwipeLeft(topCourse)}
          accessibilityLabel="Pass">
          <X size={28} color="#DC2626" strokeWidth={2.5} />
        </Pressable>
        <Pressable
          style={deckStyles.actionInfo}
          onPress={() => onTap(topCourse)}
          accessibilityLabel="Course details">
          <Info size={22} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
        <Pressable
          style={deckStyles.actionLike}
          onPress={() => onSwipeRight(topCourse)}
          accessibilityLabel="Shortlist">
          <Heart size={30} color={colors.white} fill={colors.white} />
        </Pressable>
      </View>
      <Text style={deckStyles.countText}>
        {remaining} course{remaining !== 1 ? 's' : ''} left
      </Text>
    </View>
  );
}

const deckStyles = StyleSheet.create({
  cardWrap: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: rad.xl,
    overflow: 'hidden',
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rad.xl,
  },
  swipeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckArea: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  deckTutorial: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    zIndex: 50,
    elevation: 50,
  },
  actionsRow: {
    alignItems: 'center',
    paddingTop: 10,
    gap: 8,
  },
  actionsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: H_PAD,
  },
  actionReject: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLike: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  countText: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
});

export const discoverDeckStyles = deckStyles;

const peekStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 8,
    gap: 6,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  img: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  initial: {fontSize: 14, fontWeight: '800', color: colors.navy, opacity: 0.4},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
});

const tutStyles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,22,44,0.82)',
    borderRadius: rad.xl + 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 32,
    zIndex: 30,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {fontSize: 32},
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
  },
  btn: {
    backgroundColor: colors.white,
    borderRadius: rad.full,
    paddingHorizontal: 52,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnLabel: {fontSize: 16, fontWeight: '800', color: colors.navy},
  skip: {fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.65)'},
});
