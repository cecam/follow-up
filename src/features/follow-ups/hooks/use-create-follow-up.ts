import { useCallback, useState } from 'react';
import { createFollowUp as createFollowUpService } from '../application/follow-up.service';
import { FOLLOW_UP_ACTIVE_LIMIT_ERROR, FOLLOW_UP_ACTIVE_LIMIT_MESSAGE } from '../domain/follow-up.constants';
import type { FollowUp, FollowUpInput } from '../domain/follow-up';

type CreateFollowUpResult = {
  contacts: FollowUp[];
  followUp: FollowUp;
};

type UseCreateFollowUpResult = {
  createFollowUp: (input: FollowUpInput) => Promise<CreateFollowUpResult | null>;
  data: FollowUp[] | null;
  isLoading: boolean;
  errors: Error | null;
};

export const useCreateFollowUp = (): UseCreateFollowUpResult => {
  const [data, setData] = useState<FollowUp[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Error | null>(null);

  const createFollowUp = useCallback(async (input: FollowUpInput) => {
    setIsLoading(true);
    setErrors(null);

    try {
      const response = await createFollowUpService(input);

      if (response.ok === false) {
        throw new Error(response.error === FOLLOW_UP_ACTIVE_LIMIT_ERROR ? FOLLOW_UP_ACTIVE_LIMIT_MESSAGE : response.error);
      }

      if (!Array.isArray(response.contacts) || !response.followUp) {
        throw new Error('Unable to create follow-up');
      }

      const result = {
        contacts: response.contacts,
        followUp: response.followUp,
      };

      setData(result.contacts);
      return result;
    } catch (error) {
      console.error('Failed to create follow-up', error);
      setErrors(error instanceof Error ? error : new Error('Unable to create follow-up'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createFollowUp,
    data,
    isLoading,
    errors,
  };
};
