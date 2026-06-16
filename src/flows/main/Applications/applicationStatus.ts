import type {ApplicationStatus} from '../../../api/types';
import {colors} from '../../../utils/colors';

export const APPLICATION_STATUS_STEPS: {
  key: ApplicationStatus;
  label: string;
}[] = [
  {key: 'created', label: 'Application created'},
  {key: 'applied', label: 'Submitted to university'},
  {key: 'under_review', label: 'Under review'},
  {key: 'conditional_offer', label: 'Conditional offer'},
  {key: 'unconditional_offer', label: 'Unconditional offer'},
  {key: 'offer_accepted', label: 'Offer accepted'},
  {key: 'visa_applied', label: 'Visa applied'},
  {key: 'visa_approved', label: 'Visa approved'},
  {key: 'registered', label: 'Registered'},
];

const STATUS_RANK: Record<string, number> = Object.fromEntries(
  APPLICATION_STATUS_STEPS.map((s, i) => [s.key, i]),
);

/** Map legacy API statuses onto the timeline index. */
const STATUS_ALIASES: Record<string, ApplicationStatus> = {
  submitted: 'applied',
  offer_received: 'conditional_offer',
  accepted: 'offer_accepted',
};

export function normalizeApplicationStatus(status: string): ApplicationStatus {
  const lower = status.toLowerCase();
  if (lower in STATUS_ALIASES) {
    return STATUS_ALIASES[lower];
  }
  return lower as ApplicationStatus;
}

export function statusStepIndex(status: string): number {
  const key = normalizeApplicationStatus(status);
  if (key === 'rejected' || key === 'visa_rejected' || key === 'withdrawn') {
    return -1;
  }
  if (key === 'deferred' || key === 'reported' || key === 'offer_declined') {
    return STATUS_RANK.created ?? 0;
  }
  return STATUS_RANK[key] ?? 0;
}

export function statusLabel(status: string): string {
  const key = normalizeApplicationStatus(status);
  const found = APPLICATION_STATUS_STEPS.find(s => s.key === key);
  if (found) {
    return found.label;
  }
  return status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

export function statusBadgeColors(status: string): {bg: string; text: string} {
  const key = normalizeApplicationStatus(status);
  switch (key) {
    case 'created':
    case 'applied':
      return {bg: '#EEF4FF', text: '#2563EB'};
    case 'under_review':
      return {bg: '#FEFCE8', text: '#CA8A04'};
    case 'conditional_offer':
    case 'unconditional_offer':
    case 'offer_received':
      return {bg: '#F0FFF4', text: '#16A34A'};
    case 'offer_accepted':
    case 'visa_applied':
    case 'visa_approved':
    case 'registered':
    case 'accepted':
      return {bg: '#DCFCE7', text: '#15803D'};
    case 'rejected':
    case 'visa_rejected':
      return {bg: '#FFF1F2', text: '#E11D48'};
    case 'withdrawn':
    case 'deferred':
      return {bg: '#F5F5F5', text: '#6B7280'};
    default:
      return {bg: '#FFF7ED', text: colors.primary};
  }
}

function toFeeAmount(value: number | string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** $0.00 / $0.00 — no payment required (e.g. waived application fee). */
export function isZeroFeeFullyPaid(
  paidAmount: number | string | null | undefined,
  requiredAmount: number | string | null | undefined,
): boolean {
  return toFeeAmount(paidAmount) === 0 && toFeeAmount(requiredAmount) === 0;
}

export function feeStatusLabel(
  status: string | null | undefined,
  paidAmount?: number | string | null,
  requiredAmount?: number | string | null,
): string {
  if (isZeroFeeFullyPaid(paidAmount, requiredAmount)) {
    return 'Free';
  }
  if (!status || status === 'unpaid') {
    return 'Fee unpaid';
  }
  if (status === 'pending' || status === 'partially_paid') {
    return 'Payment pending';
  }
  if (status === 'paid') {
    return 'Fee paid';
  }
  return status.replace(/_/g, ' ');
}
