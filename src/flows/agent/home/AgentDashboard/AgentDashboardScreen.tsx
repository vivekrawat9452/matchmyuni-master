/**
 * Agent Home Dashboard — screens 1.0 (new advisor) & 1.1 (active advisor)
 * Figma node 776:3650 | API: GET /partner/dashboard
 */
import React, {memo, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import {ChevronRight, Zap} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  PartnerDashboardDto,
  PartnerTodayActionDto,
} from '../../../../api/partnerTypes';
import {colors} from '../../../../utils/colors';
import {agentColors, agentLayout, agentType} from '../../agentStyles';
import {agentFlowAssets, agentHomeStatic} from '../../agentAssets';
import {formatAgentMoney} from '../../agentUtils';
import {MilestoneTracker} from '../../components/MilestoneTracker';
import {hPad, rad} from '../../../../utils/sizes';

const H_PAD = hPad(4.1);

type JourneyStepState = 'done' | 'active' | 'locked';

type JourneyStep = {
  id: string;
  label: string;
  state: JourneyStepState;
};

type Props = {
  dashboard: PartnerDashboardDto | null | undefined;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBell: () => void;
  onMilestones: () => void;
  onEarnings: () => void;
  onAddStudent?: () => void;
  onExploreCourses?: () => void;
  onActionPress: (applicationId: string) => void;
  onPipelineSeeAll?: () => void;
};

function deriveJourneySteps(activeStudents: number): JourneyStep[] {
  const studentDone = activeStudents > 0;
  return [
    {id: 'profile', label: 'Profile Approved', state: 'done'},
    {
      id: 'student',
      label: 'Add your first student',
      state: studentDone ? 'done' : 'active',
    },
    {
      id: 'statement',
      label: 'Personal statement',
      state: studentDone ? 'active' : 'locked',
    },
  ];
}

function JourneyStepRow({step}: {step: JourneyStep}) {
  const icon =
    step.state === 'done'
      ? agentFlowAssets.checkDone
      : step.state === 'active'
        ? agentFlowAssets.clockProgress
        : agentFlowAssets.lockStep;

  return (
    <View style={styles.journeyStepRow}>
      <Image source={icon} style={styles.journeyStepIcon} resizeMode="contain" />
      <Text style={[agentType.stepTitle, styles.journeyStepLabel]}>{step.label}</Text>
      <Text
        style={[
          agentType.stepMeta,
          step.state === 'done' && {color: agentColors.doneText},
          step.state === 'active' && {color: colors.primary},
          step.state === 'locked' && {color: colors.textSecondary},
        ]}>
        {step.state === 'done' ? 'Done' : step.state === 'active' ? 'Start →' : 'Locked'}
      </Text>
    </View>
  );
}

function ActionRow({
  action,
  onPress,
}: {
  action: PartnerTodayActionDto;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={styles.actionBody}>
        <Text style={styles.actionTitle} numberOfLines={2}>
          <Text style={styles.actionStudent}>{action.studentName}: </Text>
          {action.actionLabel}
        </Text>
      </View>
      <Text style={styles.actionCta}>
        {action.urgency === 'overdue' ? 'Act Now' : action.urgency === 'due_today' ? 'Review' : 'Chase'} →
      </Text>
    </Pressable>
  );
}

function WebinarCard({
  title,
  date,
  registerLabel,
}: {
  title: string;
  date: string;
  registerLabel: string;
}) {
  return (
    <View style={styles.webinarCard}>
      <View style={styles.webinarBadge}>
        <Text style={styles.webinarBadgeWebinar}>Webinar </Text>
        <Text style={styles.webinarBadgeDot}>•</Text>
        <Text style={styles.webinarBadgeFree}> Free</Text>
      </View>
      <Text style={styles.webinarTitle}>{title}</Text>
      <Text style={styles.webinarDate}>{date}</Text>
      <Text style={styles.webinarRegister}>{registerLabel}</Text>
    </View>
  );
}

export const AgentDashboardScreen = memo(function AgentDashboardScreen({
  dashboard,
  loading,
  refreshing,
  onRefresh,
  onBell,
  onMilestones,
  onEarnings,
  onAddStudent,
  onExploreCourses,
  onActionPress,
  onPipelineSeeAll,
}: Props) {
  const insets = useSafeAreaInsets();
  const greeting = dashboard?.greeting ?? '';
  const firstName = dashboard?.firstName ?? '';
  const milestones = dashboard?.milestones ?? [];
  const activeStudents = dashboard?.stats.activeStudents ?? 0;
  const isNewAdvisor = activeStudents === 0;
  const earnings = dashboard?.earnings;
  const pipeline = dashboard?.pipeline;
  const actions = dashboard?.todaysActions ?? [];
  const currency = earnings?.currency ?? 'USD';

  const journeySteps = useMemo(() => deriveJourneySteps(activeStudents), [activeStudents]);
  const journeyDone = journeySteps.filter(s => s.state === 'done').length;
  const journeyTotal = journeySteps.length;
  const journeyPct = Math.round((journeyDone / journeyTotal) * 100);

  const staticContent = agentHomeStatic;
  const am = staticContent.accountManager;

  const openWhatsApp = () => {
    const phone = am.whatsapp.replace(/\D/g, '');
    void Linking.openURL(`https://wa.me/${phone}`);
  };

  const openEmail = () => {
    void Linking.openURL(`mailto:${am.email}`);
  };

  return (
    <View style={styles.fill}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={agentType.greeting}>{greeting}</Text>
            <Text style={agentType.heroName}>{firstName}</Text>
          </View>
          <Pressable style={styles.bell} onPress={onBell} hitSlop={10}>
            <Image source={agentFlowAssets.bell} style={styles.bellIcon} resizeMode="contain" />
          </Pressable>
        </View>
        {isNewAdvisor ? (
          <View style={styles.welcomeCard}>
            <Text style={agentType.welcome}>{staticContent.welcomeBanner}</Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{dashboard?.stats.offersThisMonth ?? 0}</Text>
              <Text style={styles.statLabel}>Offers this month</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{activeStudents}</Text>
              <Text style={styles.statLabel}>Active Students</Text>
            </View>
          </View>
        )}
      </View>

      {loading && !dashboard ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              {paddingBottom: insets.bottom + (isNewAdvisor ? 120 : 24)},
            ]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}>
            {milestones.length > 0 ? (
              <View style={styles.milestoneCard}>
                <MilestoneTracker milestones={milestones} />
                <Pressable
                  style={[styles.orangeBanner, isNewAdvisor && styles.orangeBannerInset]}
                  onPress={onAddStudent}>
                  <Text style={styles.orangeBannerText}>
                    {isNewAdvisor ? staticContent.milestoneCta : 'Add a new student →'}
                  </Text>
                  {!isNewAdvisor ? <ChevronRight size={16} color={colors.white} /> : null}
                </Pressable>
              </View>
            ) : null}

            {isNewAdvisor ? (
              <Pressable style={styles.journeyCard} onPress={onMilestones}>
                <View style={styles.journeyHeader}>
                  <View style={styles.rocketWrap}>
                    <Image source={agentFlowAssets.rocket} style={styles.rocketIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.journeyHeaderText}>
                    <Text style={agentType.sectionTitle}>{staticContent.journeyTitle}</Text>
                    <Text style={styles.journeySub}>{staticContent.journeySubtitle}</Text>
                  </View>
                </View>
                {journeySteps.map(step => (
                  <JourneyStepRow key={step.id} step={step} />
                ))}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {width: `${journeyPct}%`}]} />
                </View>
                <Text style={styles.stepsMeta}>
                  {journeyDone} of {journeyTotal} steps complete
                </Text>
              </Pressable>
            ) : null}

            {isNewAdvisor ? (
              <View style={styles.accountCard}>
                <Text style={agentType.sectionTitle}>{am.title}</Text>
                <View style={styles.amRow}>
                  <View style={styles.amAvatar}>
                    <Text style={styles.amInitials}>{am.initials}</Text>
                  </View>
                  <View style={styles.amInfo}>
                    <Text style={styles.amName}>{am.name}</Text>
                    <Text style={styles.amRole}>{am.role}</Text>
                    <Text style={styles.amAvailability}>{am.availability}</Text>
                  </View>
                </View>
                <View style={styles.amActions}>
                  <Pressable style={styles.whatsappBtn} onPress={openWhatsApp}>
                    <Image source={agentFlowAssets.whatsapp} style={styles.whatsappIcon} resizeMode="contain" />
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </Pressable>
                  <Pressable style={styles.emailBtn} onPress={openEmail}>
                    <Text style={styles.emailText}>Email →</Text>
                  </Pressable>
                </View>
                <Text style={styles.amFooter}>{am.footer}</Text>
              </View>
            ) : null}

            {isNewAdvisor ? (
              <View style={styles.skillsSection}>
                <View style={styles.skillsHeader}>
                  <Text style={agentType.sectionTitle}>{staticContent.skills.title}</Text>
                  <Pressable hitSlop={8}>
                    <Text style={styles.seeAll}>{staticContent.skills.seeAll}</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.webinarRow}>
                  {staticContent.skills.webinars.map(w => (
                    <WebinarCard
                      key={w.id}
                      title={w.title}
                      date={w.date}
                      registerLabel={w.registerLabel}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {actions.length > 0 ? (
              <View style={styles.actionsCard}>
                <View style={styles.actionsHeader}>
                  <Zap size={18} color={colors.primary} />
                  <View style={styles.actionsHeaderText}>
                    <Text style={agentType.sectionTitle}>Today Actions</Text>
                    <Text style={agentType.bodyMuted}>
                      {actions.length} thing{actions.length === 1 ? '' : 's'} need your attention
                    </Text>
                  </View>
                </View>
                {actions.map(a => (
                  <ActionRow
                    key={a.applicationId}
                    action={a}
                    onPress={() => onActionPress(a.applicationId)}
                  />
                ))}
              </View>
            ) : null}

            {!isNewAdvisor && pipeline ? (
              <View style={styles.pipelineCard}>
                <View style={styles.pipelineHeader}>
                  <Text style={agentType.sectionTitle}>Application Pipeline</Text>
                  <Pressable onPress={onPipelineSeeAll} hitSlop={8}>
                    <Text style={styles.seeAll}>See all →</Text>
                  </Pressable>
                </View>
                <View style={styles.pipelineGrid}>
                  <PipelineStat value={pipeline.shortlisted} label="Shortlisted" />
                  <PipelineStat value={pipeline.applied} label="Applied" />
                  <PipelineStat value={pipeline.offers} label="Offers" />
                  <PipelineStat value={pipeline.enrolled} label="Enrolled" />
                </View>
              </View>
            ) : null}

            {!isNewAdvisor && earnings ? (
              <Pressable style={styles.earningsCard} onPress={onEarnings}>
                <View style={styles.earningsHeader}>
                  <Text style={agentType.sectionTitle}>Earnings Preview</Text>
                  <View style={styles.estimatedTag}>
                    <Text style={styles.estimatedTagText}>Estimated</Text>
                  </View>
                </View>
                <Text style={styles.earningsTotal}>
                  {formatAgentMoney(earnings.total, currency)}
                </Text>
                <View style={styles.earningsBreakdown}>
                  <Text style={styles.earningsConfirmed}>
                    Confirmed (enrolled students):{' '}
                    {formatAgentMoney(earnings.confirmed, currency)}
                  </Text>
                  <Text style={styles.earningsPending}>
                    Pending (applications in progress):{' '}
                    {formatAgentMoney(earnings.pending, currency)}
                  </Text>
                </View>
                {earnings.bonusMessage ? (
                  <Text style={styles.bonusMsg}>{earnings.bonusMessage}</Text>
                ) : null}
                <Text style={styles.ledgerLink}>Full commission ledger available in Profile →</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          {isNewAdvisor ? (
            <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
              <Pressable style={styles.primaryBtn} onPress={onAddStudent}>
                <Text style={styles.primaryBtnText}>{staticContent.footerCta}</Text>
              </Pressable>
              <Pressable onPress={onExploreCourses}>
                <Text style={styles.footerAlt}>{staticContent.footerAlt}</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
});

function PipelineStat({value, label}: {value: number; label: string}) {
  return (
    <View style={styles.pipelineStat}>
      <Text style={styles.pipelineValue}>{value}</Text>
      <Text style={styles.pipelineLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: agentColors.header,
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    borderBottomLeftRadius: rad.xl,
    borderBottomRightRadius: rad.xl,
  },
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  headerText: {flex: 1},
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {width: 20, height: 20},
  welcomeCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statsRow: {flexDirection: 'row', gap: 10, marginTop: 14},
  statPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadiusSm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {fontSize: 20, fontWeight: '800', color: colors.navy},
  statLabel: {fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginTop: 2},
  spinner: {marginTop: 40},
  scroll: {flex: 1},
  content: {paddingHorizontal: H_PAD, paddingTop: 16, gap: 14},
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  orangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: agentLayout.pillRadius,
    paddingHorizontal: 16,
    minHeight: 34,
    paddingVertical: 8,
  },
  orangeBannerInset: {
    marginTop: 0,
  },
  orangeBannerText: {fontSize: 14, fontWeight: '600', color: colors.white, textAlign: 'center'},
  journeyCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  journeyHeader: {flexDirection: 'row', gap: 12, marginBottom: 8},
  rocketWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rocketIcon: {width: 32, height: 32},
  journeyHeaderText: {flex: 1, justifyContent: 'center'},
  journeySub: {...agentType.bodyMuted, marginTop: 4},
  journeyStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  journeyStepIcon: {width: 24, height: 24},
  journeyStepLabel: {flex: 1},
  progressTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.profileProgressTrack,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {height: 9, borderRadius: 99, backgroundColor: colors.primary},
  stepsMeta: {...agentType.bodyMuted, marginTop: 8, textAlign: 'center'},
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  amRow: {flexDirection: 'row', gap: 14, alignItems: 'center'},
  amAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.yellowBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amInitials: {fontSize: 24, fontWeight: '800', color: colors.white},
  amInfo: {flex: 1, gap: 2},
  amName: {fontSize: 16, fontWeight: '700', color: colors.navy},
  amRole: {fontSize: 12, fontWeight: '600', color: colors.textSecondary},
  amAvailability: {fontSize: 11, fontWeight: '700', color: colors.navy, marginTop: 2},
  amActions: {flexDirection: 'row', gap: 10},
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.agentMint,
    borderRadius: agentLayout.pillRadius,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  whatsappIcon: {width: 20, height: 20},
  whatsappText: {fontSize: 14, fontWeight: '600', color: colors.white},
  emailBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: agentLayout.pillRadius,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  emailText: {fontSize: 14, fontWeight: '600', color: colors.white},
  amFooter: {...agentType.bodyMuted, textAlign: 'center'},
  skillsSection: {gap: 10},
  skillsHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  seeAll: {fontSize: 14, fontWeight: '600', color: colors.primary},
  webinarRow: {gap: 10, paddingRight: 8},
  webinarCard: {
    width: 245,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  webinarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.tagGreen,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  webinarBadgeWebinar: {fontSize: 12, fontWeight: '700', color: colors.tagGreen},
  webinarBadgeDot: {fontSize: 12, fontWeight: '700', color: colors.tagGreen},
  webinarBadgeFree: {fontSize: 12, fontWeight: '700', color: colors.tagGreen},
  webinarTitle: {fontSize: 14, fontWeight: '700', color: colors.navy, lineHeight: 18},
  webinarDate: {fontSize: 11, fontWeight: '700', color: colors.textSecondary},
  webinarRegister: {fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4},
  actionsCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  actionsHeader: {flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8},
  actionsHeaderText: {flex: 1},
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  actionBody: {flex: 1},
  actionTitle: {fontSize: 13, fontWeight: '600', color: colors.navy, lineHeight: 18},
  actionStudent: {fontWeight: '800'},
  actionCta: {fontSize: 12, fontWeight: '700', color: colors.primary},
  pipelineCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  pipelineHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  pipelineGrid: {flexDirection: 'row', marginTop: 14},
  pipelineStat: {flex: 1, alignItems: 'center'},
  pipelineValue: {fontSize: 22, fontWeight: '800', color: colors.navy},
  pipelineLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  earningsCard: {
    backgroundColor: colors.white,
    borderRadius: agentLayout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  earningsHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  estimatedTag: {
    backgroundColor: agentColors.inProgressBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: rad.full,
  },
  estimatedTagText: {fontSize: 10, fontWeight: '700', color: agentColors.inProgressText},
  earningsTotal: {fontSize: 32, fontWeight: '800', color: colors.navy, marginTop: 8},
  earningsBreakdown: {marginTop: 10, gap: 4},
  earningsConfirmed: {fontSize: 12, fontWeight: '600', color: colors.tagGreen},
  earningsPending: {fontSize: 12, fontWeight: '600', color: colors.primary},
  bonusMsg: {...agentType.bodyMuted, marginTop: 10},
  ledgerLink: {fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginTop: 8},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    height: agentLayout.buttonHeight,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {color: colors.white, fontSize: 16, fontWeight: '600'},
  footerAlt: {
    ...agentType.bodyMuted,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
