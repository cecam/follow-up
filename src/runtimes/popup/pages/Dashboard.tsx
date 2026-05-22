import { useNavigate } from 'react-router-dom';
import { FollowUpDashboard } from '../../../features/follow-ups/ui/follow-up-dashboard';

export const Dashboard = () => {
  const navigate = useNavigate();
  return <FollowUpDashboard navigate={navigate} />;
};
