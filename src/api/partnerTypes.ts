/** DTOs for partner (agent) APIs — see prompts/apis/agent-admin-api-REFERENCE.md */

export type MilestoneStatus = 'achieved' | 'in_progress' | 'locked';

export interface PartnerMilestoneDto {
  id: string;
  label: string;
  status: MilestoneStatus;
  currentCount?: number;
  targetCount?: number;
  achievedAt?: string | null;
  rewardLabel?: string | null;
}

export type ActionUrgency = 'overdue' | 'due_today' | 'upcoming';
export type ActionType =
  | 'documents_missing'
  | 'offer_awaiting_response'
  | 'registration_fee_pending'
  | string;

export interface PartnerTodayActionDto {
  applicationId: string;
  studentName: string;
  courseName: string;
  universityName: string;
  urgency: ActionUrgency;
  urgencyLabel: string;
  actionLabel: string;
  actionType: ActionType;
}

export interface PartnerPipelineSummaryDto {
  shortlisted: number;
  applied: number;
  offers: number;
  enrolled: number;
}

export interface PartnerEarningsPreviewDto {
  currency: string;
  confirmed: number;
  pending: number;
  potential?: number;
  total: number;
  applicationCount?: number;
  bonusMessage?: string | null;
}

export interface PartnerDashboardDto {
  greeting: string;
  firstName: string;
  stats: {
    activeStudents: number;
    offersThisMonth: number;
  };
  milestones: PartnerMilestoneDto[];
  todaysActions: PartnerTodayActionDto[];
  pipeline: PartnerPipelineSummaryDto;
  earnings: PartnerEarningsPreviewDto;
}

export type StudentFilterTab = 'all' | 'action_needed' | 'on_track' | 'offer_received';
export type StudentStatusTag = 'action_needed' | 'on_track' | 'offer_received';
export type PipelineStage = 'shortlisted' | 'applied' | 'decision' | 'enrolled';

export interface PartnerStudentListItemDto {
  userId: string;
  name: string;
  country: string;
  countryCode: string;
  intendedField: string;
  applicationCount: number;
  statusTag: StudentStatusTag;
  latestActionMessage: string | null;
  estimatedCommission: number;
  commissionCurrency: string;
  lastUpdated: string;
  pipelineStage: PipelineStage;
}

export interface PartnerStudentsPageDto {
  students: PartnerStudentListItemDto[];
  filterCounts: {
    all: number;
    actionNeeded: number;
    onTrack: number;
    offerReceived: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartnerStudentUserInfoDto {
  name: string;
  email: string;
  country: string;
  phone: string;
  dateAdded: string;
}

export interface PartnerStudentProfileDto {
  intendedField: string;
  nationality: string;
  qualificationLevel: string;
  intendedStartDate: string;
  budget: string;
}

export interface PartnerStudentActionNeededDto {
  message: string;
  applicationId: string;
  actionType: ActionType;
}

export interface PartnerStudentApplicationSummaryDto {
  id: string;
  courseName: string;
  universityName: string;
  statusLabel: string;
  pipelinePosition: number;
  lastUpdated: string;
  submittedAt?: string | null;
  estimatedCommission?: number;
  commissionCurrency?: string;
  isPrime?: boolean;
}

export interface ProfileCompletenessItemDto {
  label: string;
  chaseable: boolean;
  uploadable: boolean;
}

export interface PartnerStudentDetailDto {
  user: PartnerStudentUserInfoDto;
  profile: PartnerStudentProfileDto;
  actionNeeded: PartnerStudentActionNeededDto | null;
  applications: PartnerStudentApplicationSummaryDto[];
  profileCompleteness: {
    percentage: number;
    missing: ProfileCompletenessItemDto[];
  };
}

export type JourneyStageStatus = 'completed' | 'in_progress' | 'pending';

export interface ApplicationJourneyStageDto {
  id: string;
  label: string;
  status: JourneyStageStatus;
  reachedAt: string | null;
}

export type DocumentStatus =
  | 'verified'
  | 'under_review'
  | 'required_by_university'
  | 'not_submitted';

export interface ApplicationDocumentDto {
  id: string;
  label: string;
  status: DocumentStatus;
  note?: string;
}

export interface PartnerApplicationDetailDto {
  id: string;
  student: {
    name: string;
    country: string;
    phone: string;
  };
  course: {
    name: string;
    university: string;
    universityCountry: string;
    intakeSeason: string;
    intakeYear: number;
    duration?: string;
    startDate?: string;
  };
  statusLabel?: string;
  matchScore: number;
  commission: {
    amount: number;
    currency: string;
    confirmedOnEnrollment?: boolean;
  };
  journey: ApplicationJourneyStageDto[];
  documents: ApplicationDocumentDto[];
  universityMessage?: {
    from: string;
    university: string;
    body: string;
    receivedAt?: string;
  } | null;
  actions: {
    primaryCta: string | null;
    primaryCtaSubtext?: string | null;
    canUploadDocument: boolean;
    canDownloadOfferLetter: boolean;
    canWhatsAppStudent: boolean;
    canContactUniversity: boolean;
  };
}

export interface PartnerApplicationListItemDto {
  id: string;
  studentName: string;
  studentCountry?: string;
  courseName: string;
  universityName: string;
  statusLabel: string;
  urgencyLabel?: string | null;
  actionLabel?: string | null;
  estimatedCommission: number;
  commissionCurrency: string;
  commissionStatus?: 'confirmed' | 'pending' | 'potential';
  lastUpdated: string;
}

export interface PartnerApplicationsPageDto {
  summary: {
    activeCount: number;
    needsActionToday: number;
  };
  shortlistCount: number;
  pipeline: {
    applied: number;
    inReview: number;
    offers: number;
    enrolled: number;
  };
  earningsProjection: {
    amount: number;
    currency: string;
  };
  needsAction: PartnerApplicationListItemDto[];
  applications: PartnerApplicationListItemDto[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartnerCourseRecommendationDto {
  courseId: string;
  name: string;
  university: string;
  country: string;
  degreeLevel?: string;
  matchScore: number;
  scoreBand?: string;
  fees?: {
    amount: number;
    currency: string;
    period?: string;
  };
  estimatedCommission?: number;
  commissionCurrency?: string;
  scholarshipPercent?: number | null;
  visaSuccessPercent?: number | null;
  isShortlisted?: boolean;
  originalFees?: {
    amount: number;
    currency: string;
  };
  duration?: string;
  intakeLabel?: string;
  isPrime?: boolean;
}

export interface PartnerRecommendationsPageDto {
  hasPreferences: boolean;
  message?: string | null;
  courses: PartnerCourseRecommendationDto[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePartnerStudentPayload {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  contact: string;
  intendedField?: string;
}

export interface PartnerCreatedApplicationDto {
  id: string;
  courseId: string;
  status: string;
  createdAt: string;
  reference?: string;
}

export interface PartnerShortlistItemDto {
  courseId: string;
  name: string;
  university: string;
  country: string;
  degreeLevel?: string;
  matchScore?: number;
  dateAdded: string;
  addedBy: 'partner' | 'student';
  hasApplication: boolean;
  studentUserId?: string;
  studentName?: string;
}

export interface PartnerMeDto {
  name: string;
  email: string;
  organization: string;
  country: string;
  phone?: string;
  stats: {
    students: number;
    applications: number;
    offers: number;
    enrolled: number;
  };
  milestones: PartnerMilestoneDto[];
  earnings?: {
    confirmed: number;
    pending: number;
    currency: string;
  };
  documents?: Array<{
    id: string;
    label: string;
    url?: string;
  }>;
}
