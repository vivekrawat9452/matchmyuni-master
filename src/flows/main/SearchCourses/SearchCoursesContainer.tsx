/**
 * SearchCoursesContainer (Discover → Search tab)
 *
 * GET /courses  — all filter params wired to real API shape:
 *   search, degree_level, destination, intake, fee ("0-2500"), sort ("field,order")
 *
 * GET /courses/filters — populates picker options (real field names):
 *   degree_levels, countries, categories, intakes, fees, sort, universities
 */
import React, {useState, useCallback, useMemo, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useInfiniteQuery} from '@tanstack/react-query';
import {SearchCoursesScreen} from './SearchCoursesScreen';
import {getCourses, getCourseFilters} from '../../../api/publicApi';
import type {CourseListItem} from '../../../api/types';
import type {AppStackList} from '../../../navigation/AppStackNavigator';

const PAGE_SIZE = 15;

export type ActiveFilters = {
  degreeLevel?: string;   // degree_level param
  destination?: string;   // destination param (country)
  category?: string;      // category param
  intake?: string;        // intake param
  fee?: string;           // "0-2500" combined string
  sort?: string;          // "applicableTuitionFee,asc" combined string
};

export function SearchCoursesContainer() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackList>>();

  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQ, setDebouncedQ] = useState('');

  const onQueryChange = useCallback((t: string) => {
    setQuery(t);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(t), 300);
  }, []);

  // ── Filter options ─────────────────────────────────────────────────────────
  const {data: filters} = useQuery({
    queryKey: ['courses', 'filters'],
    queryFn: getCourseFilters,
    staleTime: 30 * 60 * 1000,
  });

  // ── Paginated course list ──────────────────────────────────────────────────
  const {
    data: pages,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['courses', 'search', debouncedQ, activeFilters],
    queryFn: ({pageParam = 1}) =>
      getCourses({
        search:       debouncedQ || undefined,
        degree_level: activeFilters.degreeLevel,
        destination:  activeFilters.destination,
        category:     activeFilters.category,
        intake:       activeFilters.intake,
        fee:          activeFilters.fee,
        sort:         activeFilters.sort,
        page:         pageParam as number,
        limit:        PAGE_SIZE,
      }),
    initialPageParam: 1,
    // Use totalPages from the real API
    getNextPageParam: last =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });

  const courses = useMemo(
    () => pages?.pages.flatMap(p => p.courses) ?? [],
    [pages],
  );

  const totalCount = pages?.pages[0]?.total ?? 0;

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const onSetFilter = useCallback(
    <K extends keyof ActiveFilters>(key: K, val: ActiveFilters[K]) => {
      setActiveFilters(prev => ({...prev, [key]: val}));
    },
    [],
  );

  const onClearFilter = useCallback((key: keyof ActiveFilters) => {
    setActiveFilters(prev => {
      const next = {...prev};
      delete next[key];
      return next;
    });
  }, []);

  const onClearAllFilters = useCallback(() => setActiveFilters({}), []);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Navigate to CourseDetails ──────────────────────────────────────────────
  const onOpenCourse = useCallback(
    (c: CourseListItem) => {
      navigation.navigate('CourseDetails', {courseId: c.id, matchPct: 88});
    },
    [navigation],
  );

  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).filter(v => v !== undefined).length,
    [activeFilters],
  );

  return (
    <SearchCoursesScreen
      query={query}
      onQueryChange={onQueryChange}
      courses={courses}
      loading={isFetching && !isFetchingNextPage}
      loadingMore={isFetchingNextPage}
      hasMore={!!hasNextPage}
      totalCount={totalCount}
      onLoadMore={onLoadMore}
      onOpenCourse={onOpenCourse}
      filters={filters ?? null}
      activeFilters={activeFilters}
      activeFilterCount={activeFilterCount}
      onSetFilter={onSetFilter}
      onClearFilter={onClearFilter}
      onClearAllFilters={onClearAllFilters}
    />
  );
}
