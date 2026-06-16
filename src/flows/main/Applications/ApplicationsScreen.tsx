/**
 * Applications tab — Figma nodes 593:1755 (Shortlist) + 593:2244 (Applied)
 */
import React, {memo, useCallback} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {ApplicationListItemDto, CourseListItem} from '../../../api/types';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import {en} from '../../../utils/strings/en';
import {feeStatusLabel, statusBadgeColors, statusLabel} from './applicationStatus';

const H_PAD = hPad(5);

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
  onRemoveShortlist?: (courseId: number) => void;
  shortlistBusyId?: number | null;
};

function SegmentTabs({
  tab,
  onTabChange,
}: {
  tab: ApplicationsTab;
  onTabChange: (t: ApplicationsTab) => void;
}) {
  return (
    <View style={seg.wrap}>
      <Pressable
        style={[seg.pill, tab === 'shortlist' && seg.pillActive]}
        onPress={() => onTabChange('shortlist')}>
        <Text style={[seg.label, tab === 'shortlist' && seg.labelActive]}>
          {en.applicationsTab.shortlist}
        </Text>
      </Pressable>
      <Pressable
        style={[seg.pill, tab === 'applied' && seg.pillActive]}
        onPress={() => onTabChange('applied')}>
        <Text style={[seg.label, tab === 'applied' && seg.labelActive]}>
          {en.applicationsTab.applied}
        </Text>
      </Pressable>
    </View>
  );
}

function UniLogo({uri, name}: {uri?: string; name: string}) {
  if (uri) {
    return <Image source={{uri}} style={card.logo} resizeMode="contain" />;
  }
  return (
    <View style={[card.logo, card.logoPlaceholder]}>
      <Text style={card.logoLetter}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function formatFee(course: CourseListItem): string | null {
  const sym = course.currencySymbol ?? '$';
  if (course.applicationFee != null && course.applicationFee > 0) {
    return `${sym}${course.applicationFee} app fee`;
  }
  if (course.applicableTuitionFee != null) {
    return `${sym}${course.applicableTuitionFee.toLocaleString()}/yr`;
  }
  return null;
}

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
  const location = [course.city, course.country].filter(Boolean).join(', ');
  const fee = formatFee(course);
  const intake = course.upcomingIntakes?.[0]?.label ?? course.intakes?.[0];

  return (
    <Pressable style={card.wrap} onPress={onPress}>
      <View style={card.row}>
        <UniLogo uri={course.universityLogo} name={course.universityName} />
        <View style={card.body}>
          <Text style={card.courseName} numberOfLines={2}>
            {course.name}
          </Text>
          <Text style={card.uniName} numberOfLines={1}>
            {course.universityName}
          </Text>
          <View style={card.metaRow}>
            {location ? <Text style={card.meta}>{location}</Text> : null}
            {course.duration ? (
              <Text style={card.meta}>
                {location ? ' · ' : ''}
                {course.duration} yr
              </Text>
            ) : null}
          </View>
          {fee ? <Text style={card.fee}>{fee}</Text> : null}
          {intake ? <Text style={card.intake}>Next intake: {intake}</Text> : null}
        </View>
      </View>
      <View style={card.actions}>
        {onRemove ? (
          <Pressable
            style={card.removeBtn}
            onPress={onRemove}
            disabled={removing}
            hitSlop={8}>
            {removing ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Text style={card.removeLabel}>{en.applicationsTab.remove}</Text>
            )}
          </Pressable>
        ) : null}
        <Pressable style={card.cta} onPress={onStart}>
          <Text style={card.ctaLabel}>{en.applicationsTab.startApplication}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const AppliedCard = memo(function AppliedCard({
  item,
  onPress,
  onTrack,
}: {
  item: ApplicationListItemDto;
  onPress: () => void;
  onTrack: () => void;
}) {
  const {course, application, university, appFeeStatus} = item;
  const sc = statusBadgeColors(application.status);
  const fee = formatFee(course);

  return (
    <Pressable style={card.wrap} onPress={onPress}>
      <View style={card.row}>
        <UniLogo uri={university.logoUrl ?? course.universityLogo} name={university.name} />
        <View style={card.body}>
          <View style={card.statusRow}>
            <View style={[card.statusBadge, {backgroundColor: sc.bg}]}>
              <Text style={[card.statusText, {color: sc.text}]}>
                {statusLabel(application.status)}
              </Text>
            </View>
            {appFeeStatus ? (
              <Text style={card.feeStatus}>{feeStatusLabel(appFeeStatus)}</Text>
            ) : null}
          </View>
          <Text style={card.courseName} numberOfLines={2}>
            {course.name}
          </Text>
          <Text style={card.uniName} numberOfLines={1}>
            {university.name}
          </Text>
          {fee ? <Text style={card.fee}>{fee}</Text> : null}
        </View>
      </View>
      <Pressable style={card.trackBtn} onPress={onTrack} hitSlop={8}>
        <Text style={card.trackLabel}>{en.applicationsTab.trackStatus}</Text>
      </Pressable>
    </Pressable>
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
  onRemoveShortlist,
  shortlistBusyId,
}: ApplicationsScreenProps) {
  const insets = useSafeAreaInsets();

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
      <AppliedCard
        item={item}
        onPress={() => onTrackApplication(item)}
        onTrack={() => onTrackApplication(item)}
      />
    ),
    [onTrackApplication],
  );

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
    <View style={[styles.flex, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>{en.applicationsTab.title}</Text>
        <SegmentTabs tab={tab} onTabChange={onTabChange} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : tab === 'shortlist' ? (
        <FlatList
          data={shortlist}
          keyExtractor={c => String(c.id)}
          renderItem={renderShortlist}
          contentContainerStyle={styles.list}
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={emptyApplied}
        />
      )}
    </View>
  );
});

const seg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: rad.full,
    padding: 4,
    marginTop: 14,
  },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.navy,
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
    gap: 12,
  },
  row: {flexDirection: 'row', gap: 12},
  logo: {
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
  courseName: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.bold,
    color: colors.navy,
    lineHeight: 19,
  },
  uniName: {
    fontSize: FontSizes.size11,
    fontWeight: Weights.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 4},
  meta: {fontSize: FontSizes.size11, color: colors.textSecondary},
  fee: {
    fontSize: FontSizes.size11,
    fontWeight: Weights.semibold,
    color: colors.navy,
    marginTop: 4,
  },
  intake: {
    fontSize: FontSizes.size11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeBtn: {
    paddingHorizontal: 12,
    height: 44,
    borderRadius: rad.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  removeLabel: {
    fontSize: FontSizes.size13,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
  },
  cta: {
    flex: 1,
    height: 44,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.white,
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
  trackBtn: {alignSelf: 'flex-start'},
  trackLabel: {
    fontSize: FontSizes.size14,
    fontWeight: Weights.semibold,
    color: colors.primary,
  },
});

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {...Styles.screenTitle, color: colors.navy},
  spinner: {flex: 1, marginTop: 40},
  list: {padding: H_PAD, gap: 10, flexGrow: 1, paddingBottom: 24},
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
