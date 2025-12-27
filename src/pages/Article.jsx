import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Article.module.css';

// 1. Definisikan Base URL API Flask
const API_BASE_URL = 'http://127.0.0.1:5000';
const ARTICLE_API_URL = `${API_BASE_URL}/api/articles`;

const Article = () => {
  // 1. State untuk menampung data dari database
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi utilitas untuk mendapatkan URL Gambar yang lengkap
  // Fungsi ini sangat penting untuk menggabungkan Base URL dengan path dari DB
  const getImageUrl = (imagePath) => {
    // 1. Cek jika path kosong atau null
    if (!imagePath || typeof imagePath !== 'string') {
        return 'https://via.placeholder.com/800x400'; // Placeholder jika kosong
    }
    
    // 2. Jika path sudah merupakan URL lengkap (misalnya http://), kembalikan
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 3. Jika path adalah path relatif (misalnya /static/namafile.jpg), 
    // gabungkan dengan Base URL.
    // Kita hapus '/' di awal path jika ada untuk mencegah // (double slash)
    const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // Pastikan API_BASE_URL tidak diakhiri dengan '/'
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    return `${baseUrl}/${cleanedPath}`;
  };

  // 2. Mengambil data saat halaman dibuka
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(ARTICLE_API_URL);
        setArticles(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Gagal mengambil artikel:", err);
        setError("Gagal memuat artikel. Pastikan server Flask (port 5000) sudah berjalan dan CORS diaktifkan.");
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 3. Logika memisahkan Featured Article
  const featuredArticle = articles.find(article => article.is_featured) || articles[0];
  const otherArticles = articles.filter(article => article.id !== (featuredArticle?.id));

  // 4. Tampilan Loading / Error
  if (isLoading) {
    return (
      <div className={styles.articlePage}>
        <div className={styles.pageHeader}><p>Memuat artikel...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.articlePage}>
        <div className={styles.pageHeader}><p className={styles.errorText}>{error}</p></div>
      </div>
    );
  }

  // 5. Tampilan Utama (Jika data ada)
  return (
    <div className={styles.articlePage}>
      <div className={styles.pageHeader}>
        <h1>Artikel Budaya</h1>
        <p>Wawasan mendalam tentang ragam warisan, tradisi, dan cerita dari seluruh nusantara.</p>
      </div>
      
      {/* Featured Article Section */}
      {featuredArticle && (
        <Link to={`/artikel/${featuredArticle.id}`} className={styles.featuredArticleCard}>
          <img 
            // Menggunakan fungsi yang telah diperbaiki
            src={getImageUrl(featuredArticle.image)} 
            alt={featuredArticle.title} 
          />
          <div className={styles.cardContent}>
            <span className={styles.cardDate}>{featuredArticle.date}</span>
            <h2>{featuredArticle.title}</h2>
            <p>{featuredArticle.excerpt}</p>
            <span className={styles.readMore}>
              Baca Selengkapnya &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* Article Grid Section */}
      <div className={styles.articleGrid}>
        {otherArticles.length > 0 ? (
          otherArticles.map((article) => (
            <Link to={`/artikel/${article.id}`} key={article.id} className={styles.articleCard}>
              <img 
                // Menggunakan fungsi yang telah diperbaiki
                src={getImageUrl(article.image)} 
                alt={article.title} 
              />
              <div className={styles.cardContent}>
                <span className={styles.cardDate}>{article.date}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span className={styles.readMore}>
                  Baca Selengkapnya &rarr;
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p style={{textAlign: 'center', width: '100%'}}>Belum ada artikel lainnya.</p>
        )}
      </div>
    </div>
  );
};

export default Article;