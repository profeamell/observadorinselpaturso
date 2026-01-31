
// 1. Polyfills de primero para que el driver los encuentre al cargar
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  try {
    // Renderizado directo sin StrictMode para evitar dobles conexiones en el arranque del driver
    root.render(<App />);
  } catch (error) {
    console.error("Fatal Startup Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #ef4444;">Error de Inicialización</h1>
        <p style="color: #64748b;">El sistema no pudo arrancar. Por favor, limpie la caché del navegador y recargue.</p>
        <pre style="background: #f1f5f9; padding: 20px; border-radius: 10px; font-size: 11px; display: inline-block; text-align: left;">${error}</pre>
      </div>
    `;
  }
}
