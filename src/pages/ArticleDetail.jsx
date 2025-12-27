// src/pages/ArticleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ArticleDetail.module.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mendapatkan URL gambar dari backend
  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return 'https://via.placeholder.com/1200x600?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanedPath}`;
  };

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/articles/${id}`);
        setArticle(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching article detail:", err);
        setError("Artikel tidak ditemukan atau terjadi kesalahan server.");
        setIsLoading(false);
      }
    };
    fetchArticleDetail();
  }, [id]);

  if (isLoading) return <div className={styles.loadingContainer}><div className={styles.spinner}></div></div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!article) return null;

  return (
    <div className={styles.detailPage}>
      {/* Tombol Kembali dengan posisi yang sudah disesuaikan agar tidak tertutup navbar */}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <span>←</span> Kembali
      </button>

      <article className={styles.articleWrapper}>
        <header className={styles.header}>
          <div className={styles.metaTop}>
            <span className={styles.categoryBadge}>Wawasan Budaya</span>
            <span className={styles.date}>{article.created_at || 'Baru saja'}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>
        </header>

        <div className={styles.mainImageContainer}>
          <img 
            src={getImageUrl(article.image)} 
            alt={article.title} 
            className={styles.mainImage}
          />
        </div>

        <div className={styles.contentBody}>
          <p className={styles.contentParagraph}>
            {article.content}
          </p>
        </div>

        <footer className={styles.articleFooter}>
          <div className={styles.divider}></div>
          <p>Terima kasih telah membaca. Bagikan wawasan ini untuk melestarikan budaya Indonesia.</p>
        </footer>
      </article>
    </div>
  );
};

export default ArticleDetail;