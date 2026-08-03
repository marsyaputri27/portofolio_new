import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Import semua halaman
import App from './App.jsx'
import About from './About.jsx'
import Project from './Project.jsx' 
import Contact from './Contact.jsx' // 1. Tambahkan import Contact di sini
import PageTransition from './PageTransition.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* =========================================
          RUTE DENGAN ANIMASI TRANSISI
      ========================================= */}
      <Route 
        path="/" 
        element={
          <PageTransition>
            <App />
          </PageTransition>
        } 
      />
      
      <Route 
        path="/about" 
        element={
          <PageTransition>
            <About />
          </PageTransition>
        } 
      />

      {/* 2. Tambahkan Rute Contact di sini */}
      <Route 
        path="/contact" 
        element={
          <PageTransition>
            <Contact />
          </PageTransition>
        } 
      />

      {/* =========================================
          RUTE TANPA ANIMASI TRANSISI
      ========================================= */}
      <Route path="/project" element={<Project />} />
      
    </Routes>
  </BrowserRouter>
)