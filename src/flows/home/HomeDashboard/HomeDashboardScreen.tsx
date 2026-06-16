/**
 * HomeDashboardScreen — pixel-perfect match to Figma node 402:4486.
 *
 * Layout (top → bottom, scrollable):
 *   1. HomeHeader  — orange wave, "Hey there! / [Name]", bell, search bar
 *   2. YourJourney — step progress + active-match count + "View matches" CTA
 *   3. Your Top Matches — horizontal-scroll match cards with % badge
 *   4. Complete Profile — orange CTA card with circular progress
 *   5. Scholarships for You — list rows with star icon + status
 */
import React, {memo, useCallback, useMemo} from 'react';
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
} from 'react-native';
import {Search, Star, ChevronRight} from 'lucide-react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {BellIcon} from '../../../components/icons/TabIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad, font} from '../../../utils/sizes';
import type {CourseListItem, ApplicationDto} from '../../../api/types';

const {width: W} = Dimensions.get('window');
const H_PAD = hPad(5);

// ─── Types ───────────────────────────────────────────────────────────────────

type MatchCourse = CourseListItem & {matchPct?: number};

type Props = {
  firstName: string;
  courses: CourseListItem[] | undefined;
  applications: ApplicationDto[] | undefined;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSearchPress: () => void;
  onOpenCourse: (c: CourseListItem) => void;
  onViewMatches: () => void;
  onSeeAllMatches: () => void;
  onCompleteProfile: () => void;
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
  firstName,
  onBell,
  onSearchPress,
  insets,
}: {
  firstName: string;
  onBell: () => void;
  onSearchPress: () => void;
  insets: {top: number};
}) {
  return (
    <View style={header.wrap}>
      {/* ── Orange block: greeting + bell + search bar ── */}
      <View style={[header.orange, {paddingTop: insets.top + 12}]}>
        {/* Row: text left, bell right */}
        <View style={header.row}>
          <View>
            <Text style={header.hey}>Hey there!</Text>
            <Text style={header.name}>{firstName || 'Student'}</Text>
          </View>
          <Pressable onPress={onBell} style={header.bell} hitSlop={10}>
            <BellIcon size={20} color={colors.white} />
          </Pressable>
        </View>

        {/* Search bar sits at the bottom of the orange area */}
        <Pressable style={header.searchBar} onPress={onSearchPress}>
          <Search size={15} color={colors.textMuted} />
          <Text style={header.searchText}>Search university or courses</Text>
        </Pressable>
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
  wrap: {backgroundColor: colors.background},

  orange: {
    backgroundColor: colors.primary,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hey: {fontSize: FontSizes.chip, color: 'rgba(255,255,255,0.85)', fontWeight: Weights.regular, letterSpacing: 0.1},
  name: {fontSize: 26, color: colors.white, fontWeight: Weights.extrabold, letterSpacing: -0.5, marginTop: 2},
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
  searchText: {fontSize: FontSizes.small, color: colors.textMuted, flex: 1},

  /** S-curve strip below the orange block */
  wave: {height: WAVE_H, overflow: 'hidden'},
});

// ─── Your Journey card ────────────────────────────────────────────────────────

function JourneyCard({
  activeMatches,
  completedSteps,
  totalSteps,
  onViewMatches,
}: {
  activeMatches: number;
  completedSteps: number;
  totalSteps: number;
  onViewMatches: () => void;
}) {
  const dots = Array.from({length: totalSteps});
  return (
    <View style={journey.card}>
      {/* Top row */}
      <View style={journey.topRow}>
        <Text style={journey.title}>Your Journey</Text>
        <View style={journey.badge}>
          <Text style={journey.badgeNum}>{activeMatches}</Text>
          <Text style={journey.badgeLabel}> Active matches</Text>
        </View>
      </View>

      {/* Step dots */}
      <View style={journey.dotsRow}>
        {dots.map((_, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps;
          return (
            <React.Fragment key={i}>
              <View
                style={[
                  journey.dot,
                  done ? journey.dotDone : active ? journey.dotActive : journey.dotTodo,
                ]}
              />
              {i < totalSteps - 1 ? (
                <View
                  style={[
                    journey.line,
                    i < completedSteps ? journey.lineDone : journey.lineTodo,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>

      <Text style={journey.sub}>
        Step {completedSteps + 1} of {totalSteps} • Matches ready
      </Text>

      <Pressable style={journey.btn} onPress={onViewMatches}>
        <Text style={journey.btnLabel}>View matches</Text>
      </Pressable>
    </View>
  );
}

const journey = StyleSheet.create({
  card: {
    marginHorizontal: H_PAD,
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  title: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.navy},
  badge: {flexDirection: 'row', alignItems: 'center'},
  badgeNum: {fontSize: FontSizes.size15, fontWeight: Weights.extrabold, color: colors.primary},
  badgeLabel: {fontSize: FontSizes.caption, color: colors.textSecondary, fontWeight: Weights.medium},
  dotsRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  dot: {width: 14, height: 14, borderRadius: 7},
  dotDone: {backgroundColor: colors.accentTeal},
  dotActive: {backgroundColor: colors.primary, borderWidth: 3, borderColor: '#F5C9B8'},
  dotTodo: {backgroundColor: colors.border},
  line: {flex: 1, height: 3, marginHorizontal: -1},
  lineDone: {backgroundColor: colors.primary},
  lineTodo: {backgroundColor: colors.border},
  sub: {fontSize: FontSizes.caption, color: colors.textSecondary, marginBottom: 14},
  btn: {
    backgroundColor: colors.primary,
    borderRadius: rad.full,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.white},
});

// ─── Match card (horizontal scroll) ──────────────────────────────────────────

const CARD_W = 160;
const CARD_H = 210;

const MatchCard = memo(function MatchCard({
  c,
  matchPct,
  onPress,
}: {
  c: CourseListItem;
  matchPct: number;
  onPress: (c: CourseListItem) => void;
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

        {/* Match % badge */}
        <View style={match.pctBadge}>
          <Text style={match.pctText}>{matchPct}%{'\n'}Match</Text>
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
        <Text style={match.uni} numberOfLines={1}>
          {c.universityName?.toUpperCase()}
        </Text>
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
    backgroundColor: colors.yellowBadge,
    borderRadius: rad.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 52,
    alignItems: 'center',
  },
  pctText: {fontSize: 9, fontWeight: Weights.extrabold, color: '#1A1C29', textAlign: 'center', lineHeight: 13},
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
  info: {padding: 10, flex: 1},
  course: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.navy, lineHeight: 17, marginBottom: 4},
  uni: {fontSize: 9, fontWeight: Weights.semibold, color: colors.textSecondary, letterSpacing: 0.3},
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
  title: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.navy, letterSpacing: -0.3},
  action: {fontSize: FontSizes.chip, fontWeight: Weights.semibold, color: colors.primary},
});

// ─── Complete profile CTA card ────────────────────────────────────────────────

function CompleteProfileCard({
  profilePct,
  onAdd,
}: {
  profilePct: number;
  onAdd: () => void;
}) {
  // Circular progress ring
  const R = 24;
  const CIRC = 2 * Math.PI * R;
  const stroke = CIRC * (1 - profilePct / 100);

  return (
    <View style={profile.card}>
      <View style={profile.left}>
        <Text style={profile.title}>Complete your profile</Text>
        <Text style={profile.sub}>Add your grades to unlock more matches.</Text>
        <Pressable onPress={onAdd}>
          <Text style={profile.link}>Add now →</Text>
        </Pressable>
      </View>
      <View style={profile.ring}>
        <Svg width={60} height={60}>
          {/* Background ring */}
          <Circle cx={30} cy={30} r={R} stroke="rgba(255,255,255,0.3)" strokeWidth={5} fill="none" />
          {/* Progress ring */}
          <Circle
            cx={30}
            cy={30}
            r={R}
            stroke={colors.white}
            strokeWidth={5}
            fill="none"
            strokeDasharray={`${CIRC}`}
            strokeDashoffset={stroke}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
          />
        </Svg>
        <Text style={profile.pct}>{profilePct}%</Text>
      </View>
    </View>
  );
}

const profile = StyleSheet.create({
  card: {
    marginHorizontal: H_PAD,
    backgroundColor: colors.primary,
    borderRadius: rad.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  left: {flex: 1, marginRight: 12},
  title: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.white, marginBottom: 4},
  sub: {fontSize: FontSizes.caption, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginBottom: 8},
  link: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.white},
  ring: {width: 60, height: 60, alignItems: 'center', justifyContent: 'center'},
  pct: {position: 'absolute', fontSize: FontSizes.size11, fontWeight: Weights.bold, color: colors.white},
});

// ─── Scholarship row ──────────────────────────────────────────────────────────

function ScholarshipRow({
  name,
  sub,
  available,
  onApply,
}: {
  name: string;
  sub: string;
  available?: boolean;
  onApply?: () => void;
}) {
  return (
    <View style={schol.row}>
      <View style={schol.icon}>
        <Star size={14} color="#92400E" fill={colors.yellowBadge} />
      </View>
      <View style={schol.info}>
        <Text style={schol.name}>{name}</Text>
        <Text style={schol.sub}>{sub}</Text>
      </View>
      {available ? (
        <Text style={schol.available}>Available</Text>
      ) : (
        <Pressable onPress={onApply} hitSlop={8}>
          <Text style={schol.apply}>Apply now →</Text>
        </Pressable>
      )}
    </View>
  );
}

const schol = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  name: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.navy},
  sub: {fontSize: FontSizes.size11, color: colors.textSecondary, marginTop: 1},
  available: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.accentTeal},
  apply: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.primary},
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const HomeDashboardScreen = memo(function HomeDashboardScreen({
  firstName,
  courses,
  applications,
  loading,
  refreshing,
  onRefresh,
  onSearchPress,
  onOpenCourse,
  onViewMatches,
  onSeeAllMatches,
  onCompleteProfile,
  onBell,
}: Props) {
  const insets = useSafeAreaInsets();

  // Assign mock match % to courses (descending, so first is highest)
  const matchCourses: MatchCourse[] = useMemo(() => {
    const list = Array.isArray(courses) ? courses : [];
    return list.map((c, i) => ({
      ...c,
      matchPct: Math.max(60, 99 - i * 5),
    }));
  }, [courses]);

  const activeApps = useMemo(
    () =>
      Array.isArray(applications)
        ? applications.filter(a => a.status !== 'withdrawn' && a.status !== 'rejected')
        : [],
    [applications],
  );

  const handleCourse = useCallback(
    (c: CourseListItem) => onOpenCourse(c),
    [onOpenCourse],
  );

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{paddingBottom: insets.bottom + 32}}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }>

      {/* 1. Wave header + search */}
      <HomeHeader
        firstName={firstName}
        onBell={onBell}
        onSearchPress={onSearchPress}
        insets={insets}
      />

      {/* 2. Your Journey */}
      <View style={styles.section}>
        <JourneyCard
          activeMatches={activeApps.length > 0 ? activeApps.length : 3}
          completedSteps={2}
          totalSteps={5}
          onViewMatches={onViewMatches}
        />
      </View>

      {/* 3. Your Top Matches */}
      {matchCourses.length > 0 ? (
        <View style={[styles.section, {marginBottom: 24}]}>
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
              <MatchCard key={c.id} c={c} matchPct={c.matchPct ?? 80} onPress={handleCourse} />
            ))}
          </ScrollView>
        </View>
      ) : loading ? (
        <View style={styles.section}>
          <SectionHeader title="Your Top Matches" />
          <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 16}} />
        </View>
      ) : null}

      {/* 4. Complete profile */}
      <CompleteProfileCard profilePct={60} onAdd={onCompleteProfile} />

      {/* 5. Scholarships for You */}
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
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  flex: Styles.screen,
  section: {marginBottom: 20},
  hscroll: {paddingHorizontal: H_PAD, gap: 12},
  scholCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: H_PAD,
    overflow: 'hidden',
  },
});
