import { Users, Clock } from 'lucide-react';

export const FollowUpStats = ({ stats }) => {
  return (
    <div className="bento-grid" style={{ paddingTop: 0 }}>
      <div className="bento-card flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-caption">Total contactos</span>
          <Users size={16} style={{ color: 'var(--color-accent)' }} />
        </div>
        <span className="text-heading" style={{ fontSize: '24px' }}>{stats.total}</span>
      </div>

      <div className="bento-card flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <span className="text-caption">Por caducar</span>
          <Clock size={16} style={{ color: stats.expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }} />
        </div>
        <span
          className="text-heading"
          style={{
            fontSize: '24px',
            color: stats.expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-text-primary)',
          }}
        >
          {stats.expiringSoon}
        </span>
      </div>
    </div>
  );
};
