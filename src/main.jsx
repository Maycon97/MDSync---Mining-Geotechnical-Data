import React from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

if (typeof window !== 'undefined') {
  window.L = L;
}
import 'leaflet.markercluster';

import './index.css';
import { AuthProvider } from './context/AuthContext';
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
