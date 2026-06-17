/**
 * Add Student — Step 2 Choose Program (screen 2.1)
 * API: GET /partner/students/:userId/recommendations
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
import {ChevronLeft, Check, Pencil} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerCourseRecommendationDto} from '../../../../api/partnerTypes';
import {formatAgentMoney, studentInitials} from '../../agentUtils';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout} from '../../agentStyles';
import {FontSizes, Weights} from '../../../../utils';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

export type StudentDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  courseCategory: string;
};

type Props = {
  draft: StudentDraft;
  courses: PartnerCourseRecommendationDto[];
  recommendationsMessage?: string | null;
  selectedCourseId: string | null;
  loading: boolean;
  submitting: boolean;
  onSelectCourse: (courseId: string) => void;
  onEdit: () => void;
  onSubmit: () => void;
  onBack: () => void;
};

function StepIndicator() {
  return (
    <View style={styles.steps}>
      <View style={styles.stepItem}>
        <View style={[styles.stepDot, styles.stepDotDone]}>
          <Check size={10} color={colors.white} strokeWidth={3} />
        </View>
        <Text style={[styles.stepLabel, styles.stepLabelDone]}>Basic Detail</Text>
      </View>
      <View style={[styles.stepLine, styles.stepLineDone]} />
      <View style={styles.stepItem}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Choose Program</Text>
      </View>
    </View>
  );
}

function ProgramCard({
  course,
  selected,
  onSelect,
  onApply,
}: {
  course: PartnerCourseRecommendationDto;
  selected: boolean;
  onSelect: () => void;
  onApply: () => void;
}) {
  return (
    <Pressable
      style={[styles.programCard, selected && styles.programCardSelected]}
      onPress={onSelect}>
      <Text style={styles.programTitle}>{course.name}</Text>
      <Text style={styles.programUni}>{course.university.toUpperCase()}</Text>
      <View style={styles.tagRow}>
        {course.scholarshipPercent != null ? (
          <Text style={styles.tagGreen}>{course.scholarshipPercent}% scholarship</Text>
        ) : null}
        {course.visaSuccessPercent != null ? (
          <Text style={styles.tagBlue}>{course.visaSuccessPercent}% visa</Text>
        ) : null}
      </View>
      <View style={styles.feeRow}>
        {course.fees ? (
          <Text style={styles.feeMain}>
            {formatAgentMoney(course.fees.amount, course.fees.currency)}
            {course.fees.period ? ` / ${course.fees.period}` : ' / year'}
          </Text>
        ) : null}
        {course.originalFees ? (
          <Text style={styles.feeStrike}>
            Listed at {formatAgentMoney(course.originalFees.amount, course.originalFees.currency)}
          </Text>
        ) : null}
      </View>
      {course.estimatedCommission != null ? (
        <Text style={styles.commission}>
          Est. commission:{' '}
          {formatAgentMoney(course.estimatedCommission, course.commissionCurrency ?? 'USD')}
        </Text>
      ) : null}
      <Pressable style={styles.applyBtn} onPress={onApply}>
        <Text style={styles.applyBtnText}>Apply Now →</Text>
      </Pressable>
    </Pressable>
  );
}

export const AddStudentProgramsScreen = memo(function AddStudentProgramsScreen({
  draft,
  courses,
  recommendationsMessage,
  selectedCourseId,
  loading,
  submitting,
  onSelectCourse,
  onEdit,
  onSubmit,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const fullName = `${draft.firstName} ${draft.lastName}`.trim();

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={styles.backRow} onPress={onBack} hitSlop={12}>
          <ChevronLeft size={22} color={colors.navy} />
          <Text style={styles.backLabel}>Add Student</Text>
        </Pressable>
        <StepIndicator />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + 110}]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{studentInitials(fullName)}</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={onEdit} hitSlop={8}>
              <Pencil size={16} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.summaryName}>{fullName}</Text>
          <Text style={styles.summaryMeta}>Country: {draft.country}</Text>
          <Text style={styles.summaryMeta}>Interest: {draft.courseCategory}</Text>
          <Text style={styles.summaryMeta}>{draft.email}</Text>
          <Text style={styles.summaryMeta}>{draft.phone}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <View style={styles.sectionUnderline} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{marginVertical: 24}} />
        ) : courses.length === 0 ? (
          <Text style={styles.empty}>
            {recommendationsMessage ?? 'No recommended programs found for this student yet.'}
          </Text>
        ) : (
          courses.map(course => (
            <ProgramCard
              key={course.courseId}
              course={course}
              selected={selectedCourseId === course.courseId}
              onSelect={() => onSelectCourse(course.courseId)}
              onApply={() => {
                onSelectCourse(course.courseId);
              }}
            />
          ))
        )}

        {recommendationsMessage && courses.length > 0 ? (
          <Text style={styles.matchNote}>{recommendationsMessage}</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={[styles.submitBtn, (submitting || !selectedCourseId) && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={submitting || !selectedCourseId}>
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit application →</Text>
          )}
        </Pressable>
        <Text style={styles.footerNote}>
          Student will receive a WhatsApp invite to complete their profile.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16},
  backLabel: {fontSize: 18, fontWeight: '700', color: colors.navy},
  steps: {flexDirection: 'row', alignItems: 'center'},
  stepItem: {alignItems: 'center', width: 100},
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {borderColor: colors.primary, backgroundColor: colors.primary},
  stepDotDone: {borderColor: colors.agentMint, backgroundColor: colors.agentMint},
  stepLabel: {fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 6, textAlign: 'center'},
  stepLabelActive: {color: colors.primary, fontWeight: '700'},
  stepLabelDone: {color: colors.tagGreen, fontWeight: '700'},
  stepLine: {flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 18},
  stepLineDone: {backgroundColor: colors.agentMint},
  content: {paddingHorizontal: H_PAD, paddingTop: 14},
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: agentColors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 16, fontWeight: '800', color: colors.agentMint},
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.matchBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryName: {fontSize: 18, fontWeight: '800', color: colors.navy, marginTop: 10},
  summaryMeta: {fontSize: 13, color: colors.textSecondary, marginTop: 3},
  sectionHeader: {marginBottom: 12},
  sectionTitle: {fontSize: 16, fontWeight: '800', color: colors.navy},
  sectionUnderline: {
    width: 100,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  programCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  programCardSelected: {borderColor: colors.primary, borderWidth: 2},
  programTitle: {fontSize: 16, fontWeight: '800', color: colors.navy},
  programUni: {fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 4, letterSpacing: 0.4},
  tagRow: {flexDirection: 'row', gap: 12, marginTop: 8},
  tagGreen: {fontSize: 12, fontWeight: '600', color: colors.tagGreen},
  tagBlue: {fontSize: 12, fontWeight: '600', color: colors.navy},
  feeRow: {marginTop: 10},
  feeMain: {fontSize: 16, fontWeight: '800', color: colors.primary},
  feeStrike: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  commission: {fontSize: 12, fontWeight: '600', color: colors.tagGreen, marginTop: 6},
  applyBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: rad.full,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {fontSize: 14, fontWeight: '700', color: colors.primary},
  empty: {fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginVertical: 20},
  matchNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {opacity: 0.6},
  submitText: {color: colors.white, fontSize: 16, fontWeight: '700'},
  footerNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
