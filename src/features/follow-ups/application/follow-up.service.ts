import type { FollowUp, FollowUpInput } from '../domain/follow-up';
import { hasReachedActiveFollowUpLimit, validateFollowUpInput } from '../domain/follow-up.validators';
import { FOLLOW_UP_ACTIVE_LIMIT_ERROR } from '../domain/follow-up.constants';
import { fail, ok } from '../../../shared/types/runtime';
import { normalizeFollowUp } from '../infrastructure/follow-up.adapters';
import {
  createFollowUpRepository,
  deleteFollowUpRepository,
  getAllFollowUpsRepository,
  updateFollowUpRepository,
} from '../infrastructure/follow-up.repository';

export const getAllFollowUps = async (): Promise<FollowUp[]> => {
  return (await getAllFollowUpsRepository()).map(normalizeFollowUp);
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
