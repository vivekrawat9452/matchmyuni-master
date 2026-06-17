import type {PipelineStage} from '../../api/partnerTypes';
import {colors} from '../../utils/colors';

export const PIPELINE_LABELS = ['Applied', 'In-Review', 'Decision', 'Enrolled'] as const;

const STAGE_INDEX: Record<PipelineStage, number> = {
  shortlisted: 0,
  applied: 1,
  decision: 2,
  enrolled: 3,
};

/** Maps API pipeline stage to active step index (0–3). */
export function pipelineActiveIndex(stage: PipelineStage): number {
  return STAGE_INDEX[stage] ?? 0;
}

export function formatAgentMoney(amount: number, currency = 'USD'): string {
  const sym = currency === 'USD' || currency === '$' ? '$' : `${currency} `;
  return `${sym}${amount.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
}

export function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function statusTagLabel(tag: string): string {
  return tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const statusTagColors: Record<string, {bg: string; text: string}> = {
  action_needed: {bg: colors.matchBadgeBg, text: colors.matchBadgeText},
  on_track: {bg: colors.tagGreenBg, text: colors.tagGreen},
  offer_received: {bg: colors.promoBg, text: colors.navy},
};
