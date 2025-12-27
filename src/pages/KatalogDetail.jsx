import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './KatalogDetail.module.css';

// 1. Definisikan URL dasar API agar konsisten dengan file Katalog lainnya
const API_BASE_URL = 'http://127.0.0.1:5000';

const KatalogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk menangani jika gambar gagal dimuat
  const [imgError, setImgError] = useState(false);

  // --- 2. Fungsi Pembersihan Path Gambar (Sama dengan Katalog.jsx) ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Jika data berupa Base64 (Data lama)
    if (imagePath.startsWith('data:image')) return imagePath;

    // Jika data berupa URL lengkap (Internet)
    if (imagePath.startsWith('http')) return imagePath;
    
    // Jika data berupa path relatif 'static/foto.jpg'
    // Membersihkan prefix 'static/' agar tidak terjadi penumpukan path
    const cleanPath = imagePath.replace(/^static\//, ''); 
    return `${API_BASE_URL}/static/${cleanPath}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Memanggil API berdasarkan ID
        const res = await axios.get(`${API_BASE_URL}/api/catalogs/${id}`);
        setItem(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError("Katalog tidak ditemukan atau terjadi kesalahan server.");
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // --- Render Kondisional ---
  if (isLoading) return <div className={styles.loaderContainer}><div className={styles.loader}></div></div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;
  if (!item) return null;

  return (
    <div className={styles.detailPage}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <span className={styles.backIcon}>←</span> Kembali
      </button>

      <article className={styles.articleContainer}>
        <header className={styles.articleHeader}>
          <span className={styles.categoryBadge}>{item.category}</span>
          <h1 className={styles.title}>{item.title}</h1>
          <div className={styles.metaInfo}>
            <span className={styles.author}>Warisan Nusantara</span>
            <span className={styles.dot}>•</span>
            <span className={styles.status}>Terverifikasi</span>
          </div>
        </header>

        {/* 3. LOGIKA TAMPILAN GAMBAR DENGAN HANDLING ERROR */}
        <figure className={styles.imageWrapper}>
          {!imgError && item.image ? (
            <img 
              src={getImageUrl(item.image)} 
              alt={item.title} 
              className={styles.mainImage} 
              // Jika URL gambar yang dibentuk salah atau file tidak ada di server, pindah ke mode error
              onError={() => setImgError(true)} 
            />
          ) : (
            <div className={styles.errorPlaceholder}>
              <span>📷 Gambar tidak tersedia atau sedang diproses</span>
            </div>
          )}
        </figure>

        <section className={styles.contentBody}>
          <p className={styles.description}>{item.description}</p>
        </section>

        <footer className={styles.articleFooter}>
          <div className={styles.footerDivider}></div>
          <p>© 2024 Warisan Nusantara - Melestarikan Tradisi Indonesia</p>
        </footer>
      </article>
    </div>
  );
};

export default KatalogDetail;