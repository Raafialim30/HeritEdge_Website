// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Kolom 1: Brand & Deskripsi Singkat */}
        <div className={styles.brandSection}>
          <h2 className={styles.logoText}>HeritEdge</h2>
          <p className={styles.tagline}>
            Melestarikan warisan budaya nusantara melalui teknologi digital. 
            Menghubungkan masa lalu dengan masa depan.
          </p>
        </div>

        {/* Kolom 2: Navigasi Cepat */}
        <div className={styles.linkSection}>
          <h3>Jelajahi</h3>
          <ul>
            <li><Link to="/">Beranda</Link></li>
            <li><Link to="/katalog">Katalog Budaya</Link></li>
            <li><Link to="/artikel">Artikel</Link></li>
            <li><Link to="/quiz">Kuis Interaktif</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak / Sosmed */}
        <div className={styles.contactSection}>
          <h3>Hubungi Kami</h3>
          <p>Email: hello@heritedge.id</p>
          <p>Telepon: +62 812 3456 7890</p>
          <div className={styles.socialIcons}>
            {/* Contoh placeholder icon sosial media */}
            <a href="#" className={styles.icon}>Instagram</a>
            <a href="#" className={styles.icon}>Twitter</a>
            <a href="#" className={styles.icon}>Facebook</a>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Copyright / Watermark */}
      <div className={styles.copyrightBar}>
        <p>&copy; {currentYear} <strong>HeritEdge</strong>. Dibuat dengan bangga untuk Indonesia.</p>
      </div>
    </footer>
  );
};

export default Footer;