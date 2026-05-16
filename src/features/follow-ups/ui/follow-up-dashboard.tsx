import { useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useFollowUp } from '../hooks/use-follow-up';
import { isExpiringWithinDays } from '../../../shared/utils/date';
import type { FollowUp } from '../domain/follow-up';
import { FOLLOW_UP_ACTIVE_LIMIT_MESSAGE } from '../domain/follow-up.constants';
import { hasReachedActiveFollowUpLimit } from '../domain/follow-up.validators';
import { FollowUpDashboardHeader } from './follow-up-dashboardheader';
import { FollowUpStats } from './follow-up-stats';
import { FollowUpList } from './follow-up-list';
import './styles/follow-up-dashboard.css';

export type FollowUpDashboardProps = {
  contactsOverride?: FollowUp[] | null;
  onAddFollowUp: (followUps?: FollowUp[]) => void;
  onEditFollowUp: (followUp: FollowUp) => void;
  onFollowUpsChange: (followUps: FollowUp[]) => void;
};

const USERNAME = 'David';

export const FollowUpDashboard = ({
  contactsOverride,
  onAddFollowUp,
  onEditFollowUp,
  onFollowUpsChange,
}: FollowUpDashboardProps) => {
  const { data, isLoading, errors, refetch } = useFollowUp(contactsOverride);

  useEffect(() => {
    if (!isLoading) {
      onFollowUpsChange(data);
    }
  }, [data, isLoading, onFollowUpsChange]);

  const stats = useMemo(() => {
    const expiringSoon = data.filter((followUp) => isExpiringWithinDays(followUp.expirationDate, 7)).length;

    return {
      total: data.length,
      expiringSoon,
    };
  }, [data]);

  const activeLimitReached = useMemo(() => hasReachedActiveFollowUpLimit(data), [data]);

  if (errors) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body" style={{ color: 'var(--color-error)' }}>Error al cargar los datos</p>
        <button onClick={() => void refetch()} className="bento-card" style={{ padding: '8px 16px' }}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="follow-up-dashboard">
      <FollowUpDashboardHeader username={USERNAME} onAddFollowUp={() => onAddFollowUp(data)} />
      <FollowUpStats stats={stats} />
      {activeLimitReached && (
        <div className="follow-up-limit-alert" role="alert">
          <AlertCircle size={16} />
          <span>{FOLLOW_UP_ACTIVE_LIMIT_MESSAGE}</span>
        </div>
      )}
      <FollowUpList
        contacts={data}
        loading={isLoading}
        onEditFollowUp={onEditFollowUp}
        onFollowUpsChange={onFollowUpsChange}
      />
    </div>
  );
};
