// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import styles from './Navbar.module.css';
import logoImage from '../assets/logo.png'; 

// Komponen Logo Kecil
const HeritEdgeLogo = () => (
  <div className={styles.logoWrapper}>
    <img src={logoImage} alt="HeritEdge Logo" className={styles.logoIcon} />
    <span className={styles.logoText}>HeritEdge</span>
  </div>
);

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // --- 1. STATE UNTUK DATA USER ---
  // Menggunakan state agar React merender ulang saat data berubah
  const [user, setUser] = useState(null);
  
  // Sesuaikan dengan URL Backend Anda
  const SERVER_URL = 'http://127.0.0.1:5000/';

  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk memuat data user dari localStorage
  const loadUserData = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        setUser(JSON.parse(userString));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Data user corrupt, mereset login.", error);
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // --- 2. EFEK UNTUK SINKRONISASI DATA ---
  useEffect(() => {
    // Muat data awal saat komponen muncul
    loadUserData();

    // Dengar event custom "storage_updated" yang dikirim dari Profile.jsx
    const handleUpdate = () => {
      loadUserData();
    };

    window.addEventListener("storage_updated", handleUpdate);
    
    // Cleanup listener saat komponen mati
    return () => {
      window.removeEventListener("storage_updated", handleUpdate);
    };
  }, []);

  // --- 3. CEK STATUS ADMIN ---
  const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN');

  // --- EFEK SCROLL & KLIK OUTSIDE ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest(`.${styles.profileWrapper}`)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false); 
    onLogout(); 
    navigate('/login'); 
  };

  const isActive = (path) => location.pathname === path ? styles.activeLink : '';

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        
        {/* BAGIAN KIRI: LOGO */}
        <div className={styles.logo}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <HeritEdgeLogo />
          </Link>
        </div>

        {/* BAGIAN TENGAH: MENU */}
        <ul className={styles.navLinks}>
          <li><Link to="/katalog" className={isActive('/katalog')}>Katalog</Link></li>
          <li><Link to="/artikel" className={isActive('/artikel')}>Artikel</Link></li>
          <li><Link to="/forum" className={isActive('/forum')}>Forum</Link></li>
          <li><Link to="/quiz" className={isActive('/quiz')}>Kuis</Link></li>
        </ul>

        {/* BAGIAN KANAN: AUTHENTICATION */}
        <div className={styles.navAuth}>
          
          {isAuthenticated && user ? (
            
            <div className={styles.profileWrapper}>
              <button className={styles.profileBtn} onClick={toggleDropdown}>
                
                {/* LOGIKA FOTO PROFILE: Jika ada avatar tampilkan gambar, jika tidak tampilkan inisial */}
                <div className={styles.avatarCircle}>
                  {user.avatar ? (
                    <img 
                      src={`${SERVER_URL}${user.avatar}`} 
                      alt="Avatar" 
                      className={styles.avatarImageNavbar}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                      // Fallback jika gambar gagal dimuat
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span>{user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>

                <span className={styles.profileName}>
                  {user.full_name ? user.full_name.split(' ')[0] : "Akun"}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '5px'}}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* ISI DROPDOWN */}
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  
                  {isAdmin && (
                    <Link to="/admindashboard" className={`${styles.dropdownItem} ${styles.adminLink}`}>
                      Dashboard Admin
                    </Link>
                  )}

                  <Link to="/profile" className={styles.dropdownItem}>
                    Profile Saya
                  </Link>
                  
                  <div className={styles.divider}></div>
                  
                  <button onClick={handleLogoutClick} className={`${styles.dropdownItem} ${styles.logoutBtnDropdown}`}>
                    Keluar
                  </button>
                </div>
              )}
            </div>

          ) : (

            <div className={styles.authButtonsWrapper}>
              <Link to="/login" className={styles.loginLink}>Masuk</Link>
              <Link to="/register">
                <button className={styles.registerBtn}>Daftar</button>
              </Link>
            </div>

          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;