import {apiClient} from './client';
import {normalizePartnerDashboard} from './partnerDashboardUtils';
import {unwrapEnvelope} from './parseResponse';
import type {ApiEnvelope} from './types';
import type {
  CreatePartnerStudentPayload,
  PartnerApplicationDetailDto,
  PartnerApplicationsPageDto,
  PartnerDashboardDto,
  PartnerMeDto,
  PartnerMilestoneDto,
  PartnerRecommendationsPageDto,
  PartnerCreatedApplicationDto,
  PartnerShortlistItemDto,
  PartnerStudentDetailDto,
  PartnerStudentsPageDto,
  StudentFilterTab,
} from './partnerTypes';

export async function getPartnerDashboard(): Promise<PartnerDashboardDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerDashboardDto>>('/partner/dashboard');
  const body = unwrapEnvelope(data);
  return normalizePartnerDashboard(body);
}

export async function getPartnerMilestones(): Promise<PartnerMilestoneDto[] | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerMilestoneDto[]>>('/partner/milestones');
  return unwrapEnvelope(data);
}

export async function getPartnerStudents(params?: {
  search?: string;
  filter?: StudentFilterTab;
  page?: number;
  limit?: number;
}): Promise<PartnerStudentsPageDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerStudentsPageDto>>('/partner/students', {
    params,
  });
  return unwrapEnvelope(data);
}

export async function getPartnerStudent(userId: string): Promise<PartnerStudentDetailDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerStudentDetailDto>>(
    `/partner/students/${userId}`,
  );
  return unwrapEnvelope(data);
}

export async function createPartnerStudent(body: CreatePartnerStudentPayload) {
  const {data} = await apiClient.post<ApiEnvelope<{userId: string}>>('/partner/students', body);
  return unwrapEnvelope(data);
}

export async function getPartnerApplications(params?: {
  filter?: 'all' | 'needs_action';
  page?: number;
  limit?: number;
}): Promise<PartnerApplicationsPageDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerApplicationsPageDto>>(
    '/partner/applications',
    {params},
  );
  return unwrapEnvelope(data);
}

export async function getPartnerStudentRecommendations(
  userId: string,
  params?: {page?: number; limit?: number; widenStep?: number},
): Promise<PartnerRecommendationsPageDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerRecommendationsPageDto>>(
    `/partner/students/${userId}/recommendations`,
    {params},
  );
  return unwrapEnvelope(data);
}

export async function getPartnerApplication(
  applicationId: string,
): Promise<PartnerApplicationDetailDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerApplicationDetailDto>>(
    `/partner/applications/${applicationId}`,
  );
  return unwrapEnvelope(data);
}

export async function acceptPartnerOffer(applicationId: string) {
  const {data} = await apiClient.patch<ApiEnvelope<unknown>>(
    `/partner/applications/${applicationId}/accept-offer`,
  );
  return unwrapEnvelope(data);
}

export async function getPartnerStudentShortlist(
  userId: string,
): Promise<PartnerShortlistItemDto[] | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerShortlistItemDto[]>>(
    `/partner/students/${userId}/shortlist`,
  );
  return unwrapEnvelope(data);
}

export async function addPartnerStudentShortlist(
  userId: string,
  body: {courseId: string; matchScore?: number},
) {
  const {data} = await apiClient.post<ApiEnvelope<unknown>>(
    `/partner/students/${userId}/shortlist`,
    body,
  );
  return unwrapEnvelope(data);
}

export async function createPartnerStudentApplication(
  userId: string,
  body: {courseId: string},
): Promise<PartnerCreatedApplicationDto | null> {
  const {data} = await apiClient.post<ApiEnvelope<PartnerCreatedApplicationDto>>(
    `/partner/students/${userId}/applications`,
    body,
  );
  return unwrapEnvelope(data);
}

export async function getPartnerMe(): Promise<PartnerMeDto | null> {
  const {data} = await apiClient.get<ApiEnvelope<PartnerMeDto>>('/partner/me');
  return unwrapEnvelope(data);
}

/** Returns true when the current session is a partner (agent/counsellor). */
export async function probePartnerSession(): Promise<boolean> {
  try {
    const me = await getPartnerMe();
    return me != null;
  } catch {
    return false;
  }
}
