import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './App.tsx'
import { AuthProvider } from './AuthContext'

console.log('🚀 Main.tsx: Starting application...');
console.log('🚀 Main.tsx: Environment:', import.meta.env.MODE);
console.log('🚀 Main.tsx: Base URL:', import.meta.env.BASE_URL);

try {
  const rootElement = document.getElementById('root');
  console.log('🚀 Main.tsx: Root element found:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </StrictMode>,
  );
  
  console.log('🚀 Main.tsx: App rendered successfully');
} catch (error) {
  console.error('❌ Main.tsx: Error rendering app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center; background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; margin: 20px;">
      <h1 style="color: #dc2626;">🚨 Application Error</h1>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `;
}
