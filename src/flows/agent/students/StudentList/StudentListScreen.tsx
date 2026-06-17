/**
 * My Students list — screens 4.1 (empty) & 4.2 (list)
 * API: GET /partner/students
 */
import React, {memo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Plus, Search, UserPlus} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerStudentListItemDto,
  StudentFilterTab,
} from '../../../../api/partnerTypes';
import {PipelineProgress} from '../../components/PipelineProgress';
import {
  formatAgentMoney,
  pipelineActiveIndex,
  statusTagColors,
  statusTagLabel,
  studentInitials,
} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout} from '../../agentStyles';
import {FontSizes, Weights} from '../../../../utils';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

const FILTERS: {key: StudentFilterTab; label: string; countKey: keyof NonNullable<Props['filterCounts']>}[] = [
  {key: 'all', label: 'All', countKey: 'all'},
  {key: 'action_needed', label: 'Action needed', countKey: 'actionNeeded'},
  {key: 'on_track', label: 'On track', countKey: 'onTrack'},
  {key: 'offer_received', label: 'Offer received', countKey: 'offerReceived'},
];

type Props = {
  students: PartnerStudentListItemDto[] | undefined;
  filterCounts:
    | {all: number; actionNeeded: number; onTrack: number; offerReceived: number}
    | undefined;
  total: number;
  filter: StudentFilterTab;
  search: string;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onFilterChange: (f: StudentFilterTab) => void;
  onSearchChange: (q: string) => void;
  onAddStudent: () => void;
  onStudentPress: (userId: string) => void;
};

function StudentCard({
  item,
  onPress,
}: {
  item: PartnerStudentListItemDto;
  onPress: () => void;
}) {
  const tag = statusTagColors[item.statusTag] ?? statusTagColors.on_track;
  const activeIdx = pipelineActiveIndex(item.pipelineStage);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{studentInitials(item.name)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.country} · {item.applicationCount} Application{item.applicationCount === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: tag.bg}]}>
          <Text style={[styles.statusBadgeText, {color: tag.text}]}>
            {statusTagLabel(item.statusTag)}
          </Text>
        </View>
      </View>

      <View style={styles.pipelineWrap}>
        <PipelineProgress activeIndex={activeIdx} compact />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.potential}>
          Est. {formatAgentMoney(item.estimatedCommission, item.commissionCurrency)} potential
        </Text>
        <Text style={styles.viewProfile}>View Profile →</Text>
      </View>
    </Pressable>
  );
}

function EmptyState({onAdd}: {onAdd: () => void}) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <UserPlus size={40} color={colors.agentMint} />
      </View>
      <Text style={styles.emptyTitle}>No students yet</Text>
      <Text style={styles.emptySub}>
        Add your first student to get started — it takes less than 2 minutes.
      </Text>
      <Pressable style={styles.addBtn} onPress={onAdd}>
        <Plus size={18} color={colors.white} />
        <Text style={styles.addBtnText}>Add First Student</Text>
      </Pressable>
    </View>
  );
}

export const StudentListScreen = memo(function StudentListScreen({
  students,
  filterCounts,
  total,
  filter,
  search,
  loading,
  refreshing,
  onRefresh,
  onFilterChange,
  onSearchChange,
  onAddStudent,
  onStudentPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const items = students ?? [];
  const isEmpty = !loading && items.length === 0 && !search && filter === 'all';
  const attentionCount = filterCounts?.actionNeeded ?? 0;

  const renderFilter = useCallback(
    () => (
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterActive]}
            onPress={() => onFilterChange(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    ),
    [filter, onFilterChange],
  );

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>My Students</Text>
            <Text style={styles.subtitle}>
              {total} Student{total === 1 ? '' : 's'}
              {attentionCount > 0 ? ` · ${attentionCount} need attention` : ''}
            </Text>
          </View>
          <Pressable style={styles.headerAddBtn} onPress={onAddStudent}>
            <Plus size={16} color={colors.primary} />
            <Text style={styles.headerAddText}>Add Student</Text>
          </Pressable>
        </View>
      </View>

      {isEmpty ? (
        <EmptyState onAdd={onAddStudent} />
      ) : (
        <>
          <View style={styles.searchWrap}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, country, course..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={onSearchChange}
            />
          </View>

          {renderFilter()}

          {loading && items.length === 0 ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
          ) : (
            <FlatList
              data={items}
              keyExtractor={s => s.userId}
              contentContainerStyle={{paddingHorizontal: H_PAD, paddingBottom: insets.bottom + 24}}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <Text style={styles.noResults}>No students match your search.</Text>
              }
              renderItem={({item}) => (
                <StudentCard item={item} onPress={() => onStudentPress(item.userId)} />
              )}
            />
          )}
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  headerTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  title: {fontSize: 22, fontWeight: '800', color: colors.white},
  subtitle: {fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 4},
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: rad.full,
  },
  headerAddText: {fontSize: 12, fontWeight: '700', color: colors.primary},
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: H_PAD,
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: rad.full,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  searchInput: {flex: 1, fontSize: FontSizes.body, color: colors.textPrimary, padding: 0},
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: H_PAD,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rad.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterText: {fontSize: 12, color: colors.textSecondary, fontWeight: Weights.medium},
  filterTextActive: {color: colors.white},
  spinner: {marginTop: 40},
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {fontSize: 14, fontWeight: Weights.extrabold, color: colors.agentMint},
  cardBody: {flex: 1},
  name: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.textPrimary},
  meta: {fontSize: FontSizes.caption, color: colors.textSecondary, marginTop: 2},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.full,
  },
  statusBadgeText: {fontSize: 10, fontWeight: Weights.bold},
  pipelineWrap: {marginTop: 12, marginBottom: 4},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  potential: {fontSize: FontSizes.caption, color: colors.tagGreen, fontWeight: Weights.bold},
  viewProfile: {fontSize: FontSizes.caption, color: colors.primary, fontWeight: Weights.bold},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: H_PAD},
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 20, fontWeight: Weights.extrabold, color: colors.textPrimary},
  emptySub: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    marginTop: 24,
  },
  addBtnText: {color: colors.white, fontSize: FontSizes.body, fontWeight: Weights.bold},
  noResults: {textAlign: 'center', color: colors.textSecondary, marginTop: 32},
});
