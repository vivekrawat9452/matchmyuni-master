/**
 * Applications tab — Figma nodes 593:1755 (Shortlist) + 593:2244 (Applied)
 *
 * Shortlist data: GET /api/user/shortlist
 * Applied data: GET /applications
 *
 * Commented for later (no API field on list response):
 *  - Match % badge on cards
 *  - Course duration / intake on Applied cards
 *  - Prime badge on Applied cards
 *  - Submitted date footer on Applied cards
 */
import React, {memo, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import {Check} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WaveHeader} from '../../../components/WaveHeader';
import {StarIcon} from '../../../components/icons/ApplicationIcons';
import type {ApplicationListItemDto, CourseListItem} from '../../../api/types';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';
import {
  APPLIED_PIPELINE_STEPS,
  appliedStatusShortLabel,
  getAppliedPipelineState,
} from './applicationStatus';

const H_PAD = hPad(5);
export const MAX_STUDENT_APPLICATIONS = 5;

export type ApplicationsTab = 'shortlist' | 'applied';

export type ApplicationsScreenProps = {
  tab: ApplicationsTab;
  onTabChange: (tab: ApplicationsTab) => void;
  shortlist: CourseListItem[];
  applications: ApplicationListItemDto[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onStartApplication: (course: CourseListItem) => void;
  onOpenCourse: (course: CourseListItem) => void;
  onTrackApplication: (item: ApplicationListItemDto) => void;
  onAddApplication?: () => void;
  onRemoveShortlist?: (courseId: number) => void;
  shortlistBusyId?: number | null;
};

function UnderlineTabs({
  tab,
  onTabChange,
}: {
  tab: ApplicationsTab;
  onTabChange: (t: ApplicationsTab) => void;
}) {
  return (
    <View style={tabs.wrap}>
      <Pressable
        style={tabs.tab}
        onPress={() => onTabChange('shortlist')}
        accessibilityRole="tab"
        accessibilityState={{selected: tab === 'shortlist'}}>
        <Text style={[tabs.label, tab === 'shortlist' && tabs.labelActive]}>
          {en.applicationsTab.shortlist}
        </Text>
        {tab === 'shortlist' ? <View style={tabs.indicator} /> : <View style={tabs.indicatorSpacer} />}
      </Pressable>
      <Pressable
        style={tabs.tab}
        onPress={() => onTabChange('applied')}
        accessibilityRole="tab"
        accessibilityState={{selected: tab === 'applied'}}>
        <Text style={[tabs.label, tab === 'applied' && tabs.labelActive]}>
          {en.applicationsTab.applied}
        </Text>
        {tab === 'applied' ? <View style={tabs.indicator} /> : <View style={tabs.indicatorSpacer} />}
      </Pressable>
    </View>
  );
}


const AppliedPipelineStepper = memo(function AppliedPipelineStepper({
  status,
}: {
  status: string;
}) {
  const {completedThrough, activeIndex} = getAppliedPipelineState(status);

  return (
    <View style={pipeline.wrap}>
      <View style={pipeline.track}>
        {APPLIED_PIPELINE_STEPS.map((label, i) => {
          const done = i <= completedThrough;
          const active = activeIndex != null && i === activeIndex;
          const last = i === APPLIED_PIPELINE_STEPS.length - 1;
          return (
            <View key={label} style={pipeline.step}>
              <View style={pipeline.dotRow}>
                <View
                  style={[
                    pipeline.dot,
                    done && pipeline.dotDone,
                    active && pipeline.dotActive,
                  ]}>
                  {done ? (
                    <Check size={10} color={colors.white} strokeWidth={3} />
                  ) : active ? (
                    <View style={pipeline.dotActiveInner} />
                  ) : null}
                </View>
                {!last ? (
                  <View
                    style={[
                      pipeline.line,
                      i < completedThrough + 1 && pipeline.lineDone,
                    ]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  pipeline.label,
                  done && pipeline.labelDone,
                  active && pipeline.labelActive,
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const ShortlistCard = memo(function ShortlistCard({
  course,
  onPress,
  onStart,
  onRemove,
  removing,
}: {
  course: CourseListItem;
  onPress: () => void;
  onStart: () => void;
  onRemove?: () => void;
  removing?: boolean;
}) {
  const intake =
    course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0] ?? null;

  return (
    <Pressable style={card.wrap} onPress={onPress}>
      <View style={card.top}>
        <Text style={card.courseName} numberOfLines={2}>
          {course.name}
        </Text>
        {/* Match % — no field in GET /api/user/shortlist; restore when API adds matchScore
        {matchPct != null ? (
          <View style={card.matchBadge}>
            <Text style={card.matchText}>{matchPct}% Match</Text>
          </View>
        ) : null}
        */}
      </View>

      <View style={card.uniRow}>
        {course.universityLogo ? (
          <Image
            source={{uri: course.universityLogo}}
            style={card.uniLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={card.uniDot} />
        )}
        <Text style={card.uniName} numberOfLines={1}>
          {course.universityName?.toUpperCase()}
        </Text>
      </View>

      <View style={card.statsRow}>
        {course.duration ? (
          <Text style={card.stat}>
            {course.duration} year{course.duration > 1 ? 's' : ''}
          </Text>
        ) : null}
        {intake ? <Text style={card.stat}>• {intake}</Text> : null}
      </View>

      {course.isPrime ? (
        <View style={card.primeBadge}>
          <StarIcon size={10} color={colors.navy} />
          <Text style={card.primeText}>Prime</Text>
        </View>
      ) : null}

      <View style={card.footer}>
        <Text style={card.statusLabel}>{en.applicationsTab.shortlistedStatus}</Text>
        <Pressable onPress={onStart} hitSlop={8}>
          <Text style={card.footerCta}>{en.applicationsTab.startApplication}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const AppliedCard = memo(function AppliedCard({
  item,
  onTrack,
}: {
  item: ApplicationListItemDto;
  onTrack: () => void;
}) {
  const {course, application, university} = item;
  // const submittedAt = application.submittedAt;

  return (
    <View style={card.wrap}>
      <View style={card.top}>
        <Text style={card.courseName} numberOfLines={2}>
          {course.name}
        </Text>
        {/* Match % — no field in GET /applications; restore when API adds matchScore
        {matchPct != null ? (
          <View style={card.matchBadge}>
            <Text style={card.matchText}>{matchPct}% Match</Text>
          </View>
        ) : null}
        */}
      </View>

      <View style={card.uniRow}>
        {university.logoUrl ?? course.universityLogo ? (
          <Image
            source={{uri: university.logoUrl ?? course.universityLogo}}
            style={card.uniLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={card.uniDot} />
        )}
        <Text style={card.uniName} numberOfLines={1}>
          {(university.name ?? course.universityName)?.toUpperCase()}
        </Text>
      </View>

      {/* Duration / intake — not on GET /applications course payload; restore when API adds fields
      <View style={card.statsRow}>
        {course.duration ? (
          <Text style={card.stat}>
            {course.duration} year{course.duration > 1 ? 's' : ''}
          </Text>
        ) : null}
        {intake ? <Text style={card.stat}>• {intake}</Text> : null}
      </View>
      */}

      {/* Prime — not on GET /applications; restore when API adds isPrime
      {course.isPrime ? (
        <View style={card.primeBadge}>
          <StarIcon size={10} color={colors.navy} />
          <Text style={card.primeText}>Prime</Text>
        </View>
      ) : null}
      */}

      <AppliedPipelineStepper status={application.status} />

      <View style={card.appliedFooter}>
        {/* submittedAt — not on GET /applications list; restore when API adds submittedAt
        {application.submittedAt ? (
          <Text style={card.appliedDate}>
            {`Submitted ${new Date(application.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`}
          </Text>
        ) : (
          <View />
        )}
        */}
        <View />
        <Text style={card.appliedStatus}>
          {appliedStatusShortLabel(application.status)}
        </Text>
      </View>

      <Pressable style={card.appliedCta} onPress={onTrack}>
        <Text style={card.appliedCtaLabel}>{en.applicationsTab.trackStatus}</Text>
      </Pressable>

      {/* Legacy Applied card (logo-left + status badge) — kept for reuse
      <View style={card.appliedRow}>
        {university.logoUrl ?? course.universityLogo ? (
          <Image
            source={{uri: university.logoUrl ?? course.universityLogo}}
            style={card.appliedLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={[card.appliedLogo, card.logoPlaceholder]}>
            <Text style={card.logoLetter}>{university.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={card.body}>
          <View style={card.statusRow}>
            <View style={[card.statusBadge, {backgroundColor: sc.bg}]}>
              <Text style={[card.statusText, {color: sc.text}]}>
                {statusLabel(application.status)}
              </Text>
            </View>
            {item.appFeeStatus ? (
              <Text style={card.feeStatus}>{feeStatusLabel(item.appFeeStatus)}</Text>
            ) : null}
          </View>
          <Text style={card.courseName} numberOfLines={2}>
            {course.name}
          </Text>
          <Text style={card.uniNameApplied} numberOfLines={1}>
            {university.name}
          </Text>
          {fee ? <Text style={card.fee}>{fee}</Text> : null}
        </View>
      </View>
      <Pressable style={card.trackBtn} onPress={onTrack} hitSlop={8}>
        <Text style={card.trackLabel}>{en.applicationsTab.trackStatus}</Text>
      </Pressable>
      */}
    </View>
  );
});

export const ApplicationsScreen = memo(function ApplicationsScreen({
  tab,
  onTabChange,
  shortlist,
  applications,
  loading,
  refreshing,
  onRefresh,
  onStartApplication,
  onOpenCourse,
  onTrackApplication,
  onAddApplication,
  onRemoveShortlist,
  shortlistBusyId,
}: ApplicationsScreenProps) {
  const insets = useSafeAreaInsets();

  const headerSubtitle = useMemo(() => {
    if (tab === 'shortlist' && shortlist[0]) {
      return `${shortlist[0].name} • ${shortlist[0].universityName}`;
    }
    if (tab === 'applied' && applications[0]) {
      return `${applications[0].course.name} • ${applications[0].university.name}`;
    }
    return undefined;
  }, [tab, shortlist, applications]);

  const renderShortlist = useCallback<ListRenderItem<CourseListItem>>(
    ({item}) => (
      <ShortlistCard
        course={item}
        onPress={() => onOpenCourse(item)}
        onStart={() => onStartApplication(item)}
        onRemove={onRemoveShortlist ? () => onRemoveShortlist(item.id) : undefined}
        removing={shortlistBusyId === item.id}
      />
    ),
    [onOpenCourse, onStartApplication, onRemoveShortlist, shortlistBusyId],
  );

  const renderApplied = useCallback<ListRenderItem<ApplicationListItemDto>>(
    ({item}) => (
      <AppliedCard item={item} onTrack={() => onTrackApplication(item)} />
    ),
    [onTrackApplication],
  );

  const appliedListHeader = useMemo(() => {
    if (applications.length === 0) {
      return null;
    }
    return (
      <Text style={styles.usageBanner}>
        {en.applicationsTab.applicationsUsed(
          applications.length,
          MAX_STUDENT_APPLICATIONS,
        )}
      </Text>
    );
  }, [applications.length]);

  const appliedListFooter = useMemo(() => {
    if (!onAddApplication || applications.length >= MAX_STUDENT_APPLICATIONS) {
      return null;
    }
    return (
      <Pressable onPress={onAddApplication} hitSlop={8} style={styles.addAnother}>
        <Text style={styles.addAnotherLabel}>
          {en.applicationsTab.addAnotherApplication}
        </Text>
      </Pressable>
    );
  }, [applications.length, onAddApplication]);

  const emptyShortlist = (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{en.applicationsTab.emptyShortlistTitle}</Text>
      <Text style={styles.emptySub}>{en.applicationsTab.emptyShortlistSub}</Text>
    </View>
  );

  const emptyApplied = (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{en.applicationsTab.emptyAppliedTitle}</Text>
      <Text style={styles.emptySub}>{en.applicationsTab.emptyAppliedSub}</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <WaveHeader
        title={en.applicationsTab.headerTitle}
        subtitle={headerSubtitle}
      />

      <View style={styles.tabsBar}>
        <UnderlineTabs tab={tab} onTabChange={onTabChange} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : tab === 'shortlist' ? (
        <FlatList
          data={shortlist}
          keyExtractor={c => String(c.id)}
          renderItem={renderShortlist}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: insets.bottom + 24},
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={emptyShortlist}
        />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={a => a.application.id}
          renderItem={renderApplied}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: insets.bottom + 24},
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={appliedListHeader}
          ListFooterComponent={appliedListFooter}
          ListEmptyComponent={emptyApplied}
        />
      )}
    </View>
  );
});

const tabs = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 0,
  },
  label: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    paddingVertical: 10,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: Weights.bold,
  },
  indicator: {
    width: '100%',
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  indicatorSpacer: {
    width: '100%',
    height: 3,
  },
});

const pipeline = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 8,
  },
  track: {
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTeal,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotActiveInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  lineDone: {
    backgroundColor: colors.accentTeal,
  },
  label: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  labelDone: {
    color: colors.tagGreen,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: Weights.bold,
  },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  courseName: {
    flex: 1,
    fontSize: FontSizes.body,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 21,
  },
  matchBadge: {
    ...Styles.matchBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  matchText: Styles.matchBadgeText,
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  uniLogo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  uniName: {
    flex: 1,
    fontSize: FontSizes.micro,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  stat: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  primeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.yellowBadge,
    borderRadius: rad.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primeText: {
    fontSize: FontSizes.micro,
    fontWeight: Weights.bold,
    color: colors.navy,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  statusLabel: {
    fontSize: FontSizes.size13,
    fontWeight: Weights.semibold,
    color: colors.tagGreen,
  },
  footerCta: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
  appliedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  appliedDate: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    fontWeight: Weights.medium,
  },
  appliedStatus: {
    fontSize: FontSizes.size13,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
  appliedCta: {
    marginTop: 4,
    height: 44,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedCtaLabel: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.white,
  },
  fee: {
    fontSize: FontSizes.size11,
    fontWeight: Weights.semibold,
    color: colors.navy,
    marginTop: 4,
  },
  appliedRow: {flexDirection: 'row', gap: 12},
  appliedLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoLetter: {
    fontSize: FontSizes.size18,
    fontWeight: Weights.bold,
    color: colors.primary,
  },
  body: {flex: 1, gap: 2},
  uniNameApplied: {
    fontSize: FontSizes.size11,
    fontWeight: Weights.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: rad.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {fontSize: FontSizes.size10, fontWeight: Weights.semibold},
  feeStatus: {
    fontSize: FontSizes.size10,
    fontWeight: Weights.medium,
    color: colors.textSecondary,
  },
  trackBtn: {alignSelf: 'flex-start', marginTop: 4},
  trackLabel: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
});

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.background},
  tabsBar: {
    backgroundColor: colors.white,
    paddingHorizontal: H_PAD,
  },
  spinner: {flex: 1, marginTop: 40},
  list: {padding: H_PAD, gap: 10, flexGrow: 1},
  usageBanner: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  addAnother: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  addAnotherLabel: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: FontSizes.body,
    fontWeight: Weights.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
