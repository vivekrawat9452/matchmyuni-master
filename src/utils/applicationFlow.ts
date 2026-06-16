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
