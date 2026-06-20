/**
 * HomeDashboardScreen — Figma discover_home_1_0 (node 402:4486).
 *
 * Layout (top → bottom, scrollable):
 *   1. HomeHeader  — orange wave, "Hey there! / [Name]", bell, search bar
 *   2. Your Top Matches — horizontal-scroll match cards (GET /recommendations/discover)
 *
 * Commented out (no API in API_Docs.md):
 *   - Your Journey
 *   - Complete your profile
 *   - Scholarships for You
 */
import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import {Search, Star} from 'lucide-react-native';
import Svg, {Path} from 'react-native-svg';
import {BellIcon} from '../../../components/icons/TabIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import type {CourseListItem, CourseSearchResult} from '../../../api/types';

const {width: W} = Dimensions.get('window');
const H_PAD = hPad(5);

// ─── Types ───────────────────────────────────────────────────────────────────

type MatchCourse = CourseListItem & {matchPct: number};

type Props = {
  displayName: string;
  matchCourses: MatchCourse[];
  hasPreferences: boolean;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: CourseSearchResult[];
  searchLoading: boolean;
  onSelectSearchCourse: (course: CourseSearchResult) => void;
  onOpenCourse: (c: MatchCourse) => void;
  onSeeAllMatches: () => void;
  onBell: () => void;
};

// ─── Wave header — greeting + search inside orange, wave S-curve at bottom ────
//
// Structure:
//   [orange block]  ← "Hey there!" / name / bell / search bar all on orange bg
//   [wave section]  ← SVG S-curve transitions orange→cream (decorative only)

const WAVE_H = 52;   // just the S-curve transition strip
const SVG_VB_W = 395;
const SVG_VB_H = 56; // cropped viewBox — only shows the bottom S-curve portion

function HomeHeader({
  displayName,
  onBell,
  searchQuery,
  onSearchChange,
  searchResults,
  searchLoading,
  onSelectSearchCourse,
  insets,
}: {
  displayName: string;
  onBell: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: CourseSearchResult[];
  searchLoading: boolean;
  onSelectSearchCourse: (course: CourseSearchResult) => void;
  insets: {top: number};
}) {
  const showDropdown = searchQuery.trim().length > 0;

  return (
    <View style={header.wrap}>
      {/* ── Orange block: greeting + bell + search bar ── */}
      <View style={[header.orange, {paddingTop: insets.top + 12}]}>
        {/* Row: text left, bell right */}
        <View style={header.row}>
          <View style={header.greetingCol}>
            <Text style={header.hey}>Hey there!</Text>
            <Text style={header.name} numberOfLines={1}>
              {displayName || 'Student'}
            </Text>
          </View>
          <Pressable onPress={onBell} style={header.bell} hitSlop={10}>
            <BellIcon size={20} color={colors.white} />
          </Pressable>
        </View>

        {/* Search bar with autocomplete dropdown */}
        <View style={header.searchWrap}>
          <View style={header.searchBar}>
            <Search size={15} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search courses"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              style={header.searchInput}
            />
            {searchLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
          </View>

          {showDropdown ? (
            <View style={header.dropdown}>
              {searchLoading && searchResults.length === 0 ? (
                <View style={header.dropdownItem}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((course, index) => (
                  <Pressable
                    key={course.id}
                    style={[
                      header.dropdownItem,
                      index < searchResults.length - 1 && header.dropdownItemBorder,
                    ]}
                    onPress={() => onSelectSearchCourse(course)}>
                    <Text style={header.dropdownText} numberOfLines={1}>
                      {course.name}
                    </Text>
                  </Pressable>
                ))
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Wave S-curve: orange fades to cream ── */}
      <View style={header.wave}>
        <Svg
          width={W}
          height={WAVE_H}
          viewBox={`0 0 ${SVG_VB_W} ${SVG_VB_H}`}
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}>
          {/* Path: fills the entire strip from y=0 down, with the S-curve at the bottom */}
          <Path
            d={`M0 0 H${SVG_VB_W} V18 C370 18 305 42 261 40 C218 38 174 22 131 22 C88 22 44 38 18 44 L0 ${SVG_VB_H} Z`}
            fill={colors.primary}
          />
        </Svg>
      </View>
    </View>
  );
}

const header = StyleSheet.create({
  wrap: {backgroundColor: colors.background, zIndex: 10},

  orange: {
    backgroundColor: colors.primary,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingCol: {flex: 1, marginRight: 12},
  hey: {
    fontSize: FontSizes.size15,
    color: colors.white,
    fontWeight: Weights.semibold,
    letterSpacing: 0,
  },
  name: {
    fontSize: 40,
    color: colors.white,
    fontWeight: Weights.extrabold,
    letterSpacing: -0.8,
    marginTop: 2,
    lineHeight: 44,
  },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  /** Search bar: white pill sitting on the orange background */
  searchWrap: {
    position: 'relative',
    zIndex: 20,
    overflow: 'visible',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: rad.full,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.small,
    color: colors.navy,
    letterSpacing: -0.14,
    paddingVertical: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: rad.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dropdownText: {
    fontSize: FontSizes.small,
    color: colors.navy,
    fontWeight: Weights.medium,
  },

  /** S-curve strip below the orange block */
  wave: {height: WAVE_H, overflow: 'hidden'},
});

// JourneyCard, CompleteProfileCard, ScholarshipRow removed — no API in API_Docs.md yet.

// ─── Match card (horizontal scroll) — Figma ~159×210 ─────────────────────────

const CARD_W = 159;
const CARD_H = 210;

const MatchCard = memo(function MatchCard({
  c,
  onPress,
}: {
  c: MatchCourse;
  onPress: (c: MatchCourse) => void;
}) {
  return (
    <Pressable onPress={() => onPress(c)} style={match.card}>
      {/* Photo area */}
      <View style={match.photo}>
        {c.universityLogo ? (
          <Image source={{uri: c.universityLogo}} style={match.img} />
        ) : (
          <View style={match.imgPlaceholder}>
            <Text style={match.imgInitial}>{c.universityName?.charAt(0) ?? 'U'}</Text>
          </View>
        )}

        {/* Match % badge — Figma #FEF3D6 / #AF6901 */}
        <View style={match.pctBadge}>
          <Text style={match.pctText}>{c.matchPct}% Match</Text>
        </View>

        {/* Prime badge */}
        {c.isPrime ? (
          <View style={match.primeBadge}>
            <Star size={9} color="#92400E" fill="#92400E" />
            <Text style={match.primeText}>Prime</Text>
          </View>
        ) : null}
      </View>

      {/* Info area */}
      <View style={match.info}>
        <Text style={match.course} numberOfLines={2}>{c.name}</Text>
        <View style={match.uniRow}>
          {c.universityLogo ? (
            <Image source={{uri: c.universityLogo}} style={match.uniLogo} />
          ) : (
            <View style={match.uniLogoPlaceholder} />
          )}
          <Text style={match.uni} numberOfLines={1}>
            {c.universityName?.toUpperCase()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const match = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  photo: {height: CARD_H * 0.58, position: 'relative', backgroundColor: colors.inputBg},
  img: {width: '100%', height: '100%'},
  imgPlaceholder: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgInitial: {fontSize: 40, fontWeight: Weights.extrabold, color: 'rgba(255,255,255,0.3)'},
  pctBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.matchBadgeBg,
    borderRadius: rad.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pctText: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.bold,
    color: colors.matchBadgeText,
    lineHeight: 13,
  },
  primeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderRadius: rad.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  primeText: {fontSize: 9, fontWeight: Weights.bold, color: '#92400E'},
  info: {padding: 10, flex: 1, justifyContent: 'center'},
  course: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.bold,
    color: colors.navy,
    lineHeight: 15,
    marginBottom: 6,
  },
  uniRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  uniLogo: {width: 14, height: 14, borderRadius: 7},
  uniLogoPlaceholder: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
  },
  uni: {
    flex: 1,
    fontSize: FontSizes.micro - 2,
    fontWeight: Weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0,
  },
});

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={sec.row}>
      <Text style={sec.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={sec.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const sec = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    marginBottom: 12,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: Weights.bold,
    color: colors.navy,
    letterSpacing: -0.16,
  },
  action: {fontSize: FontSizes.small, fontWeight: Weights.semibold, color: colors.primary},
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const HomeDashboardScreen = memo(function HomeDashboardScreen({
  displayName,
  matchCourses,
  hasPreferences,
  loading,
  refreshing,
  onRefresh,
  searchQuery,
  onSearchChange,
  searchResults,
  searchLoading,
  onSelectSearchCourse,
  onOpenCourse,
  onSeeAllMatches,
  onBell,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleCourse = useCallback(
    (c: MatchCourse) => onOpenCourse(c),
    [onOpenCourse],
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{paddingBottom: insets.bottom + 32}}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }>

      {/* 1. Wave header + search — GET /user/me (displayName) */}
      <HomeHeader
        displayName={displayName}
        onBell={onBell}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onSelectSearchCourse={onSelectSearchCourse}
        insets={insets}
      />

      {/*
      2. Your Journey — no API in API_Docs.md
      <View style={styles.section}>
        <JourneyCard
          activeMatches={3}
          completedSteps={2}
          totalSteps={5}
          onViewMatches={onViewMatches}
        />
      </View>
      */}

      {/* 3. Your Top Matches — GET /recommendations/discover */}
      {matchCourses.length > 0 ? (
        <View style={[styles.section, {marginTop: 4, marginBottom: 24}]}>
          <SectionHeader
            title="Your Top Matches"
            action="See all →"
            onAction={onSeeAllMatches}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hscroll}>
            {matchCourses.slice(0, 6).map(c => (
              <MatchCard key={c.id} c={c} onPress={handleCourse} />
            ))}
          </ScrollView>
        </View>
      ) : loading ? (
        <View style={styles.section}>
          <SectionHeader title="Your Top Matches" />
          <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 16}} />
        </View>
      ) : !hasPreferences ? (
        <View style={styles.section}>
          <SectionHeader title="Your Top Matches" />
          <Text style={styles.emptyHint}>
            Set your study preferences to see personalised matches.
          </Text>
        </View>
      ) : null}

      {/*
      4. Complete your profile — no API in API_Docs.md
      <CompleteProfileCard profilePct={60} onAdd={onCompleteProfile} />

      5. Scholarships for You — no API in API_Docs.md
      <View style={[styles.section, {marginBottom: 0}]}>
        <SectionHeader title="Scholarships for You" action="See all →" />
        <View style={styles.scholCard}>
          <ScholarshipRow
            name="Global Excellence Award"
            sub="Up to 50% tuition"
            available
          />
          <ScholarshipRow
            name="Global Excellence Award"
            sub="Up to 50% tuition"
            onApply={() => {}}
          />
        </View>
      </View>
      */}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  section: {marginBottom: 20},
  hscroll: {paddingHorizontal: H_PAD, gap: 12},
  emptyHint: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    paddingHorizontal: H_PAD,
    lineHeight: 20,
  },
});
