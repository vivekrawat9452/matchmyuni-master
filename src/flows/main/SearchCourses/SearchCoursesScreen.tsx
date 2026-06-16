/**
 * SearchCoursesScreen — Browse / filter / search courses
 *
 * Filter chips (horizontal scroll) use real /courses/filters API options:
 *   degree_levels, countries, categories, intakes, fees, sort
 *
 * Tapping a chip opens an Alert picker with real options from the API.
 */
import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import {
  Search,
  MapPin,
  GraduationCap,
  Clock,
  X,
  Star,
  ChevronDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad, font} from '../../../utils/sizes';
import type {CourseListItem, CourseFiltersDto} from '../../../api/types';
import type {ActiveFilters} from './SearchCoursesContainer';

const H_PAD = hPad(5);

// ─── Prop types ───────────────────────────────────────────────────────────────

type Props = {
  query: string;
  onQueryChange: (t: string) => void;
  courses: CourseListItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onOpenCourse: (c: CourseListItem) => void;
  filters: CourseFiltersDto | null;
  activeFilters: ActiveFilters;
  activeFilterCount: number;
  onSetFilter: <K extends keyof ActiveFilters>(key: K, val: ActiveFilters[K]) => void;
  onClearFilter: (key: keyof ActiveFilters) => void;
  onClearAllFilters: () => void;
};

// ─── Filter chip ──────────────────────────────────────────────────────────────

const FilterChip = memo(function FilterChip({
  icon,
  label,
  active,
  onPress,
  onClear,
}: {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <Pressable
      onPress={active ? undefined : onPress}
      style={[chipS.wrap, active && chipS.wrapActive]}>
      {icon ? <View style={chipS.icon}>{icon}</View> : null}
      <Text style={[chipS.label, active && chipS.labelActive]} numberOfLines={1}>
        {label}
      </Text>
      {active ? (
        <Pressable onPress={onClear} hitSlop={6} style={chipS.xBtn}>
          <X size={10} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      ) : (
        <ChevronDown size={10} color={colors.textSecondary} />
      )}
    </Pressable>
  );
});

const chipS = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.inputBg,
    borderRadius: rad.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 160,
  },
  wrapActive: {backgroundColor: '#FFF4EE', borderColor: colors.primary},
  icon: {marginRight: 1},
  label: {fontSize: FontSizes.caption, fontWeight: Weights.medium, color: colors.textSecondary, flex: 1},
  labelActive: {color: colors.primary, fontWeight: Weights.bold},
  xBtn: {marginLeft: 2},
});

// ─── Course card ──────────────────────────────────────────────────────────────

const CourseCard = memo(function CourseCard({
  item,
  onPress,
}: {
  item: CourseListItem;
  onPress: (c: CourseListItem) => void;
}) {
  const location = [item.city, item.country].filter(Boolean).join(', ');
  const fee = item.applicableTuitionFee != null
    ? `${item.currencySymbol ?? ''}${item.applicableTuitionFee.toLocaleString()}/yr`
    : null;

  return (
    <Pressable onPress={() => onPress(item)} style={cardS.wrap}>
      <View style={cardS.top}>
        <Text style={cardS.uni} numberOfLines={1}>{item.universityName}</Text>
        <View style={cardS.right}>
          {item.isPrime ? (
            <View style={cardS.prime}>
              <Star size={9} color="#92400E" fill="#92400E" />
              <Text style={cardS.primeText}>Prime</Text>
            </View>
          ) : null}
          {fee ? <Text style={cardS.fee}>{fee}</Text> : null}
        </View>
      </View>

      <Text style={cardS.name} numberOfLines={2}>{item.name}</Text>

      <View style={cardS.meta}>
        {item.degreeLevel ? (
          <View style={cardS.metaChip}>
            <GraduationCap size={9} color={colors.primary} />
            <Text style={[cardS.metaText, {color: colors.primary}]}>{item.degreeLevel}</Text>
          </View>
        ) : null}
        {item.duration ? (
          <View style={cardS.metaChip}>
            <Clock size={9} color={colors.textSecondary} />
            <Text style={cardS.metaText}>{item.duration} yr{item.duration > 1 ? 's' : ''}</Text>
          </View>
        ) : null}
        {location ? (
          <View style={cardS.metaChip}>
            <MapPin size={9} color={colors.textMuted} />
            <Text style={[cardS.metaText, {color: colors.textMuted}]}>{location}</Text>
          </View>
        ) : null}
        {item.scholarshipOnTuitionFee ? (
          <View style={cardS.metaChip}>
            <Text style={[cardS.metaText, {color: colors.accentTeal}]}>
              🎓 {item.scholarshipOnTuitionFee}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});

const cardS = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  top: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4},
  uni: {flex: 1, fontSize: FontSizes.size11, fontWeight: Weights.semibold, color: colors.primary, letterSpacing: 0.1},
  right: {flexDirection: 'row', alignItems: 'center', gap: 6},
  prime: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FEF3C7', borderRadius: rad.sm, paddingHorizontal: 6, paddingVertical: 2,
  },
  primeText: {fontSize: 9, fontWeight: Weights.bold, color: '#92400E'},
  fee: {fontSize: FontSizes.caption, fontWeight: Weights.extrabold, color: colors.navy},
  name: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.navy, lineHeight: 20, marginBottom: 8},
  meta: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.inputBg, borderRadius: rad.sm, paddingHorizontal: 7, paddingVertical: 3,
  },
  metaText: {fontSize: FontSizes.micro, fontWeight: Weights.semibold, color: colors.textSecondary},
});

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({query, loading}: {query: string; loading: boolean}) {
  if (loading) return null;
  return (
    <View style={emptyS.wrap}>
      <Search size={36} color={colors.textMuted} strokeWidth={1.5} />
      <Text style={emptyS.title}>
        {query.length > 1 ? 'No courses found' : 'Search courses'}
      </Text>
      <Text style={emptyS.body}>
        {query.length > 1
          ? `No results for "${query}". Try adjusting your filters.`
          : 'Type a keyword or use filters to browse courses.'}
      </Text>
    </View>
  );
}
const emptyS = StyleSheet.create({
  wrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 60},
  title: {fontSize: font.subtitle, fontWeight: Weights.bold, color: colors.navy, marginTop: 12, textAlign: 'center'},
  body: {fontSize: FontSizes.chip, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18},
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export function SearchCoursesScreen({
  query,
  onQueryChange,
  courses,
  loading,
  loadingMore,
  hasMore,
  totalCount,
  onLoadMore,
  onOpenCourse,
  filters,
  activeFilters,
  activeFilterCount,
  onSetFilter,
  onClearFilter,
  onClearAllFilters,
}: Props) {
  const insets = useSafeAreaInsets();

  // ── Pickers — use real API option lists ────────────────────────────────────

  const pick = useCallback(
    (
      title: string,
      options: {label: string; value: string | number}[] | undefined,
      key: keyof ActiveFilters,
    ) => {
      if (!options?.length) {
        Alert.alert(title, 'Loading options…');
        return;
      }
      Alert.alert(title, 'Select one', [
        ...options.slice(0, 10).map(o => ({
          text: o.label,
          onPress: () => onSetFilter(key, String(o.value)),
        })),
        {text: 'Cancel', style: 'cancel'},
      ]);
    },
    [onSetFilter],
  );

  const pickDegree = useCallback(() => pick('Degree Level', filters?.degree_levels, 'degreeLevel'), [pick, filters]);
  const pickDest   = useCallback(() => pick('Country / Destination', filters?.countries, 'destination'), [pick, filters]);
  const pickCat    = useCallback(() => pick('Category', filters?.categories, 'category'), [pick, filters]);
  const pickIntake = useCallback(() => pick('Intake', filters?.intakes, 'intake'), [pick, filters]);
  const pickFee    = useCallback(() => pick('Fee Range', filters?.fees, 'fee'), [pick, filters]);
  const pickSort   = useCallback(() => pick('Sort by', filters?.sort, 'sort'), [pick, filters]);

  // Active label helpers (show selected value's label not raw value)
  const feeLabel = activeFilters.fee
    ? (filters?.fees.find(f => f.value === activeFilters.fee)?.label ?? activeFilters.fee)
    : 'Fee Range';
  const sortLabel = activeFilters.sort
    ? (filters?.sort.find(s => s.value === activeFilters.sort)?.label?.split('(')[0].trim() ?? 'Sort')
    : 'Sort';

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderItem = useCallback<ListRenderItem<CourseListItem>>(
    ({item}) => <CourseCard item={item} onPress={onOpenCourse} />,
    [onOpenCourse],
  );
  const keyExtractor = useCallback((c: CourseListItem) => String(c.id), []);

  const ListFooter = useCallback(() => {
    if (loadingMore) return <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />;
    if (!hasMore && courses.length > 0) return <Text style={styles.endText}>All {totalCount.toLocaleString()} courses loaded</Text>;
    return null;
  }, [loadingMore, hasMore, courses.length, totalCount]);

  const ListHeader = useCallback(() => {
    if (!totalCount || loading) return null;
    return <Text style={styles.resultCount}>{totalCount.toLocaleString()} course{totalCount !== 1 ? 's' : ''} found</Text>;
  }, [totalCount, loading]);

  const ListEmpty = useCallback(
    () => <EmptyState query={query} loading={loading} />,
    [query, loading],
  );

  return (
    <View style={styles.flex}>

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <View style={[styles.header, {paddingTop: insets.top + 10}]}>

        {/* Search input */}
        <View style={styles.searchRow}>
          <Search size={16} color={colors.textMuted} style={{marginRight: 8}} />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search courses, universities…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={styles.searchInput}
          />
          {loading && query.length > 0 ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>

        {/* Filter chips — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>

          {/* Clear all */}
          {activeFilterCount > 0 ? (
            <Pressable style={styles.clearAll} onPress={onClearAllFilters}>
              <X size={11} color={colors.white} strokeWidth={2.5} />
              <Text style={styles.clearAllText}>Clear ({activeFilterCount})</Text>
            </Pressable>
          ) : null}

          <FilterChip
            icon={<GraduationCap size={11} color={activeFilters.degreeLevel ? colors.primary : colors.textSecondary} />}
            label={activeFilters.degreeLevel ?? 'Degree'}
            active={!!activeFilters.degreeLevel}
            onPress={pickDegree}
            onClear={() => onClearFilter('degreeLevel')}
          />

          <FilterChip
            icon={<MapPin size={11} color={activeFilters.destination ? colors.primary : colors.textSecondary} />}
            label={activeFilters.destination ?? 'Country'}
            active={!!activeFilters.destination}
            onPress={pickDest}
            onClear={() => onClearFilter('destination')}
          />

          <FilterChip
            label={activeFilters.category ?? 'Category'}
            active={!!activeFilters.category}
            onPress={pickCat}
            onClear={() => onClearFilter('category')}
          />

          <FilterChip
            icon={<Calendar size={11} color={activeFilters.intake ? colors.primary : colors.textSecondary} />}
            label={activeFilters.intake ?? 'Intake'}
            active={!!activeFilters.intake}
            onPress={pickIntake}
            onClear={() => onClearFilter('intake')}
          />

          <FilterChip
            icon={<DollarSign size={11} color={activeFilters.fee ? colors.primary : colors.textSecondary} />}
            label={feeLabel}
            active={!!activeFilters.fee}
            onPress={pickFee}
            onClear={() => onClearFilter('fee')}
          />

          <FilterChip
            icon={<ArrowUpDown size={11} color={activeFilters.sort ? colors.primary : colors.textSecondary} />}
            label={sortLabel}
            active={!!activeFilters.sort}
            onPress={pickSort}
            onClear={() => onClearFilter('sort')}
          />
        </ScrollView>
      </View>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {loading && courses.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.mainSpinner} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          onEndReached={hasMore ? onLoadMore : undefined}
          onEndReachedThreshold={0.4}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={8}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: Styles.screen,
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: H_PAD,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },
  searchInput: {flex: 1, fontSize: FontSizes.size15, color: colors.textPrimary},
  chipsRow: {flexDirection: 'row', gap: 8, paddingRight: H_PAD, alignItems: 'center'},
  clearAll: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: rad.full, paddingHorizontal: 10, paddingVertical: 7,
  },
  clearAllText: {fontSize: FontSizes.caption, fontWeight: Weights.bold, color: colors.white},
  mainSpinner: {marginTop: 60},
  spinner: {marginVertical: 16},
  listContent: {padding: H_PAD, paddingTop: 10, flexGrow: 1},
  resultCount: {fontSize: FontSizes.caption, color: colors.textSecondary, marginBottom: 10, fontWeight: Weights.medium},
  endText: {textAlign: 'center', fontSize: FontSizes.caption, color: colors.textMuted, marginVertical: 16},
});
