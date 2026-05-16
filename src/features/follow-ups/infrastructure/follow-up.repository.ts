import type { FollowUp } from '../domain/follow-up';
import { getLocalStorage, setLocalStorage } from '../../../shared/chrome/storage';

const FOLLOW_UPS_STORAGE_KEY = 'followUps';
type FollowUpsStorage = {
  [FOLLOW_UPS_STORAGE_KEY]: FollowUp[];
};

export const updateStorage = async (followUps: FollowUp[]): Promise<FollowUp[]> => {
  await setLocalStorage<FollowUpsStorage>({ [FOLLOW_UPS_STORAGE_KEY]: followUps });
  return followUps;
};

export const getAllFollowUpsRepository = async (): Promise<FollowUp[]> => {
  const result = await getLocalStorage<FollowUpsStorage>([FOLLOW_UPS_STORAGE_KEY]);
  const followUps = result[FOLLOW_UPS_STORAGE_KEY];
  return Array.isArray(followUps) ? followUps : [];
};

export const createFollowUpRepository = async (followUp: FollowUp): Promise<FollowUp[]> => {
  const followUps = await getAllFollowUpsRepository();
  return updateStorage([followUp, ...followUps.filter((item) => item.id !== followUp.id)]);
};

export const updateFollowUpRepository = async (followUp: FollowUp): Promise<FollowUp[]> => {
  const followUps = await getAllFollowUpsRepository();
  const exists = followUps.some((item) => item.id === followUp.id);
  const updatedFollowUps = exists
    ? followUps.map((item) => (item.id === followUp.id ? followUp : item))
    : [followUp, ...followUps];

  return updateStorage(updatedFollowUps);
};

export const deleteFollowUpRepository = async (id: string): Promise<FollowUp[]> => {
  const followUps = await getAllFollowUpsRepository();
  return updateStorage(followUps.filter((followUp) => followUp.id !== id));
};
