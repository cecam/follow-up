import { useCallback, useState } from 'react';
import { deleteFollowUp as deleteFollowUpService } from '../application/follow-up.service';
import type { FollowUp } from '../domain/follow-up';

type DeleteFollowUpResult = {
  contacts: FollowUp[];
};

type UseDeleteFollowUpResult = {
  deleteFollowUp: (id: string) => Promise<DeleteFollowUpResult | null>;
  data: FollowUp[] | null;
  isLoading: boolean;
  errors: Error | null;
};

export const useDeleteFollowUp = (): UseDeleteFollowUpResult => {
  const [data, setData] = useState<FollowUp[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Error | null>(null);

  const deleteFollowUp = useCallback(async (id: string) => {
    setIsLoading(true);
    setErrors(null);

    try {
      const response = await deleteFollowUpService(id);

      if (response.ok === false) {
        throw new Error(response.error);
      }

      if (!Array.isArray(response.contacts)) {
        throw new Error('Unable to delete follow-up');
      }

      const result = {
        contacts: response.contacts,
      };

      setData(result.contacts);
      return result;
    } catch (error) {
      console.error('Failed to delete follow-up', error);
      setErrors(error instanceof Error ? error : new Error('Unable to delete follow-up'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteFollowUp,
    data,
    isLoading,
    errors,
  };
};
