// src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios untuk ambil data
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import styles from './AdminDashboard.module.css';
import logoImage from '../assets/logo.png'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- 1. STATE UNTUK MENYIMPAN DATA DARI DATABASE ---
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats] = useState({
    usersCount: 0,
    articlesCount: 0,
    forumPostsCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Data Chart Dummy (Sumbu Y nanti bisa diganti data real jika backend support analytics)
  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [{
      label: 'Aktivitas Harian',
      data: [12, 19, 3, 5, 2, 3, 10], // Masih dummy karena butuh data time-series dari backend
      borderColor: '#8B4513',
      backgroundColor: 'rgba(139, 69, 19, 0.2)',
      tension: 0.4,
    }],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  // --- 2. FETCH DATA SAAT HALAMAN DIMUAT ---
  useEffect(() => {
    // A. Cek Apakah User adalah Admin
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user || user.role !== 'admin') {
      // Jika bukan admin, tendang ke home atau login
      navigate('/login');
      return;
    }
    setAdminName(user.full_name);

    // B. Ambil Data Statistik dari Server
    const fetchData = async () => {
      try {
        // Kita panggil endpoint yang ada (Users, Articles, Posts)
        const [usersRes, articlesRes, postsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/users'),
          axios.get('http://127.0.0.1:5000/api/articles'),
          axios.get('http://127.0.0.1:5000/api/posts')
        ]);

        // Hitung jumlah data
        setStats({
          usersCount: usersRes.data.length,
          articlesCount: articlesRes.data.length,
          forumPostsCount: postsRes.data.length
        });

        // C. Buat "Activity Log" Sederhana dari Data Postingan Terbaru
        // Kita ambil 5 postingan forum terakhir sebagai "Aktivitas Terbaru"
        const latestPosts = postsRes.data.slice(0, 5).map(post => ({
          type: 'Forum Post',
          user: post.author.full_name,
          title: post.title,
          time: new Date(post.created_at).toLocaleDateString()
        }));
        
        setRecentActivities(latestPosts);

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className={styles.adminContainer}>
      
      {/* --- NAVBAR ADMIN --- */}
      <nav className={styles.adminNav}>
        <div className={styles.logoWrapper}>
          <Link to="/">
            <img src={logoImage} alt="HeritEdge Logo" className={styles.adminLogoIcon} />
            <span className={styles.adminLogoText}>HeritEdge</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          {/* Hanya Artikel, Katalog, Forum sesuai request */}
          <Link to="/admin/artikel">Artikel</Link>
          <Link to="/admin/katalog">Katalog</Link>
          <Link to="/admin/forum">Forum</Link>
          <Link to="/admin/quiz">Quiz</Link>
          <Link to="/admin/users">User</Link>
        </div>
      </nav>

      <main className={styles.dashboard}>
        <h1 className={styles.mainTitle}>Dashboard Admin</h1>
        
        <div className={styles.gridContainer}>
          
          {/* 1. KARTU SAMBUTAN (Dinamis Nama Admin) */}
          <div className={`${styles.card} ${styles.welcomeCard}`}>
            <h2>Selamat datang, {adminName}</h2>
            <p>Anda memiliki akses penuh untuk mengelola platform HeritEdge.</p>
          </div>

          {/* 2. KARTU STATISTIK (Data Real dari Database) */}
          <div className={`${styles.card} ${styles.statsCard}`}>
            <h3>Statistik Platform</h3>
            <div className={styles.statsNumbers}>
              <div><span className={styles.number}>{stats.articlesCount}</span><span>Artikel</span></div>
              <div><span className={styles.number}>{stats.forumPostsCount}</span><span>Post Forum</span></div>
              <div><span className={styles.number}>{stats.usersCount}</span><span>Pengguna</span></div>
            </div>
          </div>

          {/* 3. GRAFIK (Visualisasi) */}
          <div className={`${styles.card} ${styles.chartCard}`}>
            <h3>Tren Aktivitas</h3>
            <div className={styles.chartWrapper}>
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>

          {/* 4. AKTIVITAS TERBARU (Track Record Postingan) */}
          <div className={`${styles.card} ${styles.activityCard}`}>
            <h3>Aktivitas Pengguna Terbaru</h3>
            {recentActivities.length > 0 ? (
              <ul>
                {recentActivities.map((act, index) => (
                  <li key={index}>
                    <strong>{act.user}</strong> memposting di <em>{act.type}</em>: <br/>
                    <span>"{act.title}"</span> <small style={{color:'#888'}}>({act.time})</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{padding: '10px', color: '#666'}}>Belum ada aktivitas baru.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;