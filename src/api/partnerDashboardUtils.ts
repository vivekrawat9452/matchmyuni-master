/**
 * Normalizes `GET /partner/dashboard` payloads to PartnerDashboardDto.
 * See prompts/apis/agent-admin-api-REFERENCE.md
 */
import type {
  MilestoneStatus,
  PartnerDashboardDto,
  PartnerEarningsPreviewDto,
  PartnerMilestoneDto,
  PartnerPipelineSummaryDto,
  PartnerTodayActionDto,
} from './partnerTypes';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function pickArray(obj: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const v = obj[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function normalizeMilestoneStatus(raw: unknown): MilestoneStatus {
  const s = String(raw ?? 'locked')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  if (s === 'achieved' || s === 'complete' || s === 'completed' || s === 'done') return 'achieved';
  if (s === 'in_progress' || s === 'inprogress' || s === 'active' || s === 'current') {
    return 'in_progress';
  }
  return 'locked';
}

function normalizeMilestones(raw: Record<string, unknown>): PartnerMilestoneDto[] {
  return pickArray(raw, 'milestones', 'milestoneProgress', 'milestone_progress')
    .filter(isRecord)
    .map((m, i) => ({
      id: pickString(m, 'id', 'key') || `milestone-${i}`,
      label: pickString(m, 'label', 'name', 'title') || `Milestone ${i + 1}`,
      status: normalizeMilestoneStatus(m.status ?? m.state),
      currentCount: pickNumber(m, 'currentCount', 'current_count', 'current'),
      targetCount: pickNumber(m, 'targetCount', 'target_count', 'target'),
      achievedAt: pickString(m, 'achievedAt', 'achieved_at') || null,
      rewardLabel: pickString(m, 'rewardLabel', 'reward_label') || null,
    }));
}

function normalizeTodayActions(raw: Record<string, unknown>): PartnerTodayActionDto[] {
  return pickArray(raw, 'todaysActions', 'todayActions', 'todays_actions', 'today_actions', 'actions')
    .filter(isRecord)
    .map((a, i) => ({
      applicationId:
        pickString(a, 'applicationId', 'application_id', 'id') || `action-${i}`,
      studentName: pickString(a, 'studentName', 'student_name', 'student'),
      courseName: pickString(a, 'courseName', 'course_name', 'course'),
      universityName: pickString(a, 'universityName', 'university_name', 'university'),
      urgency: (pickString(a, 'urgency') || 'upcoming') as PartnerTodayActionDto['urgency'],
      urgencyLabel: pickString(a, 'urgencyLabel', 'urgency_label'),
      actionLabel: pickString(a, 'actionLabel', 'action_label', 'label'),
      actionType: pickString(a, 'actionType', 'action_type', 'type'),
    }));
}

function normalizePipeline(stats: Record<string, unknown>): PartnerPipelineSummaryDto {
  const pipeline = isRecord(stats.pipeline)
    ? stats.pipeline
    : isRecord(stats.pipelineSummary)
      ? stats.pipelineSummary
      : isRecord(stats.pipeline_summary)
        ? stats.pipeline_summary
        : stats;

  return {
    shortlisted: pickNumber(pipeline, 'shortlisted', 'shortlist'),
    applied: pickNumber(pipeline, 'applied'),
    offers: pickNumber(pipeline, 'offers', 'offer'),
    enrolled: pickNumber(pipeline, 'enrolled', 'enrolment'),
  };
}

function normalizeEarnings(stats: Record<string, unknown>): PartnerEarningsPreviewDto {
  const earnings = isRecord(stats.earnings)
    ? stats.earnings
    : isRecord(stats.earningsPreview)
      ? stats.earningsPreview
      : isRecord(stats.earnings_preview)
        ? stats.earnings_preview
        : {};

  return {
    currency: pickString(earnings, 'currency') || 'USD',
    confirmed: pickNumber(earnings, 'confirmed'),
    pending: pickNumber(earnings, 'pending'),
    potential: pickNumber(earnings, 'potential') || undefined,
    total: pickNumber(earnings, 'total'),
    applicationCount: pickNumber(earnings, 'applicationCount', 'application_count') || undefined,
    bonusMessage: pickString(earnings, 'bonusMessage', 'bonus_message') || null,
  };
}

/** Split combined greeting ("Good morning, Kwame") into header lines. */
export function parseDashboardHeader(raw: Record<string, unknown>): {
  greeting: string;
  firstName: string;
} {
  let firstName = pickString(raw, 'firstName', 'first_name', 'name');
  let greeting = pickString(raw, 'greeting', 'greetingText', 'greeting_text');

  if (!firstName && greeting) {
    const match = greeting.match(
      /^(Good\s+(?:morning|afternoon|evening)),?\s+(.+)$/i,
    );
    if (match) {
      greeting = `${match[1]},`;
      firstName = match[2].trim();
    }
  }

  if (firstName && greeting.includes(firstName)) {
    greeting = greeting.replace(new RegExp(`\\s*,?\\s*${firstName}\\s*$`), '').trim();
    if (greeting && !greeting.endsWith(',')) greeting = `${greeting},`;
  }

  return {greeting, firstName};
}

export function normalizePartnerDashboard(raw: unknown): PartnerDashboardDto | null {
  if (!isRecord(raw)) return null;

  const {greeting, firstName} = parseDashboardHeader(raw);
  const statsBlock = isRecord(raw.stats) ? raw.stats : raw;

  const stats = {
    activeStudents:
      pickNumber(statsBlock, 'activeStudents', 'active_students', 'totalActiveStudents') ||
      pickNumber(raw, 'activeStudents', 'active_students'),
    offersThisMonth:
      pickNumber(statsBlock, 'offersThisMonth', 'offers_this_month', 'offersReceivedThisMonth') ||
      pickNumber(raw, 'offersThisMonth', 'offers_this_month'),
  };

  return {
    greeting,
    firstName,
    stats,
    milestones: normalizeMilestones(raw),
    todaysActions: normalizeTodayActions(raw),
    pipeline: normalizePipeline(raw),
    earnings: normalizeEarnings(raw),
  };
}
