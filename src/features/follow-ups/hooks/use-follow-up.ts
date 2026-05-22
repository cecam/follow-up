import { useCallback, useEffect, useState } from 'react';
import { getAllFollowUps } from '../application/follow-up.service';
import type { FollowUp } from '../domain/follow-up';

type UseFollowUpResult = {
  data: FollowUp[];
  refetch: () => Promise<void>;
  isLoading: boolean;
  errors: Error | null;
};

export const useFollowUp = (followUpsOverride?: FollowUp[] | null): UseFollowUpResult => {
  const [data, setData] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Error | null>(null);

  const getFollowUps = useCallback(async () => {
    if (Array.isArray(followUpsOverride)) {
      setData(followUpsOverride);
      setIsLoading(false);
      setErrors(null);
      return;
    }

    setIsLoading(true);
    setErrors(null);

    try {
      const followUps = await getAllFollowUps();
      setData(followUps);
    } catch (error) {
      console.error('Failed to load follow-ups', error);
      setErrors(error instanceof Error ? error : new Error('Unable to load follow-ups'));
    } finally {
      setIsLoading(false);
    }
  }, [followUpsOverride]);

  useEffect(() => {
    void getFollowUps();
  }, [getFollowUps]);

  return {
    data,
    refetch: getFollowUps,
    isLoading,
    errors,
  };
};
