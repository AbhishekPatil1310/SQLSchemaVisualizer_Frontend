import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from './components/ui/sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster />
    <AuthProvider>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
    </AuthProvider>
  </React.StrictMode>,
)