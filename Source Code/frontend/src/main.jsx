import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/globals.css';
import './index.css';
import LandingPage from './pages/LandingPage.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/studio"  element={<App />} />
        <Route path="/studio/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
