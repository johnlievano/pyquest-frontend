import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- ¡Esta es la línea mágica que faltaba!
import './index.css'
import App from './App.tsx'

// Usamos createRoot directamente y le añadimos el "!" para TypeScript (le asegura que el div 'root' siempre existirá)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)