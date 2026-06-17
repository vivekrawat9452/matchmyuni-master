/**
 * Matches tab — Figma nodes 831:4082, 884:3025
 * API: GET /partner/students/:userId/recommendations
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import {Filter, GitCompare} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerCourseRecommendationDto,
  PartnerStudentListItemDto,
} from '../../../../api/partnerTypes';
import type {MatchesFilterState} from './AgentMatchesContainer';
import {formatAgentMoney} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  students: PartnerStudentListItemDto[];
  selectedUserId: string | null;
  courses: PartnerCourseRecommendationDto[];
  compareIds: string[];
  filter: MatchesFilterState;
  filterVisible: boolean;
  countries: string[];
  message?: string | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectStudent: (userId: string) => void;
  onToggleCompare: (courseId: string) => void;
  onCompare: () => void;
  onShortlist: (courseId: string, courseName: string, matchScore?: number) => void;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onApplyFilter: (filter: MatchesFilterState) => void;
};

function FilterModal({
  visible,
  filter,
  countries,
  onClose,
  onApply,
}: {
  visible: boolean;
  filter: MatchesFilterState;
  countries: string[];
  onClose: () => void;
  onApply: (f: MatchesFilterState) => void;
}) {
  const [draft, setDraft] = React.useState(filter);
  React.useEffect(() => {
    if (visible) setDraft(filter);
  }, [filter, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={filterStyles.backdrop} onPress={onClose}>
        <Pressable style={filterStyles.sheet} onPress={e => e.stopPropagation()}>
          <Text style={filterStyles.title}>Filter matches</Text>

          <Text style={filterStyles.label}>Country</Text>
          <View style={filterStyles.chips}>
            <Pressable
              style={[filterStyles.chip, !draft.country && filterStyles.chipActive]}
              onPress={() => setDraft(d => ({...d, country: null}))}>
              <Text style={[filterStyles.chipText, !draft.country && filterStyles.chipTextActive]}>
                All
              </Text>
            </Pressable>
            {countries.map(c => (
              <Pressable
                key={c}
                style={[filterStyles.chip, draft.country === c && filterStyles.chipActive]}
                onPress={() => setDraft(d => ({...d, country: c}))}>
                <Text
                  style={[
                    filterStyles.chipText,
                    draft.country === c && filterStyles.chipTextActive,
                  ]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={filterStyles.label}>Minimum match score</Text>
          <View style={filterStyles.chips}>
            {[0, 70, 80, 90].map(score => (
              <Pressable
                key={score}
                style={[filterStyles.chip, draft.minScore === score && filterStyles.chipActive]}
                onPress={() => setDraft(d => ({...d, minScore: score}))}>
                <Text
                  style={[
                    filterStyles.chipText,
                    draft.minScore === score && filterStyles.chipTextActive,
                  ]}>
                  {score === 0 ? 'Any' : `${score}%+`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={filterStyles.label}>Sort by</Text>
          <View style={filterStyles.chips}>
            {(['match', 'fees'] as const).map(key => (
              <Pressable
                key={key}
                style={[filterStyles.chip, draft.sortBy === key && filterStyles.chipActive]}
                onPress={() => setDraft(d => ({...d, sortBy: key}))}>
                <Text
                  style={[
                    filterStyles.chipText,
                    draft.sortBy === key && filterStyles.chipTextActive,
                  ]}>
                  {key === 'match' ? 'Best match' : 'Lowest fees'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={filterStyles.applyBtn}
            onPress={() => {
              onApply(draft);
              onClose();
            }}>
            <Text style={filterStyles.applyText}>Apply filters</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const AgentMatchesScreen = memo(function AgentMatchesScreen({
  students,
  selectedUserId,
  courses,
  compareIds,
  filter,
  filterVisible,
  countries,
  message,
  loading,
  refreshing,
  onRefresh,
  onSelectStudent,
  onToggleCompare,
  onCompare,
  onShortlist,
  onOpenFilter,
  onCloseFilter,
  onApplyFilter,
}: Props) {
  const insets = useSafeAreaInsets();
  const canCompare = compareIds.length === 2;

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Matches</Text>
          <Pressable style={styles.filterBtn} onPress={onOpenFilter} hitSlop={8}>
            <Filter size={20} color={colors.white} />
          </Pressable>
        </View>
        <Text style={styles.headerSub}>Course recommendations for your students</Text>
      </View>

      {students.length > 0 ? (
        <FlatList
          horizontal
          data={students}
          keyExtractor={s => s.userId}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.studentTabs}
          renderItem={({item}) => {
            const active = item.userId === selectedUserId;
            return (
              <Pressable
                style={[styles.studentTab, active && styles.studentTabActive]}
                onPress={() => onSelectStudent(item.userId)}>
                <Text style={[styles.studentTabText, active && styles.studentTabTextActive]}>
                  {item.name.split(' ')[0]}
                </Text>
              </Pressable>
            );
          }}
        />
      ) : null}

      {loading && courses.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={c => c.courseId}
          contentContainerStyle={[styles.list, {paddingBottom: insets.bottom + (canCompare ? 80 : 24)}]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {message ??
                (students.length === 0
                  ? 'Add a student to see course matches.'
                  : 'No matches found for this student.')}
            </Text>
          }
          renderItem={({item}) => {
            const selected = compareIds.includes(item.courseId);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={agentType.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{item.matchScore}%</Text>
                  </View>
                </View>
                <Text style={agentType.bodyMuted}>{item.university}</Text>
                <Text style={styles.meta}>
                  {item.country}
                  {item.fees
                    ? ` · ${formatAgentMoney(item.fees.amount, item.fees.currency)}/yr`
                    : ''}
                </Text>
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.compareBtn, selected && styles.compareBtnActive]}
                    onPress={() => onToggleCompare(item.courseId)}>
                    <GitCompare size={14} color={selected ? colors.white : colors.navy} />
                    <Text style={[styles.compareText, selected && styles.compareTextActive]}>
                      Compare
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.shortlistBtn}
                    onPress={() => onShortlist(item.courseId, item.name, item.matchScore)}>
                    <Text style={styles.shortlistText}>
                      {item.isShortlisted ? 'Shortlisted' : 'Shortlist →'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      {canCompare ? (
        <View style={[styles.compareBar, {paddingBottom: insets.bottom + 12}]}>
          <Pressable style={styles.compareBarBtn} onPress={onCompare}>
            <Text style={styles.compareBarText}>Compare selected courses →</Text>
          </Pressable>
        </View>
      ) : null}

      <FilterModal
        visible={filterVisible}
        filter={filter}
        countries={countries}
        onClose={onCloseFilter}
        onApply={onApplyFilter}
      />
    </View>
  );
});

const filterStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: rad.xl,
    borderTopRightRadius: rad.xl,
    padding: 20,
    gap: 12,
  },
  title: {fontSize: 18, fontWeight: '800', color: colors.navy},
  label: {fontSize: 13, fontWeight: '700', color: colors.navy, marginTop: 4},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: agentLayout.pillRadius,
    backgroundColor: colors.chipBg,
  },
  chipActive: {backgroundColor: colors.primary},
  chipText: {fontSize: 12, fontWeight: '600', color: colors.navy},
  chipTextActive: {color: colors.white},
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: agentLayout.cardRadiusSm,
    height: agentLayout.buttonHeightSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyText: {fontSize: 14, fontWeight: '700', color: colors.white},
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  headerTitle: {fontSize: 22, fontWeight: '800', color: colors.white},
  headerSub: {fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 4},
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentTabs: {paddingHorizontal: H_PAD, paddingVertical: 10, gap: 8},
  studentTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: agentLayout.pillRadius,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentTabActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  studentTabText: {fontSize: 13, fontWeight: '600', color: colors.navy},
  studentTabTextActive: {color: colors.white},
  spinner: {marginTop: 48},
  list: {paddingHorizontal: H_PAD, paddingTop: 4},
  empty: {textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginTop: 40},
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 6,
  },
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  matchBadge: {
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.sm,
  },
  matchText: {fontSize: 11, fontWeight: '800', color: colors.matchBadgeText},
  meta: {fontSize: 12, fontWeight: '500', color: colors.textMuted},
  actions: {flexDirection: 'row', gap: 8, marginTop: 8},
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: agentLayout.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareBtnActive: {backgroundColor: colors.navy, borderColor: colors.navy},
  compareText: {fontSize: 12, fontWeight: '700', color: colors.navy},
  compareTextActive: {color: colors.white},
  shortlistBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: agentLayout.pillRadius,
    backgroundColor: colors.primary,
  },
  shortlistText: {fontSize: 12, fontWeight: '700', color: colors.white},
  compareBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  compareBarBtn: {
    backgroundColor: colors.navy,
    borderRadius: agentLayout.cardRadiusSm,
    height: agentLayout.buttonHeightSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBarText: {fontSize: 14, fontWeight: '700', color: colors.white},
});
