/**
 * CourseDetailsScreen — Figma discover_home_2_5 (node 416:5401)
 *
 * Layout (scroll):
 *  ─ Header (cream bg): ← Back  |  Course Details
 *  ─ Hero: full-width logo/photo, match+prime badges
 *  ─ Body:
 *     • Course name + university row + scholarship chip
 *     • Estimated yearly cost card (GET /courses/:id fees)
 *     • Stat pill row: scholarship / duration (GET /courses/:id)
 *     • "Why you match" bullets (GET /recommendations/discover whyMatch when passed)
 *     • "Course Overview" + meta table
 *     • "✦ Scholarship Available" teal card (GET /courses/:id scholarshipDetails)
 *     • "Entry Requirements" table rows
 *  ─ Sticky footer: [Shortlist]  [Start Application →]
 *
 * Commented out (no API in prompts/API_Docs.md):
 *   - Cost Breakdown expander
 *   - Visa rate stat
 *   - Why Prime card
 */
import React, {memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../../utils/colors';
import {FontSizes, Weights, Styles} from '../../../utils';
import {hPad, rad} from '../../../utils/sizes';
import type {CourseListItem} from '../../../api/types';
import {
  ChevronLeftIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
} from '../../../components/icons/ApplicationIcons';
import {ChevronDown} from 'lucide-react-native';

const H_PAD = hPad(5);

export type CourseDetailsScreenProps = {
  course: CourseListItem | null | undefined;
  matchPct: number;
  whyMatch?: string[];
  loading: boolean;
  isShortlisted?: boolean;
  onBack: () => void;
  onShortlist: () => void;
  onStartApplication: () => void;
};

function scholarshipPercent(course: CourseListItem): number {
  const details = course.scholarshipDetails;
  if (details?.percentageMax != null) {
    return details.percentageMax;
  }
  const legacy = course.scholarshipOnTuitionFee?.match(/(\d+)/);
  return legacy ? parseInt(legacy[1], 10) : 0;
}

function scholarshipChipLabel(course: CourseListItem): string | null {
  const pct = scholarshipPercent(course);
  if (pct > 0) {
    return `${pct}% scholarship`;
  }
  if (course.scholarshipAvailable) {
    return 'Scholarship available';
  }
  return null;
}

function scholarshipStatLabel(course: CourseListItem): string | null {
  const details = course.scholarshipDetails;
  if (details?.percentageMax != null) {
    return `Up to ${details.percentageMax}%`;
  }
  if (course.scholarshipOnTuitionFee) {
    return `Up to ${course.scholarshipOnTuitionFee}`;
  }
  return null;
}

function scholarshipPromoText(course: CourseListItem, pct: number): string | null {
  if (pct <= 0) {
    return null;
  }
  const years =
    course.scholarshipDetails?.validForYears === 'all_years'
      ? 'All years'
      : course.scholarshipDetails?.validForYears?.replace(/_/g, ' ') ?? 'All years';
  return `${pct}% off - Auto applied - ${years}`;
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function SectionTitle({children}: {children: string}) {
  return <Text style={sct.title}>{children}</Text>;
}
const sct = StyleSheet.create({
  title: {fontSize: FontSizes.body, fontWeight: Weights.extrabold, color: colors.navy, marginBottom: 12},
});

/** Row in Entry Requirements / meta tables */
function TableRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[tr.row, last && tr.last]}>
      <Text style={tr.label}>{label}</Text>
      <Text style={tr.value}>{value}</Text>
    </View>
  );
}
const tr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  last: {borderBottomWidth: 0},
  label: {fontSize: FontSizes.chip, color: colors.textSecondary, fontWeight: Weights.medium, flex: 1},
  value: {
    fontSize: FontSizes.chip,
    fontWeight: Weights.bold,
    color: colors.navy,
    flex: 1.2,
    textAlign: 'right',
  },
});

/** "Why you match" bullet from GET /recommendations/discover */
function WhyMatchBullet({text}: {text: string}) {
  return (
    <View style={mb.row}>
      <CheckCircleIcon size={22} color={colors.tagGreen} />
      <Text style={mb.text}>{text}</Text>
    </View>
  );
}

/** Fallback bullet — wire when user-journey API is available */
function MatchBullet({
  type,
  prefix,
  highlight,
}: {
  type: 'green' | 'orange';
  prefix: string;
  highlight?: string;
}) {
  return (
    <View style={mb.row}>
      {type === 'orange' ? (
        <ArrowUpCircleIcon size={22} color={colors.primary} />
      ) : (
        <CheckCircleIcon size={22} color={colors.tagGreen} />
      )}
      <Text style={mb.text}>
        {prefix}
        {highlight ? (
          <Text style={mb.highlight}> {highlight}</Text>
        ) : null}
      </Text>
    </View>
  );
}
const mb = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10},
  text: {flex: 1, fontSize: FontSizes.chip, color: colors.navy, lineHeight: 19, paddingTop: 2},
  highlight: {color: colors.primary, fontWeight: Weights.bold},
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export const CourseDetailsScreen = memo(function CourseDetailsScreen({
  course,
  matchPct,
  whyMatch = [],
  loading,
  isShortlisted = false,
  onBack,
  onShortlist,
  onStartApplication,
}: CourseDetailsScreenProps) {
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={[s.fill, s.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[s.fill, s.center]}>
        <Text style={s.notFound}>Course not found</Text>
      </View>
    );
  }

  const sym = course.currencySymbol ?? '$';
  const feeVal = course.applicableTuitionFee;
  const pct = scholarshipPercent(course);
  const fee = feeVal != null ? `${sym}${Number(feeVal).toLocaleString()}` : null;
  const listedFee =
    feeVal != null && pct > 0 && pct < 100
      ? `${sym}${Math.round(feeVal / (1 - pct / 100)).toLocaleString()}`
      : null;
  const schChip = scholarshipChipLabel(course);
  const schStat = scholarshipStatLabel(course);
  const promoText = scholarshipPromoText(course, pct);
  const showScholarshipCard =
    course.scholarshipAvailable === true || pct > 0 || !!course.scholarshipOnTuitionFee;

  const location = [course.city, course.country].filter(Boolean).join(', ');
  const intake =
    course.upcomingIntakes?.map(i => i.label).join(', ') ??
    (Array.isArray(course.intakes) ? course.intakes.join(', ') : (course.intakes ?? null));

  return (
    <View style={s.fill}>

      {/* ── Header (cream, NOT orange) ──────────────────────────────── */}
      <View style={[s.header, {paddingTop: insets.top + 8}]}>
        <Pressable style={s.backBtn} onPress={onBack} hitSlop={12}>
          <ChevronLeftIcon size={20} color={colors.navy} />
          <Text style={s.backLabel}>Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Course Details</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        style={s.fill}
        contentContainerStyle={{paddingBottom: insets.bottom + 96}}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero image ─────────────────────────────────────────────── */}
        <View style={s.hero}>
          {course.universityLogo ? (
            <Image
              source={{uri: course.universityLogo}}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          ) : (
            <View style={s.heroFallback}>
              <Text style={s.heroLetter}>{course.universityName?.charAt(0) ?? 'U'}</Text>
            </View>
          )}

          {/* Match badge */}
          <View style={s.matchBadge}>
            <Text style={s.matchText}>{matchPct}% Match</Text>
          </View>

          {/* Prime badge */}
          {course.isPrime ? (
            <View style={s.primeBadge}>
              <StarIcon size={10} color={colors.navy} />
              <Text style={s.primeText}>Prime</Text>
            </View>
          ) : null}
        </View>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Course name + university */}
          <Text style={s.courseName}>{course.name}</Text>
          <View style={s.uniRow}>
            <View style={s.uniDot} />
            <Text style={s.uniName}>{course.universityName?.toUpperCase()}</Text>
          </View>
          {schChip ? (
            <View style={s.schChipRow}>
              <CheckCircleIcon size={14} color={colors.tagGreen} />
              <Text style={s.schChipText}>{schChip}</Text>
            </View>
          ) : null}

          {/* Estimated yearly cost card — GET /courses/:id applicableTuitionFee */}
          {fee ? (
            <View style={s.costCard}>
              <Text style={s.costLabel}>Estimated yearly cost</Text>
              <View style={s.costPriceRow}>
                <Text style={s.costMain}>{fee}</Text>
                <Text style={s.costPer}>/ year</Text>
              </View>
              {listedFee ? (
                <Text style={s.costListed}>Listed at {listedFee}</Text>
              ) : null}
              {promoText ? (
                <View style={s.costPromo}>
                  <Text style={s.costPromoText}>{promoText}</Text>
                </View>
              ) : null}
              {/* Cost Breakdown — no dedicated endpoint in prompts/API_Docs.md; uncomment when API ships
              <Pressable style={s.costBreakdownRow} hitSlop={8}>
                <Text style={s.costBreakdownLabel}>Cost breakdown</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>
              */}
            </View>
          ) : null}

          {/* Stats row — scholarship + duration from GET /courses/:id */}
          {(schStat || course.duration || course.country) ? (
            <View style={s.statsCard}>
              {schStat ? (
                <View style={s.statCol}>
                  <Text style={s.statValueAccent}>{schStat}</Text>
                  <Text style={s.statLabel}>Scholarship</Text>
                </View>
              ) : null}
              {/* Visa rate — no field in prompts/API_Docs.md or prompts/apis; uncomment when API ships
              {course.country ? (
                <View style={[s.statCol, s.statColBorder]}>
                  <Text style={s.statValueGreen}>89%</Text>
                  <Text style={s.statLabel}>Visa rate</Text>
                </View>
              ) : null}
              */}
              {course.duration ? (
                <View style={[s.statCol, schStat ? s.statColBorder : null]}>
                  <Text style={s.statValue}>
                    {course.duration} year{course.duration > 1 ? 's' : ''}
                  </Text>
                  <Text style={s.statLabel}>Duration</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Why you match — active when whyMatch passed from GET /recommendations/discover */}
          {whyMatch.length > 0 ? (
            <View style={s.section}>
              <SectionTitle>Why you match</SectionTitle>
              {whyMatch.map((line, index) => (
                <WhyMatchBullet key={`${index}-${line}`} text={line} />
              ))}
            </View>
          ) : null}

          {/* Why you match fallback — no user-journey endpoint; uncomment when API ships
          <View style={s.section}>
            <SectionTitle>Why you match</SectionTitle>
            {course.category ? (
              <MatchBullet
                type="green"
                prefix="Matches your field of study:"
                highlight={course.category}
              />
            ) : null}
            {fee ? (
              <MatchBullet
                type="green"
                prefix="Within your budget range:"
                highlight={fee}
              />
            ) : null}
            {course.country ? (
              <MatchBullet
                type="orange"
                prefix="High visa approval rate for this destination"
                highlight="89% success"
              />
            ) : null}
          </View>
          */}

          {/* Why Prime — no user-journey endpoint; uncomment when API ships
          {course.isPrime ? (
            <View style={[s.section, s.amberCard]}>
              <Text style={s.amberTitle}>Why Prime</Text>
              <Text style={s.amberBody}>
                {course.description ??
                  'This course has been shortlisted as a top match based on your profile, budget and visa success rates.'}
              </Text>
            </View>
          ) : null}
          */}

          {/* Course Overview */}
          <View style={s.section}>
            <SectionTitle>Course Overview</SectionTitle>
            {course.description ? (
              <Text style={s.bodyText}>{course.description}</Text>
            ) : (
              <Text style={s.bodyMuted}>Course overview not available.</Text>
            )}

            {/* Meta table */}
            {(intake || course.language || course.degreeLevel || location) ? (
              <View style={s.metaCard}>
                {intake ? (
                  <TableRow label="Intake" value={intake} />
                ) : null}
                {course.language ? (
                  <TableRow label="Language" value={course.language} />
                ) : null}
                {course.degreeLevel ? (
                  <TableRow label="Qualifications" value={course.degreeLevel} />
                ) : null}
                {location ? (
                  <TableRow label="Location" value={location} last />
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Scholarship Available — GET /courses/:id scholarshipDetails */}
          {showScholarshipCard ? (
            <View style={[s.section, s.scholarshipCard]}>
              <View style={s.scholarshipAccent} />
              <View style={s.scholarshipBody}>
                <View style={s.scholarshipTitleRow}>
                  <StarIcon size={16} color={colors.yellowBadge} />
                  <Text style={s.scholarshipTitle}>Scholarship Available</Text>
                </View>
                <Text style={s.scholarshipText}>
                  {course.scholarshipDetails?.description ??
                    `Global scholarship award — up to ${schStat ?? `${pct}%`} tuition reduction for international students.`}
                </Text>
                <Pressable hitSlop={8}>
                  <Text style={s.scholarshipLink}>Check eligibility →</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Entry Requirements */}
          <View style={s.section}>
            <SectionTitle>Entry Requirements</SectionTitle>
            <View style={s.reqCard}>
              {course.minimumGPA ? (
                <TableRow label="Minimum GPA" value={course.minimumGPA} />
              ) : (
                <TableRow label="Minimum GPA" value="3.5 / 4.0" />
              )}
              <TableRow
                label="English Proficiency"
                value={course.additionalRequirements ?? 'IELTS 6.5+'}
              />
              {course.applicationFee ? (
                <TableRow
                  label="Application Fee"
                  value={`${course.currencySymbol ?? '$'}${course.applicationFee}`}
                />
              ) : null}
              <TableRow
                label="Documents"
                value="Transcripts, SOP, 2 References"
                last
              />
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── Sticky footer ──────────────────────────────────────────── */}
      <View style={[s.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={[s.shortlistBtn, isShortlisted && s.shortlistBtnActive]}
          onPress={onShortlist}>
          <Text style={[s.shortlistLabel, isShortlisted && s.shortlistLabelActive]}>
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Text>
        </Pressable>
        <Pressable style={s.applyBtn} onPress={onStartApplication}>
          <Text style={s.applyLabel}>Start Application →</Text>
        </Pressable>
      </View>
    </View>
  );
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fill: Styles.screen,
  center: Styles.center,
  notFound: {fontSize: FontSizes.body, color: colors.textSecondary},

  // ── Header (cream, dark text) ──────────────────────────────────────
  header: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  backLabel: {fontSize: FontSizes.size15, color: colors.navy, fontWeight: Weights.medium},
  headerTitle: {
    fontSize: FontSizes.size17,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    flex: 2,
    textAlign: 'center',
  },
  headerRight: {flex: 1},

  // ── Hero ──────────────────────────────────────────────────────────
  hero: {
    height: 230,
    width: '100%',
    backgroundColor: colors.white,
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  heroLetter: {fontSize: 80, fontWeight: Weights.extrabold, color: colors.navy, opacity: 0.15},

  matchBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    ...Styles.matchBadge,
  },
  matchText: Styles.matchBadgeText,

  primeBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.yellowBadge,
    borderRadius: rad.full,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  primeText: {fontSize: FontSizes.size11, fontWeight: Weights.bold, color: colors.navy},

  // ── Body ──────────────────────────────────────────────────────────
  body: {padding: H_PAD, paddingTop: 20},

  courseName: {
    fontSize: FontSizes.size22,
    fontWeight: Weights.extrabold,
    color: colors.navy,
    lineHeight: 29,
    marginBottom: 6,
  },
  uniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 16,
  },
  uniDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  uniName: {
    fontSize: FontSizes.size11,
    fontWeight: Weights.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  schChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  schChipText: {
    fontSize: FontSizes.caption,
    fontWeight: Weights.semibold,
    color: colors.tagGreen,
  },

  costCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    gap: 6,
  },
  costLabel: {fontSize: FontSizes.caption, color: colors.textSecondary, fontWeight: Weights.medium},
  costPriceRow: {flexDirection: 'row', alignItems: 'baseline', gap: 4},
  costMain: {fontSize: FontSizes.size28, fontWeight: Weights.extrabold, color: colors.primary},
  costPer: {fontSize: FontSizes.small, color: colors.textMuted},
  costListed: {
    fontSize: FontSizes.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  costPromo: {
    alignSelf: 'flex-start',
    backgroundColor: colors.promoBg,
    borderRadius: rad.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  costPromoText: {fontSize: FontSizes.caption, fontWeight: Weights.semibold, color: colors.tagGreen},
  // Cost Breakdown — uncomment when API ships
  costBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  costBreakdownLabel: {fontSize: FontSizes.chip, fontWeight: Weights.semibold, color: colors.navy},

  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statCol: {flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8},
  statColBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  statValue: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.navy},
  statValueAccent: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.primary},
  statValueGreen: {fontSize: FontSizes.body, fontWeight: Weights.bold, color: colors.tagGreen},
  statLabel: {fontSize: FontSizes.caption, color: colors.textSecondary, marginTop: 4},

  // ── Sections ──────────────────────────────────────────────────────
  section: {marginBottom: 24},

  bodyText: {
    fontSize: FontSizes.chip,
    color: colors.navy,
    lineHeight: 20,
    marginBottom: 14,
  },
  bodyMuted: {
    fontSize: FontSizes.chip,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },

  metaCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  reqCard: {
    backgroundColor: colors.white,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },

  // Why Prime — uncomment when user-journey API ships
  amberCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.yellowBadge,
    borderRadius: rad.lg,
    padding: 16,
  },
  amberTitle: {
    fontSize: FontSizes.small,
    fontWeight: Weights.extrabold,
    color: '#92400E',
    marginBottom: 8,
  },
  amberBody: {fontSize: FontSizes.chip, color: '#78350F', lineHeight: 19},

  scholarshipCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: rad.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  scholarshipAccent: {
    width: 4,
    backgroundColor: colors.yellowBadge,
  },
  scholarshipBody: {flex: 1, padding: 16, gap: 6},
  scholarshipTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  scholarshipTitle: {fontSize: FontSizes.small, fontWeight: Weights.extrabold, color: colors.navy},
  scholarshipText: {fontSize: FontSizes.chip, color: colors.navy, lineHeight: 19},
  scholarshipLink: {fontSize: FontSizes.chip, fontWeight: Weights.bold, color: colors.primary},

  // ── Footer ────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shortlistBtn: {
    flex: 1,
    height: 52,
    borderRadius: rad.full,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortlistBtnActive: {backgroundColor: '#FFF7F5'},
  shortlistLabel: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.primary},
  shortlistLabelActive: {color: colors.primary},
  applyBtn: {
    flex: 2,
    height: 52,
    borderRadius: rad.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {fontSize: FontSizes.size15, fontWeight: Weights.bold, color: colors.white},
});
