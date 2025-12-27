import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminNavbar.module.css';

function AdminNavbar() {
  return (
    <nav className={styles.adminNav}>
      <div className={styles.logoWrapper}>
        <Link to="/">
          <img src="../assets/logo.png" alt="HeritEdge Logo" className={styles.adminLogoIcon} />
          <span className={styles.adminLogoText}>HeritEdge</span>
        </Link>
      </div>
      <div className={styles.navLinks}>
        <Link to="/admin/artikel">Artikel Admin</Link>
        <Link to="/admin/katalog">Katalog Admin</Link>
        <Link to="/admin/peta">Peta Admin</Link>
        <Link to="/admin/kuis">Kuis Admin</Link>
        <Link to="/admin/forum">Forum Admin</Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;