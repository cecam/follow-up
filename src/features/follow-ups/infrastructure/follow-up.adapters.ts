import type { FollowUp, FollowUpInput } from '../domain/follow-up';
import { FOLLOW_UP_PLATFORMS, FOLLOW_UP_STATUSES } from '../domain/follow-up.constants';
import { getExpirationDate } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';

export const normalizeFollowUp = (followUp?: FollowUpInput): FollowUp => {
  const now = new Date().toISOString();
  const createdAt = followUp?.createdAt ?? now;

  return {
    id: followUp?.id ?? createId(),
    name: followUp?.name?.trim() ?? '',
    profileUrl: followUp?.profileUrl?.trim() ?? '',
    platform: (followUp?.platform as any) ?? FOLLOW_UP_PLATFORMS.LINKEDIN,
    notes: followUp?.notes?.trim() ?? '',
    status: (followUp?.status as any) ?? FOLLOW_UP_STATUSES.PENDING,
    createdAt,
    updatedAt: followUp?.updatedAt ?? now,
    completedAt: followUp?.completedAt,
    expirationDate: followUp?.expirationDate ?? getExpirationDate(createdAt),
  };
};
