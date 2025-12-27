import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './LatestArticles.module.css';

// =========================================================================
// 💡 FIX 1: Definisikan Base URL Flask dan fungsi getImageUrl
// =========================================================================
const API_BASE_URL = 'http://127.0.0.1:5000';

// Fungsi utilitas untuk mendapatkan URL Gambar yang lengkap
const getImageUrl = (imagePath) => {
    const defaultPlaceholder = 'https://via.placeholder.com/400x300?text=No+Image';

    // 1. Cek jika path kosong atau null
    if (!imagePath || typeof imagePath !== 'string') {
        return defaultPlaceholder; 
    }
    
    // 2. Jika path sudah merupakan URL lengkap (misalnya http://), kembalikan
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 3. Gabungkan Base URL dengan path relatif dari DB
    const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    return `${baseUrl}/${cleanedPath}`;
};
// =========================================================================


const LatestArticles = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Ambil data dari database
        const res = await axios.get(`${API_BASE_URL}/api/articles`);
        
        // Pastikan data yang diterima adalah Array sebelum diolah
        if (Array.isArray(res.data)) {
            // Ambil 3 data pertama
            setArticles(res.data.slice(0, 3)); 
        } else {
            console.error("Format data artikel salah, mengharapkan Array:", res.data);
            setArticles([]);
        }

        setIsLoading(false); // Matikan loading
      } catch (err) {
        console.error("Gagal ambil artikel home:", err);
        setError("Gagal memuat artikel terbaru. Pastikan server Flask berjalan."); // Set pesan error
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // --- Render Loading / Error ---
  if (isLoading) {
    return (
        <section className={styles.latestArticlesSection}>
            <div className={styles.container}>
                <p className={styles.loadingText}>Memuat artikel terbaru...</p>
            </div>
        </section>
    );
  }

  if (error) {
    return (
        <section className={styles.latestArticlesSection}>
            <div className={styles.container}>
                <p className={styles.errorText}>{error}</p>
            </div>
        </section>
    );
  }
  // --------------------------------

  return (
    <section className={styles.latestArticlesSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Artikel Terbaru</h2>
        <p className={styles.sectionSubtitle}>
          Temukan wawasan baru tentang kekayaan budaya nusantara.
        </p>

        <div className={styles.articlesGrid}>
          {articles.length > 0 ? (
            // 4. Render Data
            articles.map((article) => (
              <Link 
                to={`/artikel/${article.id}`} 
                key={article.id} 
                className={styles.articleCard}
              >
                <div className={styles.imageWrapper}>
                  {/* 💡 FIX 2: Gunakan getImageUrl untuk URL yang benar */}
                  <img 
                    src={getImageUrl(article.image)} 
                    alt={article.title} 
                    // Penanganan error gambar yang lebih baik
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Error+Image'; }}
                  />
                </div>
                <div className={styles.content}>
                  <span className={styles.date}>{article.date}</span>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <span className={styles.readMore}>Baca Selengkapnya &rarr;</span>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.emptyText}>Belum ada artikel terbaru.</p>
          )}
        </div>

        <div className={styles.centerButton}>
          <Link to="/artikel" className={styles.viewAllBtn}>
            Lihat Semua Artikel
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;