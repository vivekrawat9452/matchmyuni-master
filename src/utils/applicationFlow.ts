import type {CourseListItem, UpcomingIntake} from '../api/types';

/**
 * Prefer `upcomingIntakes` when present; otherwise build selectable rows from `intakes` strings.
 */
export function intakesForApplication(course: CourseListItem): UpcomingIntake[] {
  if (course.upcomingIntakes?.length) {
    return course.upcomingIntakes;
  }
  return (course.intakes ?? []).map((label, index) => ({
    id: -(index + 1),
    month: 0,
    year: 0,
    label,
    status: 'open' as const,
  }));
}

/** First open intake, else earliest upcoming. */
export function pickDefaultIntake(
  intakes: UpcomingIntake[] | undefined,
): UpcomingIntake | null {
  if (!intakes?.length) {
    return null;
  }
  return intakes.find(i => i.status === 'open') ?? intakes[0];
}

export function formatDeadlineDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Months until intake start (uses month/year from GET /courses/:id upcomingIntakes). */
export function monthsUntilIntake(intake: UpcomingIntake): number | null {
  if (!intake.month || !intake.year) {
    return null;
  }
  const now = new Date();
  const target = new Date(intake.year, intake.month - 1, 1);
  const diff =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return Math.max(0, diff);
}

export function intakeChipLabel(intake: UpcomingIntake): string {
  const months = monthsUntilIntake(intake);
  if (months == null) {
    return intake.label;
  }
  const suffix = ` • ${months} month${months === 1 ? '' : 's'} away`;
  return `${intake.label}${suffix}`;
}

export function deadlineRelativeLabel(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  const diffMonths =
    (d.getFullYear() - now.getFullYear()) * 12 +
    (d.getMonth() - now.getMonth());
  const formatted = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (diffMonths <= 0) {
    return formatted;
  }
  return `${formatted} – ${diffMonths} month${diffMonths === 1 ? '' : 's'} away`;
}
