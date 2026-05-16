import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { data, expiredFollowUpsRemoved, isLoading, errors, refetch } = useFollowUp(contactsOverride);
  const [expiredCleanupAlertNames, setExpiredCleanupAlertNames] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      onFollowUpsChange(data);
    }
  }, [data, isLoading, onFollowUpsChange]);

  useEffect(() => {
    if (expiredFollowUpsRemoved.length > 0) {
      setExpiredCleanupAlertNames(expiredFollowUpsRemoved);
    }
  }, [expiredFollowUpsRemoved]);

  const handleFollowUpsChange = useCallback((followUps: FollowUp[]) => {
    setExpiredCleanupAlertNames([]);
    onFollowUpsChange(followUps);
  }, [onFollowUpsChange]);

  const stats = useMemo(() => {
    const expiringSoon = data.filter((followUp) => isExpiringWithinDays(followUp.expirationDate, 7)).length;

    return {
      total: data.length,
      expiringSoon,
    };
  }, [data]);

  const activeLimitReached = useMemo(() => hasReachedActiveFollowUpLimit(data), [data]);
  const expiredFollowUpsRemovedCount = expiredCleanupAlertNames.length;
  const expiredFollowUpsRemovedMessage = expiredFollowUpsRemovedCount === 1
    ? 'Se eliminó 1 follow up porque caducó.'
    : `Se eliminaron ${expiredFollowUpsRemovedCount} follow ups porque caducaron.`;

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
      {expiredFollowUpsRemovedCount > 0 && (
        <div className="follow-up-expired-alert" role="alert">
          <AlertCircle size={16} />
          <div className="follow-up-expired-alert-content">
            <span>{expiredFollowUpsRemovedMessage}</span>
            <ul className="follow-up-expired-alert-list">
              {expiredCleanupAlertNames.map((followUpName, index) => (
                <li key={`${followUpName}-${index}`}>{followUpName}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
        onFollowUpsChange={handleFollowUpsChange}
      />
    </div>
  );
};
