import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { AuthProvider } from './context/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
    </AuthProvider>
  </React.StrictMode>,
)