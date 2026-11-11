import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/leafletCompat'; // deve vir ANTES do markercluster (publica window.L)
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import './index.css';
import './liquid-glass.css';
import './liquid-glass.js';
import './ux-polish.css';
import { initSentry } from './services/sentry';
import { AuthProvider } from './context/AuthContext';

// Inicializar Sentry (Monitoramento de Erros e Performance)
initSentry();
import { GeotechDataProvider } from './context/GeotechDataContext';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GeotechDataProvider>
        <App />
      </GeotechDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
