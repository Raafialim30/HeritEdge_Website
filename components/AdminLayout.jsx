import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import styles from './AdminLayout.module.css'; // Assuming you will create a CSS module for layout styles

function AdminLayout() {
  return (
    <div className={styles.adminLayout}>
      <AdminNavbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>&copy; 2023 HeritEdge. All rights reserved.</p>
      </footer>
    </div>
  );
}s

export default AdminLayout;