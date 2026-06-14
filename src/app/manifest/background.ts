import {
  appendExpiredFollowUpsCleanupAlert,
  cleanupExpiredFollowUps,
  hasCompletedExpiredFollowUpsCleanupForDay,
  markExpiredFollowUpsCleanupCompleted,
} from '../../features/follow-ups/application/follow-up.service';
import { toLocalDayKey } from '../../shared/utils/date';

const EXPIRED_FOLLOW_UPS_CLEANUP_ALARM = 'expired-follow-ups-cleanup';
const CLEANUP_HOUR = 0;
const CLEANUP_MINUTE = 1;

const getTodayCleanupTime = (now: Date = new Date()): Date => {
  const cleanupTime = new Date(now);
  cleanupTime.setHours(CLEANUP_HOUR, CLEANUP_MINUTE, 0, 0);
  return cleanupTime;
};

const getNextCleanupTime = (now: Date = new Date()): Date => {
  const nextCleanupTime = getTodayCleanupTime(now);

  if (nextCleanupTime.getTime() <= now.getTime()) {
    nextCleanupTime.setDate(nextCleanupTime.getDate() + 1);
  }

  return nextCleanupTime;
};

const scheduleNextExpiredFollowUpsCleanup = () => {
  chrome.alarms.create(EXPIRED_FOLLOW_UPS_CLEANUP_ALARM, {
    when: getNextCleanupTime().getTime(),
  });
};

const executeExpiredFollowUpsCleanup = async (now: Date = new Date()) => {
  const result = await cleanupExpiredFollowUps(now);

  if (result.expiredFollowUpsRemoved.length > 0) {
    await appendExpiredFollowUpsCleanupAlert(result.expiredFollowUpsRemoved, now.toISOString());
  }

  await markExpiredFollowUpsCleanupCompleted(now);
  return result;
};

const runExpiredFollowUpsCleanupAlarm = async () => {
  try {
    const result = await executeExpiredFollowUpsCleanup();

    if (result.expiredFollowUpsRemoved.length > 0) {
      console.log('Expired follow-ups removed by alarm:', result.expiredFollowUpsRemoved);
    }
  } catch (error) {
    console.error('Failed to cleanup expired follow-ups', error);
  } finally {
    scheduleNextExpiredFollowUpsCleanup();
  }
};

const runStartupCatchUpIfNeeded = async () => {
  const now = new Date();

  if (now.getTime() < getTodayCleanupTime(now).getTime()) {
    return;
  }

  const hasCompletedToday = await hasCompletedExpiredFollowUpsCleanupForDay(toLocalDayKey(now));

  if (hasCompletedToday) {
    return;
  }

  await executeExpiredFollowUpsCleanup(now);
};

const initializeExpiredFollowUpsCleanup = async () => {
  scheduleNextExpiredFollowUpsCleanup();

  try {
    await runStartupCatchUpIfNeeded();
  } catch (error) {
    console.error('Failed to run startup cleanup catch-up', error);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  void initializeExpiredFollowUpsCleanup();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeExpiredFollowUpsCleanup();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== EXPIRED_FOLLOW_UPS_CLEANUP_ALARM) {
    return;
  }

  void runExpiredFollowUpsCleanupAlarm();
});
