import { useDashboard } from '../hooks/useDashboard';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatsCards } from '../components/StatsCards';
import { ContactList } from '../components/ContactList';
import './Dashboard.css';

export const Dashboard = () => {
  const { username, contacts, stats, loading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-body" style={{ color: 'var(--color-error)' }}>Error al cargar los datos</p>
        <button onClick={() => window.location.reload()} className="bento-card" style={{ padding: '8px 16px' }}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader username={username} />
      <StatsCards stats={stats} />
      <ContactList contacts={contacts} loading={loading} />
    </div>
  );
};
