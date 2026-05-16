import type { FollowUp, FollowUpInput } from '../domain/follow-up';
import {
  hasReachedActiveFollowUpLimit,
  isExpiredFollowUp,
  validateFollowUpInput,
} from '../domain/follow-up.validators';
import { FOLLOW_UP_ACTIVE_LIMIT_ERROR } from '../domain/follow-up.constants';
import { fail, ok } from '../../../shared/types/runtime';
import { normalizeFollowUp } from '../infrastructure/follow-up.adapters';
import {
  createFollowUpRepository,
  deleteFollowUpRepository,
  getAllFollowUpsRepository,
  updateStorage,
  updateFollowUpRepository,
} from '../infrastructure/follow-up.repository';

export type GetAllFollowUpsResult = {
  contacts: FollowUp[];
  expiredFollowUpsRemoved: string[];
};

export const getAllFollowUps = async (now: Date = new Date()): Promise<GetAllFollowUpsResult> => {
  const followUps = (await getAllFollowUpsRepository()).map(normalizeFollowUp);
  const expiredFollowUps = followUps.filter((followUp) => isExpiredFollowUp(followUp, now));

  if (expiredFollowUps.length === 0) {
    return {
      contacts: followUps,
      expiredFollowUpsRemoved: [],
    };
  }

  const contacts = followUps.filter((followUp) => !isExpiredFollowUp(followUp, now));
  await updateStorage(contacts);

  return {
    contacts,
    expiredFollowUpsRemoved: expiredFollowUps.map((followUp) => followUp.name),
  };
};

export const createFollowUp = async (input: FollowUpInput) => {
  const validation = validateFollowUpInput(input);

  if (!validation.valid) {
    return fail('VALIDATION_FAILED', { errors: validation.errors });
  }

  const followUp = normalizeFollowUp(input);

  try {
    const currentFollowUps = await getAllFollowUpsRepository();

    if (hasReachedActiveFollowUpLimit(currentFollowUps.map(normalizeFollowUp))) {
      return fail(FOLLOW_UP_ACTIVE_LIMIT_ERROR);
    }

    const contacts = await createFollowUpRepository(followUp);
    return ok({ contacts, followUp });
  } catch (error) {
    console.error('Failed to create follow-up', error);
    return fail('CREATE_FAILED');
  }
};

export const updateFollowUp = async (input: FollowUpInput) => {
  if (!input.id) {
    return fail('INVALID_FOLLOW_UP_ID');
  }

  const validation = validateFollowUpInput(input);

  if (!validation.valid) {
    return fail('VALIDATION_FAILED', { errors: validation.errors });
  }

  const followUp = normalizeFollowUp(input);

  try {
    const contacts = await updateFollowUpRepository(followUp);
    return ok({ contacts, followUp });
  } catch (error) {
    console.error('Failed to update follow-up', error);
    return fail('UPDATE_FAILED');
  }
};

export const deleteFollowUp = async (id: string) => {
  if (!id) return fail('INVALID_FOLLOW_UP_ID');

  try {
    const contacts = await deleteFollowUpRepository(id);
    return ok({ contacts });
  } catch (error) {
    console.error('Failed to delete follow-up', error);
    return fail('DELETE_FAILED');
  }
};
