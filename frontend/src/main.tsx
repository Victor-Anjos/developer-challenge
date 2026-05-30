import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/reset.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/badges.css';
import './styles/components.css';
import './styles/login.css';
import './styles/dashboard.css';
import './styles/detail.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
