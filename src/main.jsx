import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PopupRouter } from './runtimes/popup/router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PopupRouter />
  </StrictMode>,
);
