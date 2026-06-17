/**
 * Compare courses — Figma node 880:1813
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerCourseRecommendationDto} from '../../../../api/partnerTypes';
import {AgentStackHeader} from '../../components/AgentStackHeader';
import {formatAgentMoney} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentLayout, agentType} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  courses: (PartnerCourseRecommendationDto | undefined)[];
  loading: boolean;
  onBack: () => void;
  onShortlist: (courseId: string, courseName: string, matchScore?: number) => void;
};

function CompareColumn({
  course,
  onShortlist,
}: {
  course: PartnerCourseRecommendationDto;
  onShortlist: () => void;
}) {
  return (
    <View style={styles.column}>
      <Text style={agentType.cardTitle} numberOfLines={3}>
        {course.name}
      </Text>
      <Text style={agentType.bodyMuted} numberOfLines={2}>
        {course.university}
      </Text>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>{course.matchScore}% match</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Country</Text>
        <Text style={styles.rowValue}>{course.country}</Text>
      </View>
      {course.fees ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Fees</Text>
          <Text style={styles.rowValue}>
            {formatAgentMoney(course.fees.amount, course.fees.currency)}/yr
          </Text>
        </View>
      ) : null}
      {course.duration ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duration</Text>
          <Text style={styles.rowValue}>{course.duration}</Text>
        </View>
      ) : null}
      {course.estimatedCommission != null ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Commission</Text>
          <Text style={styles.rowValue}>
            {formatAgentMoney(course.estimatedCommission, course.commissionCurrency ?? 'USD')}
          </Text>
        </View>
      ) : null}
      <Pressable style={styles.shortlistBtn} onPress={onShortlist}>
        <Text style={styles.shortlistText}>
          {course.isShortlisted ? 'Already shortlisted' : 'Shortlist →'}
        </Text>
      </Pressable>
    </View>
  );
}

export const AgentMatchesCompareScreen = memo(function AgentMatchesCompareScreen({
  courses,
  loading,
  onBack,
  onShortlist,
}: Props) {
  const insets = useSafeAreaInsets();
  const valid = courses.filter((c): c is PartnerCourseRecommendationDto => c != null);

  return (
    <View style={styles.fill}>
      <AgentStackHeader title="Compare" subtitle="Side-by-side course comparison" onBack={onBack} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: insets.bottom + 24},
          ]}>
          {valid.map(course => (
            <CompareColumn
              key={course.courseId}
              course={course}
              onShortlist={() =>
                onShortlist(course.courseId, course.name, course.matchScore)
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  spinner: {marginTop: 48},
  scroll: {paddingHorizontal: H_PAD, paddingTop: 12, gap: 12},
  column: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.matchBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rad.sm,
  },
  scoreText: {fontSize: 12, fontWeight: '800', color: colors.matchBadgeText},
  row: {gap: 2},
  rowLabel: {fontSize: 11, fontWeight: '600', color: colors.textSecondary},
  rowValue: {fontSize: 13, fontWeight: '700', color: colors.navy},
  shortlistBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: agentLayout.cardRadiusSm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shortlistText: {fontSize: 13, fontWeight: '700', color: colors.white},
});
