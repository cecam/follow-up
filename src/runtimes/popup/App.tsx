import { useCallback, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { FollowUpForm } from './pages/FollowUpForm';
import type { FollowUp } from '../../features/follow-ups/domain/follow-up';
import './App.css';

type PopupView = 'dashboard' | 'form';

function App() {
  const [currentView, setCurrentView] = useState<PopupView>('dashboard');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [dashboardContacts, setDashboardContacts] = useState<FollowUp[] | null>(null);

  const handleCreateFollowUp = useCallback((contacts?: FollowUp[]) => {
    if (contacts) {
      setDashboardContacts(contacts);
    }

    setSelectedFollowUp(null);
    setCurrentView('form');
  }, []);

  const handleEditFollowUp = useCallback((followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setCurrentView('form');
  }, []);

  const handleReturnToDashboard = useCallback(() => {
    setSelectedFollowUp(null);
    setCurrentView('dashboard');
  }, []);

  const handleSaveSuccess = useCallback((contacts: FollowUp[]) => {
    setDashboardContacts(contacts);
    handleReturnToDashboard();
  }, [handleReturnToDashboard]);

  const handleFollowUpsChange = useCallback((contacts: FollowUp[]) => {
    setDashboardContacts(contacts);
  }, []);

  return (
    <div className="app-shell" data-theme="light">
      {currentView === 'form' ? (
        <FollowUpForm
          followUp={selectedFollowUp}
          followUps={dashboardContacts}
          onBack={handleReturnToDashboard}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : (
        <Dashboard
          contactsOverride={dashboardContacts}
          onAddFollowUp={handleCreateFollowUp}
          onEditFollowUp={handleEditFollowUp}
          onFollowUpsChange={handleFollowUpsChange}
        />
      )}
    </div>
  );
}

export default App;
