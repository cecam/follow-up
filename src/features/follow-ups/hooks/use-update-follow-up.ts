import { useCallback, useState } from 'react';
import { updateFollowUp as updateFollowUpService } from '../application/follow-up.service';
import type { FollowUp, FollowUpInput } from '../domain/follow-up';

type UpdateFollowUpResult = {
  contacts: FollowUp[];
  followUp: FollowUp;
};

type UseUpdateFollowUpResult = {
  updateFollowUp: (input: FollowUpInput) => Promise<UpdateFollowUpResult | null>;
  data: FollowUp[] | null;
  isLoading: boolean;
  errors: Error | null;
};

export const useUpdateFollowUp = (): UseUpdateFollowUpResult => {
  const [data, setData] = useState<FollowUp[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Error | null>(null);

  const updateFollowUp = useCallback(async (input: FollowUpInput) => {
    setIsLoading(true);
    setErrors(null);

    try {
      const response = await updateFollowUpService(input);

      if (!response.ok) {
        throw new Error(response.error);
      }

      if (!Array.isArray(response.contacts) || !response.followUp) {
        throw new Error('Unable to update follow-up');
      }

      const result = {
        contacts: response.contacts,
        followUp: response.followUp,
      };

      setData(result.contacts);
      return result;
    } catch (error) {
      console.error('Failed to update follow-up', error);
      setErrors(error instanceof Error ? error : new Error('Unable to update follow-up'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateFollowUp,
    data,
    isLoading,
    errors,
  };
};
