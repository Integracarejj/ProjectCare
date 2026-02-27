import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Global CSS should be imported ONCE here.
// Page/component CSS files live next to the TSX files that use them.
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)















