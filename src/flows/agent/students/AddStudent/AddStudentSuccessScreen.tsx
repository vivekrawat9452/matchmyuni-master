/**
 * Add Student — Step 3 Application Submitted (screen 3)
 * API: GET /partner/applications/:id
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
import {Check} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {PartnerApplicationDetailDto} from '../../../../api/partnerTypes';
import {PipelineProgress} from '../../components/PipelineProgress';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout} from '../../agentStyles';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(5);

type Props = {
  application: PartnerApplicationDetailDto | null | undefined;
  reference?: string | null;
  loading: boolean;
  onTrack: () => void;
  onBackHome: () => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const AddStudentSuccessScreen = memo(function AddStudentSuccessScreen({
  application,
  reference,
  loading,
  onTrack,
  onBackHome,
}: Props) {
  const insets = useSafeAreaInsets();
  const submittedStage = application?.journey?.find(
    j => j.status === 'completed' || j.status === 'in_progress',
  );
  const submittedDate = submittedStage?.reachedAt ?? application?.journey?.[0]?.reachedAt;
  const activePipelineIndex = application?.journey
    ? Math.max(
        0,
        application.journey.findIndex(j => j.status === 'in_progress'),
      )
    : 1;

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Check size={32} color={colors.white} strokeWidth={3} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Application Submitted! 🎉</Text>
        {application ? (
          <Text style={styles.subtitle}>
            Your application to {application.course.name} at {application.course.university} has
            been sent.
          </Text>
        ) : null}

        {loading && !application ? (
          <ActivityIndicator color={colors.primary} style={{marginVertical: 32}} />
        ) : application ? (
          <View style={styles.detailCard}>
            <View style={styles.detailTop}>
              <View style={styles.detailBody}>
                <Text style={styles.courseName}>{application.course.name}</Text>
                <Text style={styles.uniName}>{application.course.university}</Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{application.matchScore}% Match</Text>
              </View>
            </View>

            <Text style={styles.detailMeta}>
              {[application.course.duration, application.course.intakeLabel]
                .filter(Boolean)
                .join(' • ') ||
                `Intake ${application.course.intakeSeason} ${application.course.intakeYear}`}
            </Text>

            {application.course.startDate ? (
              <Text style={styles.detailMeta}>Start {application.course.startDate}</Text>
            ) : null}

            <View style={styles.refRow}>
              {submittedDate ? (
                <Text style={styles.refText}>Submitted {formatDate(submittedDate)}</Text>
              ) : null}
              {reference ? (
                <Text style={styles.refText}>Ref: {reference}</Text>
              ) : (
                <Text style={styles.refText}>Ref: {application.id.slice(0, 8).toUpperCase()}</Text>
              )}
            </View>

            <View style={styles.pipelineWrap}>
              <PipelineProgress activeIndex={activePipelineIndex} compact />
            </View>
          </View>
        ) : null}

        <Pressable style={styles.primaryBtn} onPress={onTrack}>
          <Text style={styles.primaryBtnText}>Track my application →</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onBackHome}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  content: {paddingHorizontal: H_PAD, alignItems: 'center'},
  iconWrap: {marginBottom: 20},
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.matchBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {fontSize: 24, fontWeight: '800', color: colors.navy, textAlign: 'center'},
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  detailCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  detailTop: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  detailBody: {flex: 1},
  courseName: {fontSize: 16, fontWeight: '800', color: colors.navy},
  uniName: {fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 4},
  matchBadge: {
    backgroundColor: agentColors.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rad.full,
    alignSelf: 'flex-start',
  },
  matchText: {fontSize: 11, fontWeight: '700', color: colors.tagGreen},
  detailMeta: {fontSize: 13, color: colors.textSecondary, marginTop: 8},
  refRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8},
  refText: {fontSize: 12, color: colors.textMuted},
  pipelineWrap: {marginTop: 16},
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {color: colors.white, fontSize: 16, fontWeight: '700'},
  secondaryBtn: {
    width: '100%',
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    backgroundColor: colors.white,
  },
  secondaryBtnText: {color: colors.navy, fontSize: 16, fontWeight: '700'},
});
