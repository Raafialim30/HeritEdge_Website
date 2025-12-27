// src/App.js

import React, { useState, useEffect } from 'react'; // [PERBAIKAN 1] Import useEffect
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Import Components
import Navbar from './components/Navbar';

// Import Semua Halaman User
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Forum from './pages/Forum';
import Quiz from './pages/Quiz'; 
import Peta from './pages/Peta';
import Article from './pages/Article';
import ArticleDetail from './pages/ArticleDetail';
import Katalog from './pages/Katalog';
import Profile from './pages/Profile';
import KatalogDetail from './pages/KatalogDetail'; 

// Import Halaman Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminArticle from './pages/AdminArticle';
import AdminKatalog from './pages/AdminKatalog'; 
import AdminForum from './pages/AdminForum';
import AdminQuiz from './pages/AdminQuiz'; 
import AdminUsers from './pages/AdminUsers';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Hook untuk mendapatkan lokasi URL saat ini
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // --- [PERBAIKAN 2] LOGIKA PERSIST LOGIN ---
  // Cek localStorage saat aplikasi dimuat/direfresh
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsAuthenticated(true);
    }
  }, []); // Array kosong [] artinya hanya dijalankan sekali saat refresh

  // --- LOGIKA NAVBAR ---
  const isAuthPage = ['/login', '/register'].includes(currentPath);
  const isAdminPage = currentPath === '/admindashboard' || currentPath.startsWith('/admin/');
  const shouldShowUserNavbar = !isAuthPage && !isAdminPage;

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('user'); 
  };

  return (
    <div className="App">
      {shouldShowUserNavbar && (
        <Navbar 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* --- RUTE USER --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/peta" element={<Peta />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/artikel" element={<Article />} />
        <Route path="/katalog/:id" element={<KatalogDetail />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/artikel/:id" element={<ArticleDetail />} />
        <Route path="/profile" element={<Profile />} />

        {/* --- RUTE AUTH --- */}
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route path="/register" element={<Register />} />
        
        {/* --- RUTE ADMIN --- */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admin/artikel" element={<AdminArticle />} />
        <Route path="/admin/katalog" element={<AdminKatalog />} />
        <Route path="/admin/forum" element={<AdminForum />} />
        <Route path="/admin/quiz" element={<AdminQuiz />} />
        <Route path="/admin/users" element={<AdminUsers />} />

      </Routes>
    </div>
  );
}

export default App;