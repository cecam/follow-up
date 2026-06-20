import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { Dashboard } from './pages/Dashboard';
import { FollowUpForm } from './pages/FollowUpForm';

export const PopupRouter = () => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="follow-ups">
            <Route path="new" element={<FollowUpForm />} />
            <Route path=":followUpId/edit" element={<FollowUpForm />} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );
};
