import {apiClient} from './client';
import {unwrapEnvelope} from './parseResponse';
import type {ApiEnvelope} from './types';

export interface NotificationDto {
  id: string;
  recipientType: string;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  applicationId?: string | null;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export async function getNotifications(): Promise<NotificationDto[] | null> {
  const {data} = await apiClient.get<ApiEnvelope<NotificationDto[]>>('/notifications');
  return unwrapEnvelope(data);
}
