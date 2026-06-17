/**
 * View shortlist — Figma node 840:5672
 * API: GET /partner/students/:userId/shortlist
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
} from 'react-native';
import type {
  PartnerShortlistItemDto,
  PartnerStudentListItemDto,
} from '../../../../api/partnerTypes';
import {AgentStackHeader} from '../../components/AgentStackHeader';
import {colors} from '../../../../utils/colors';
import {agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const H_PAD = hPad(5);

type Props = {
  students: PartnerStudentListItemDto[];
  selectedUserId: string | null;
  shortlist: PartnerShortlistItemDto[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectStudent: (userId: string) => void;
  onBack: () => void;
};

export const AgentApplicationsShortlistScreen = memo(function AgentApplicationsShortlistScreen({
  students,
  selectedUserId,
  shortlist,
  loading,
  refreshing,
  onRefresh,
  onSelectStudent,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <AgentStackHeader title="Shortlist" subtitle="Courses shortlisted by student" onBack={onBack} />

      {students.length > 1 ? (
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

      {loading && shortlist.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={shortlist}
          keyExtractor={item => item.courseId}
          contentContainerStyle={[
            styles.list,
            {paddingBottom: insets.bottom + 24},
            shortlist.length === 0 && styles.emptyList,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No shortlisted courses for this student yet.</Text>
          }
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={agentType.cardTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.matchScore != null ? (
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{item.matchScore}% match</Text>
                  </View>
                ) : null}
              </View>
              <Text style={agentType.bodyMuted}>{item.university}</Text>
              <Text style={styles.meta}>
                {item.country}
                {item.degreeLevel ? ` · ${item.degreeLevel}` : ''}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.addedBy}>
                  Added by {item.addedBy === 'partner' ? 'you' : 'student'}
                </Text>
                {item.hasApplication ? (
                  <Text style={styles.applied}>Application started</Text>
                ) : (
                  <Text style={styles.pending}>Not applied yet</Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  studentTabs: {paddingHorizontal: H_PAD, paddingBottom: 8, gap: 8},
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
  list: {paddingHorizontal: H_PAD, paddingTop: 8, gap: 10},
  emptyList: {flexGrow: 1, justifyContent: 'center'},
  empty: {textAlign: 'center', color: colors.textSecondary, fontSize: 14},
  card: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 6,
  },
  cardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8},
  matchBadge: {
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.sm,
  },
  matchText: {fontSize: 10, fontWeight: '700', color: colors.matchBadgeText},
  meta: {fontSize: 12, fontWeight: '500', color: colors.textMuted},
  cardFooter: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
  addedBy: {fontSize: 11, fontWeight: '600', color: colors.textSecondary},
  applied: {fontSize: 11, fontWeight: '700', color: colors.agentMint},
  pending: {fontSize: 11, fontWeight: '700', color: colors.primary},
});
