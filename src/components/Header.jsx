// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import dancer from '../assets/penari.png'; // Pastikan path gambar benar

const Header = () => {
  return (
    // Kita gunakan tag <header> secara semantik, tapi stylingnya adalah Hero Section
    <header className={styles.heroSection}>
      
      {/* Bagian Kiri: Teks & Tombol */}
      <div className={styles.heroContent}>
        <h1>
          Menjembatani
          <br />
          Warisan & Kemajuan
        </h1>
        <p>
          Platform untuk menjelajahi, belajar, dan berbagi
          <br />
          tentang kekayaan budaya Indonesia
        </p>
        
        <div className={styles.heroButtons}>
          <Link to="/jelajah" className={`${styles.btn} ${styles.btnPrimary}`}>
            Mulai Jelajah
          </Link>
          <Link to="/katalog" className={`${styles.btn} ${styles.btnSecondary}`}>
            Lihat Katalog
          </Link>
        </div>
      </div>

      {/* Bagian Kanan: Gambar Penari */}
      <div className={styles.heroImage}>
        {/* Dekorasi background di belakang penari (diatur via CSS ::before) */}
        <img src={dancer} alt="Penari Tradisional Indonesia" />
      </div>

    </header>
  );
};

export default Header;