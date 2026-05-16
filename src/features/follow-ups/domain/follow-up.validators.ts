import type { FollowUp, FollowUpInput, FollowUpValidationErrors } from './follow-up';
import {
  FOLLOW_UP_ACTIVE_LIMIT,
  FOLLOW_UP_NOTE_MAX_LENGTH,
  FOLLOW_UP_PLATFORMS,
  FOLLOW_UP_STATUSES,
} from './follow-up.constants';

export const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateFollowUpInput = (input?: FollowUpInput) => {
  const errors: FollowUpValidationErrors = {};

  if (!input?.name?.trim()) {
    errors.name = 'Este campo es obligatorio.';
  }

  if (!input?.profileUrl?.trim()) {
    errors.profileUrl = 'Este campo es obligatorio.';
  } else if (!isValidUrl(input.profileUrl)) {
    errors.profileUrl = 'Ingresa una URL válida.';
  }

  if ((input?.notes ?? '').length > FOLLOW_UP_NOTE_MAX_LENGTH) {
    errors.notes = 'Las notas no pueden superar 255 caracteres.';
  }

  if (input?.platform && !Object.values(FOLLOW_UP_PLATFORMS).includes(input.platform)) {
    errors.platform = 'Plataforma inválida.';
  }

  if (input?.status && !Object.values(FOLLOW_UP_STATUSES).includes(input.status)) {
    errors.status = 'Estado inválido.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isActiveFollowUp = (followUp: FollowUp, now: Date = new Date()): boolean => {
  const expiresAt = new Date(followUp.expirationDate).getTime();

  if (Number.isNaN(expiresAt)) return false;

  return followUp.status === FOLLOW_UP_STATUSES.PENDING && expiresAt >= now.getTime();
};

export const isExpiredFollowUp = (followUp: FollowUp, now: Date = new Date()): boolean => {
  const expiresAt = new Date(followUp.expirationDate).getTime();

  if (Number.isNaN(expiresAt)) return false;

  return expiresAt < now.getTime();
};

export const getActiveFollowUpCount = (followUps: FollowUp[], now: Date = new Date()): number => {
  return followUps.filter((followUp) => isActiveFollowUp(followUp, now)).length;
};

export const hasReachedActiveFollowUpLimit = (followUps: FollowUp[], now: Date = new Date()): boolean => {
  return getActiveFollowUpCount(followUps, now) >= FOLLOW_UP_ACTIVE_LIMIT;
};
