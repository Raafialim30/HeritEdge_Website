// src/pages/AdminForum.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminForum.module.css';
import logoImage from '../assets/logo.png';

const AdminForum = () => {
  const [posts, setPosts] = useState([]);

  // Ambil data postingan saat halaman dibuka
  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/posts');
      setPosts(res.data);
    } catch (err) { 
      console.error("Gagal mengambil data posts:", err); 
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // --- FUNGSI DELETE LANGSUNG (TANPA CONFIRM) ---
  const handleDelete = async (id) => {
    // Log untuk debugging
    console.log("Memulai proses hapus INSTAN untuk ID:", id);

    try {
      // Langsung kirim perintah hapus ke server (dengan timeout 5 detik)
      const response = await axios.delete(`http://127.0.0.1:5000/api/posts/${id}`, {
        timeout: 5000 
      });
      
      console.log("Respon Sukses:", response);

      if (response.status === 200) {
        // Refresh tabel otomatis
        fetchPosts(); 
        // Opsional: Anda bisa menghapus alert ini jika ingin benar-benar hening
        alert("Postingan berhasil dihapus.");
      }

    } catch (err) {
      console.error("Error Detail:", err);

      // Error Handling (Tetap dipertahankan agar tahu jika ada masalah)
      if (err.code === 'ECONNABORTED') {
          alert("GAGAL: Server Timeout. Coba restart XAMPP dan Flask.");
      } 
      else if (err.response) {
        alert(`GAGAL SERVER (${err.response.status}): ${err.response.data.error || 'Error server'}`);
      } 
      else if (err.request) {
        alert("GAGAL KONEKSI: Flask mati atau tidak merespon.");
      } 
      else {
        alert(`ERROR: ${err.message}`);
      }
    }
  };

  return (
    <div className={styles.adminPageContainer}>
      
      {/* NAVBAR ADMIN */}
      <nav className={styles.adminNav}>
        <div className={styles.logoWrapper}>
          <Link to="/admindashboard">
            <img src={logoImage} alt="HeritEdge Logo" className={styles.adminLogoIcon} />
            <span className={styles.adminLogoText}>HeritEdge Admin</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link to="/admin/artikel">Artikel</Link>
          <Link to="/admin/katalog">Katalog</Link>
          <Link to="/admin/forum" className={styles.activeLink}>Forum</Link>
          <Link to="/admin/quiz">Quiz</Link>
          <Link to="/admin/users">User</Link>
          <Link to="/admindashboard" className={styles.backLink}>&larr; Dashboard</Link>
        </div>
      </nav>

      <main className={styles.content}>
        <h1 className={styles.title}>Moderasi Forum Diskusi</h1>

        <div className={styles.card}>
          <h3>Semua Postingan User ({posts.length})</h3>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Penulis</th>
                  <th>Konten</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className={styles.authorCol}>
                      <strong>{post.author ? post.author.full_name : 'Unknown User'}</strong>
                      <br/>
                      <span className={styles.idText}>ID: {post.author ? post.author.id : '-'}</span>
                    </td>
                    <td className={styles.contentCol}>
                      <div className={styles.postTitle}>{post.title}</div>
                      <div className={styles.postBody}>
                        {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                      </div>
                    </td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDelete(post.id)} className={styles.deleteBtn}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Tidak ada postingan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminForum;