import type {CourseListItem} from '../../../api/types';

export type CostBreakdownLineItem = {
  label: string;
  subtitle: 'Per year' | 'One-time';
  amount: number;
};

export type CourseCostBreakdown = {
  lineItems: CostBreakdownLineItem[];
  firstYearTotal: number;
  recurringYearlyCost: number | null;
  currencySymbol: string;
  currency: string;
  courseSubtitle: string;
};

function positiveFee(value: number | null | undefined): number {
  return value != null && value > 0 ? value : 0;
}

/** First-year and recurring fees from GET /courses/:id fee fields. */
export function buildCourseCostBreakdown(
  course: CourseListItem,
): CourseCostBreakdown | null {
  const lineItems: CostBreakdownLineItem[] = [];

  const tuition = positiveFee(course.applicableTuitionFee);
  if (tuition > 0) {
    lineItems.push({label: 'Tuition fee', subtitle: 'Per year', amount: tuition});
  }

  const application = positiveFee(course.applicationFee);
  if (application > 0) {
    lineItems.push({label: 'Application fee', subtitle: 'One-time', amount: application});
  }

  const registration = positiveFee(course.registrationFee);
  if (registration > 0) {
    lineItems.push({label: 'Registration fee', subtitle: 'One-time', amount: registration});
  }

  const deposit = positiveFee(course.depositFee);
  if (deposit > 0) {
    lineItems.push({label: 'Deposit fee', subtitle: 'One-time', amount: deposit});
  }

  const examination = positiveFee(course.examinationFee);
  if (examination > 0) {
    lineItems.push({label: 'Examination fee', subtitle: 'One-time', amount: examination});
  }

  for (const other of course.otherFees ?? []) {
    if (other.amount > 0 && other.frequency !== 'annual') {
      lineItems.push({label: other.name, subtitle: 'One-time', amount: other.amount});
    }
  }

  if (!lineItems.length) {
    return null;
  }

  const firstYearTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    lineItems,
    firstYearTotal,
    recurringYearlyCost: tuition > 0 ? tuition : null,
    currencySymbol: course.currencySymbol ?? '$',
    currency: course.currency ?? 'USD',
    courseSubtitle: `${course.name} · ${course.universityName}`,
  };
}
