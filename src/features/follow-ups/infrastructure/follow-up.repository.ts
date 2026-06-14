import type { FollowUp } from '../domain/follow-up';
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '../../../shared/chrome/storage';

const FOLLOW_UPS_STORAGE_KEY = 'followUps';
const EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY = 'expiredFollowUpsCleanupAlert';
const EXPIRED_FOLLOW_UPS_CLEANUP_META_STORAGE_KEY = 'expiredFollowUpsCleanupMeta';

export type ExpiredFollowUpsCleanupAlert = {
  names: string[];
  generatedAt: string;
};

export type ExpiredFollowUpsCleanupMeta = {
  lastProcessedDay: string;
  lastProcessedAt: string;
};

type FollowUpsStorage = {
  [FOLLOW_UPS_STORAGE_KEY]: FollowUp[];
};

type FollowUpsCleanupAlertStorage = {
  [EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY]: ExpiredFollowUpsCleanupAlert;
};

type FollowUpsCleanupMetaStorage = {
  [EXPIRED_FOLLOW_UPS_CLEANUP_META_STORAGE_KEY]: ExpiredFollowUpsCleanupMeta;
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

export const getExpiredFollowUpsCleanupAlertRepository = async (): Promise<ExpiredFollowUpsCleanupAlert | null> => {
  const result = await getLocalStorage<FollowUpsCleanupAlertStorage>(EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY);
  const alert = result[EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY];

  if (!alert || !Array.isArray(alert.names) || typeof alert.generatedAt !== 'string') {
    return null;
  }

  return alert;
};

export const appendExpiredFollowUpsCleanupAlertRepository = async (
  names: string[],
  generatedAt: string,
): Promise<ExpiredFollowUpsCleanupAlert> => {
  const currentAlert = await getExpiredFollowUpsCleanupAlertRepository();
  const nextAlert: ExpiredFollowUpsCleanupAlert = {
    names: currentAlert ? [...currentAlert.names, ...names] : names,
    generatedAt,
  };

  await setLocalStorage<FollowUpsCleanupAlertStorage>({
    [EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY]: nextAlert,
  });

  return nextAlert;
};

export const clearExpiredFollowUpsCleanupAlertRepository = async (): Promise<void> => {
  await removeLocalStorage(EXPIRED_FOLLOW_UPS_CLEANUP_ALERT_STORAGE_KEY);
};

export const consumeExpiredFollowUpsCleanupAlertRepository = async (): Promise<ExpiredFollowUpsCleanupAlert | null> => {
  const alert = await getExpiredFollowUpsCleanupAlertRepository();

  if (!alert) {
    return null;
  }

  await clearExpiredFollowUpsCleanupAlertRepository();
  return alert;
};

export const getExpiredFollowUpsCleanupMetaRepository = async (): Promise<ExpiredFollowUpsCleanupMeta | null> => {
  const result = await getLocalStorage<FollowUpsCleanupMetaStorage>(EXPIRED_FOLLOW_UPS_CLEANUP_META_STORAGE_KEY);
  const meta = result[EXPIRED_FOLLOW_UPS_CLEANUP_META_STORAGE_KEY];

  if (!meta || typeof meta.lastProcessedDay !== 'string' || typeof meta.lastProcessedAt !== 'string') {
    return null;
  }

  return meta;
};

export const setExpiredFollowUpsCleanupMetaRepository = async (
  meta: ExpiredFollowUpsCleanupMeta,
): Promise<ExpiredFollowUpsCleanupMeta> => {
  await setLocalStorage<FollowUpsCleanupMetaStorage>({
    [EXPIRED_FOLLOW_UPS_CLEANUP_META_STORAGE_KEY]: meta,
  });

  return meta;
};
