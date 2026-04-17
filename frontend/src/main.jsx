import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SanjeevniProvider } from './context/SanjeevniContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <SanjeevniProvider>
      <App />
    </SanjeevniProvider>
  </React.StrictMode>
)
