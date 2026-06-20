/**
 * DiscoverContainer — Figma node 407-4965
 *
 * Features:
 *  - Swipe deck (Reanimated 3 + GestureHandler 2)
 *  - Filter bottom sheet using /courses/filters API
 *  - Tap → CourseDetails via AppStack navigation
 *  - Tutorial overlay (shown once, AsyncStorage)
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SlidersHorizontal, X} from 'lucide-react-native';
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getDiscoverRecommendations} from '../../../api/recommendationApi';
import {getCourseFilters, getCourses} from '../../../api/publicApi';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {rad} from '../../../utils/sizes';
import {
  addToShortlist,
  getShortlist,
  resolveCourseId,
} from '../../../api/shortlistApi';
import type {CourseListItem, FilterOption} from '../../../api/types';
import type {AppStackList} from '../../../navigation/AppStackNavigator';
import {
  DiscoverCardTutorialOverlay,
  DiscoverDeckActions,
  discoverDeckStyles,
  H_PAD,
  PrevCardsPeek,
  SwipeCard,
} from './DiscoverSwipeDeck';

const {height: H} = Dimensions.get('window');
const TUTORIAL_KEY = 'discover_tutorial_seen_v2';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ActiveFilters = {
  degreeLevel?: string;
  country?: string;
  category?: string;
  intake?: string;
  fee?: string;
  sort?: string;
};

function DiscoverTutorialOverlay({onDone}: {onDone: () => void}) {
  const [slide, setSlide] = useState(0);

  const handleNext = useCallback(() => {
    if (slide >= 2) {
      onDone();
      return;
    }
    setSlide(s => s + 1);
  }, [onDone, slide]);

  return (
    <DiscoverCardTutorialOverlay
      slideIndex={slide}
      onNext={handleNext}
      onSkip={onDone}
    />
  );
}

// ─── Filter Sheet ──────────────────────────────────────────────────────────────

type FilterSection = {
  id: keyof ActiveFilters;
  label: string;
  options: FilterOption[];
};

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[fc.chip, active && fc.chipActive]}>
      <Text style={[fc.label, active && fc.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const fc = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: rad.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0EB',
  },
  label: {fontSize: 13, fontWeight: '500', color: colors.navy},
  labelActive: {color: colors.primary, fontWeight: '700'},
});

function FilterSheet({
  visible,
  filters,
  active,
  filtersLoading,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: FilterSection[];
  active: ActiveFilters;
  filtersLoading: boolean;
  onClose: () => void;
  onApply: (f: ActiveFilters) => void;
}) {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<ActiveFilters>(active);

  useEffect(() => {
    if (visible) setLocal(active);
  }, [visible, active]);

  const toggle = (key: keyof ActiveFilters, val: string) => {
    setLocal(prev => ({
      ...prev,
      [key]: prev[key] === val ? undefined : val,
    }));
  };

  const activeCount = Object.values(local).filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={fs.backdrop} onPress={onClose} />
      <View style={[fs.sheet, {paddingBottom: insets.bottom + 12}]}>
        {/* Handle */}
        <View style={fs.handle} />

        {/* Header */}
        <View style={fs.header}>
          <Text style={fs.title}>Filter Courses</Text>
          {activeCount > 0 ? (
            <Pressable onPress={() => setLocal({})}>
              <Text style={fs.clearAll}>Clear all ({activeCount})</Text>
            </Pressable>
          ) : null}
        </View>

        {filtersLoading ? (
          <View style={fs.loadWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={fs.scroll}
            contentContainerStyle={fs.scrollContent}
            showsVerticalScrollIndicator={false}>
            {filters.map(section => (
              <View key={section.id} style={fs.section}>
                <Text style={fs.secLabel}>{section.label}</Text>
                <View style={fs.chipRow}>
                  {section.options.map(opt => (
                    <FilterChip
                      key={String(opt.value)}
                      label={opt.label}
                      active={local[section.id] === String(opt.value)}
                      onPress={() => toggle(section.id, String(opt.value))}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Actions */}
        <View style={fs.actions}>
          <Pressable style={fs.clearBtn} onPress={() => setLocal({})}>
            <Text style={fs.clearLabel}>Clear</Text>
          </Pressable>
          <Pressable style={fs.applyBtn} onPress={() => onApply(local)}>
            <Text style={fs.applyLabel}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const fs = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: H * 0.80,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 16,
  },
  title: {fontSize: 18, fontWeight: '800', color: colors.navy},
  clearAll: {fontSize: 13, fontWeight: '600', color: colors.primary},
  loadWrap: {padding: 40, alignItems: 'center'},
  scroll: {flexShrink: 1},
  scrollContent: {paddingHorizontal: H_PAD, paddingBottom: 8},
  section: {marginBottom: 20},
  secLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipRow: {flexDirection: 'row', flexWrap: 'wrap'},
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearBtn: {
    flex: 1,
    height: 50,
    borderRadius: rad.full,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLabel: {fontSize: 15, fontWeight: '700', color: colors.primary},
  applyBtn: {
    flex: 2,
    height: 50,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {fontSize: 15, fontWeight: '800', color: colors.white},
});

// ─── Main Container ─────────────────────────────────────────────────────────────

export function DiscoverContainer() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();

  const [cardIndex,    setCardIndex]    = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [prevCards,    setPrevCards]    = useState<CourseListItem[]>([]);
  const tutorialChecked = useRef(false);

  // ── Fetch filters ─────────────────────────────────────────────────────────
  const {data: filtersDto, isLoading: filtersLoading} = useQuery({
    queryKey: ['courseFilters'],
    queryFn: getCourseFilters,
    staleTime: 30 * 60 * 1000,
  });

  // Build ordered filter sections from DTO
  const filterSections: FilterSection[] = useMemo(() => {
    if (!filtersDto) return [];
    return [
      {id: 'degreeLevel', label: 'Degree Level',  options: filtersDto.degree_levels ?? []},
      {id: 'country',     label: 'Destination',   options: filtersDto.countries     ?? []},
      {id: 'category',    label: 'Field of Study', options: filtersDto.categories   ?? []},
      {id: 'intake',      label: 'Intake',         options: filtersDto.intakes       ?? []},
      {id: 'fee',         label: 'Fee Range',      options: filtersDto.fees          ?? []},
      {id: 'sort',        label: 'Sort By',        options: filtersDto.sort          ?? []},
    ].filter(s => s.options.length > 0) as FilterSection[];
  }, [filtersDto]);

  // Active filter count for badge
  const filterCount = Object.values(activeFilters).filter(Boolean).length;

  // ── Fetch courses with active filters ────────────────────────────────────
  const coursesParams = useMemo(() => ({
    limit: 30,
    page: 1,
    degree_level: activeFilters.degreeLevel,
    destination:  activeFilters.country,
    category:     activeFilters.category,
    intake:       activeFilters.intake,
    fee:          activeFilters.fee,
    sort:         activeFilters.sort,
  }), [activeFilters]);

  const useFilteredBrowse = filterCount > 0;

  const {
    data: discoverData,
    isLoading: discoverLoading,
    refetch: refetchDiscover,
  } = useQuery({
    queryKey: ['discover', 'recommendations'],
    queryFn: () => getDiscoverRecommendations({page: 1, pageSize: 20}),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    enabled: isFocused && !useFilteredBrowse,
  });

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

  const {
    data: coursesPage,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['discover', 'courses', coursesParams],
    queryFn: () => getCourses(coursesParams),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    enabled: isFocused && useFilteredBrowse,
  });

  const matchByCourseId = useMemo(() => {
    const map: Record<number, number> = {};
    discoverData?.results?.forEach(r => {
      const id = r.course.id ?? r.courseId;
      map[id] = r.matchScore;
    });
    return map;
  }, [discoverData?.results]);

  const whyMatchByCourseId = useMemo(() => {
    const map: Record<number, string[]> = {};
    discoverData?.results?.forEach(r => {
      if (r.whyMatch?.length) {
        const id = r.course.id ?? r.courseId;
        map[id] = r.whyMatch;
      }
    });
    return map;
  }, [discoverData?.results]);

  const courses = useMemo(() => {
    if (useFilteredBrowse) {
      return coursesPage?.courses ?? [];
    }
    return (discoverData?.results ?? []).map(r => ({
      ...r.course,
      id: r.course.id ?? r.courseId,
    }));
  }, [useFilteredBrowse, coursesPage?.courses, discoverData?.results]);

  const hasRecommendationPreferences = discoverData?.hasPreferences === true;

  // Reset card index when filters change
  useEffect(() => {
    setCardIndex(0);
  }, [activeFilters]);

  // Reload recommendations and reset deck whenever Discover tab is opened
  useFocusEffect(
    useCallback(() => {
      setCardIndex(0);
      setPrevCards([]);
      if (useFilteredBrowse) {
        void queryClient.invalidateQueries({
          queryKey: ['discover', 'courses'],
        });
        void refetchCourses();
      } else {
        void queryClient.invalidateQueries({
          queryKey: ['discover', 'recommendations'],
        });
        void refetchDiscover();
      }
    }, [useFilteredBrowse, queryClient, refetchCourses, refetchDiscover]),
  );

  // ── Tutorial ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tutorialChecked.current) return;
    tutorialChecked.current = true;
    AsyncStorage.getItem(TUTORIAL_KEY).then(val => {
      if (!val) setShowTutorial(true);
    });
  }, []);

  const dismissTutorial = useCallback(async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem(TUTORIAL_KEY, '1');
  }, []);

  // ── Card handlers ─────────────────────────────────────────────────────────
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
    [shortlistedIds, queryClient],
  );
  const onSwipeLeft = useCallback((c: CourseListItem) => {
    setPrevCards(prev => [c, ...prev].slice(0, 3));
    setCardIndex(i => i + 1);
  }, []);
  const onTap = useCallback(
    (c: CourseListItem) => {
      const matchResult = discoverData?.results?.find(
        r => (r.course.id ?? r.courseId) === c.id,
      );
      const whyMatch = matchResult?.whyMatch ?? whyMatchByCourseId[c.id] ?? [];
      navigation.navigate('CourseDetails', {
        courseId: c.id,
        matchPct: matchResult?.matchScore ?? matchByCourseId[c.id] ?? 88,
        courseData: JSON.stringify(c),
        whyMatchData: JSON.stringify(whyMatch),
      });
    },
    [discoverData?.results, matchByCourseId, whyMatchByCourseId, navigation],
  );

  // ── Filter handlers ───────────────────────────────────────────────────────
  const applyFilters = useCallback((f: ActiveFilters) => {
    setActiveFilters(f);
    setFilterOpen(false);
  }, []);

  // ── Render deck ───────────────────────────────────────────────────────────
  const visibleCourses = courses.slice(cardIndex, cardIndex + 3);
  const total     = courses.length;
  const remaining = Math.max(0, total - cardIndex);
  const topCourse = visibleCourses[0];
  const isLoading = useFilteredBrowse ? coursesLoading : discoverLoading;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.root, {paddingTop: insets.top}]}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Pressable
            style={styles.filterBtn}
            onPress={() => setFilterOpen(true)}>
            <SlidersHorizontal size={18} color={colors.white} strokeWidth={2} />
            {filterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Active filter chips summary */}
        {filterCount > 0 ? (
          <View style={styles.activeBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeBarContent}>
              {Object.entries(activeFilters)
                .filter(([, v]) => !!v)
                .map(([k, v]) => (
                  <Pressable
                    key={k}
                    style={styles.activePill}
                    onPress={() =>
                      setActiveFilters(prev => ({...prev, [k]: undefined}))
                    }>
                    <Text style={styles.activePillText}>{v}</Text>
                    <X size={10} color={colors.primary} strokeWidth={3} />
                  </Pressable>
                ))}
              <Pressable
                style={styles.clearAllPill}
                onPress={() => setActiveFilters({})}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            </ScrollView>
          </View>
        ) : null}

        {/* ── Prev cards peek ────────────────────────────────────────────── */}
        <PrevCardsPeek cards={prevCards} />

        {/* ── Card deck ──────────────────────────────────────────────────── */}
        <View style={styles.deckArea}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : visibleCourses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {total === 0 ? 'No courses found' : 'All caught up! 🎉'}
              </Text>
              <Text style={styles.emptySub}>
                {total === 0
                  ? filterCount > 0
                    ? 'Try adjusting your filters'
                    : !hasRecommendationPreferences
                      ? 'Complete your study preferences to see personalised matches'
                      : 'Check your connection and try again'
                  : "You've reviewed all recommendations"}
              </Text>
              {total === 0 && filterCount > 0 ? (
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => setActiveFilters({})}>
                  <Text style={styles.resetLabel}>Reset filters</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            [...visibleCourses].reverse().map((c, revIdx) => {
              const si    = visibleCourses.length - 1 - revIdx;
              const isTop = si === 0;
              const mPct =
                matchByCourseId[c.id] ??
                Math.max(60, 99 - cardIndex * 2 - si * 5);
              return (
                <SwipeCard
                  key={`${c.id}-${cardIndex}`}
                  course={c}
                  matchPct={mPct}
                  isTop={isTop}
                  stackIndex={si}
                  gesturesEnabled={!(isTop && showTutorial)}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft}
                  onTap={onTap}
                />
              );
            })
          )}
          {showTutorial && visibleCourses.length > 0 && !isLoading ? (
            <View style={styles.deckTutorial} pointerEvents="box-none">
              <DiscoverTutorialOverlay onDone={dismissTutorial} />
            </View>
          ) : null}
        </View>

        {topCourse && !isLoading ? (
          <DiscoverDeckActions
            topCourse={topCourse}
            remaining={remaining}
            bottomInset={insets.bottom}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            onTap={onTap}
          />
        ) : null}
      </View>

      {/* ── Filter Sheet ───────────────────────────────────────────────── */}
      <FilterSheet
        visible={filterOpen}
        filters={filterSections}
        active={activeFilters}
        filtersLoading={filtersLoading}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
      />
    </GestureHandlerRootView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {flex: 1},
  root: {flex: 1, backgroundColor: colors.background},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: FontSizes.display,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {fontSize: FontSizes.micro, fontWeight: Weights.extrabold, color: colors.white},

  // Active filter bar
  activeBar: {
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  activeBarContent: {
    paddingHorizontal: H_PAD,
    gap: 8,
    flexDirection: 'row',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0EB',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activePillText: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.primary},
  clearAllPill: {
    backgroundColor: colors.inputBg,
    borderRadius: rad.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  clearAllText: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.textSecondary},

  // Deck
  deckArea: discoverDeckStyles.deckArea,
  deckTutorial: discoverDeckStyles.deckTutorial,
  empty: {alignItems: 'center', gap: 10, paddingHorizontal: 32},
  emptyTitle: {fontSize: FontSizes.large, fontWeight: Weights.bold, color: colors.navy, textAlign: 'center'},
  emptySub: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
  },
  resetLabel: {fontSize: FontSizes.small, fontWeight: Weights.bold, color: colors.white},
});
