import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="app-shell" data-theme="light">
      <Outlet />
    </div>
  );
}

export default App;
