// src/pages/Katalog.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './Katalog.module.css';

// 1. Definisikan URL dasar API Anda
const API_BASE_URL = 'http://127.0.0.1:5000';

const Katalog = () => {
  // --- Hooks ---
  const location = useLocation();

  // --- State ---
  const [catalogs, setCatalogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Filter & Search
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // --- 2. Fungsi Pembantu untuk Mendapatkan URL Gambar ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
    
    // Jika sudah berupa URL lengkap (http...)
    if (imagePath.startsWith('http')) return imagePath;
    
    // Jika berupa data Base64 (untuk mendukung data lama jika ada)
    if (imagePath.startsWith('data:image')) return imagePath;

    // Jika berupa path relatif (misal: 'static/cat_123.jpg')
    // Kita bersihkan prefix 'static/' agar tidak terjadi double path jika server sudah mengarah ke folder static
    const cleanPath = imagePath.replace(/^static\//, ''); 
    return `${API_BASE_URL}/static/${cleanPath}`;
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/catalogs`);
        if (Array.isArray(res.data)) {
            setCatalogs(res.data);
        } else {
            console.error("Format data salah, mengharapkan Array:", res.data);
            setCatalogs([]); 
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching catalogs:", err);
        setError("Gagal memuat data katalog. Pastikan server Flask menyala.");
        setIsLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  // --- Deteksi URL Parameter ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');

    if (filterParam) {
      setActiveFilter(filterParam);
    }
  }, [location.search]);

  // --- Generate Kategori Dinamis ---
  const filterCategories = useMemo(() => {
    if (!Array.isArray(catalogs)) return ['Semua'];
    
    const uniqueCategories = [...new Set(catalogs.map(item => item.category || 'Lainnya'))];
    return ['Semua', ...uniqueCategories];
  }, [catalogs]);

  // --- Logika Filter & Search ---
  const filteredItems = useMemo(() => {
    if (!Array.isArray(catalogs)) return [];

    if (activeFilter !== 'Semua') {
      return catalogs.filter(item => {
        const itemCategory = item.category || '';
        const itemTitle = item.title || '';

        const matchesCategory = itemCategory === activeFilter;
        const matchesSearch = itemTitle.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }

    const categoryCounts = {}; 
    const limitedList = [];

    catalogs.forEach(item => {
      const itemCategory = item.category || 'Lainnya';
      const itemTitle = item.title || '';
      const matchesSearch = itemTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (matchesSearch) {
        if (!categoryCounts[itemCategory]) {
          categoryCounts[itemCategory] = 0;
        }

        if (categoryCounts[itemCategory] < 3) {
          limitedList.push(item);
          categoryCounts[itemCategory]++; 
        }
      }
    });

    return limitedList;
  }, [activeFilter, searchTerm, catalogs]);


  // --- Render Loading/Error ---
  if (isLoading) return <div className={styles.katalogPage}><div className={styles.pageHeader}><p>Memuat katalog budaya...</p></div></div>;
  if (error) return <div className={styles.katalogPage}><div className={styles.pageHeader}><p style={{ color: 'red' }}>{error}</p></div></div>;

  return (
    <div className={styles.katalogPage}>
      <div className={styles.pageHeader}>
        <h1>Katalog Budaya</h1>
        <p>Jelajahi ragam warisan budaya dari Sabang sampai Merauke.</p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Cari budaya..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterButtons}>
          {filterCategories.map(category => (
            <button 
              key={category} 
              className={activeFilter === category ? styles.active : ''}
              onClick={() => {
                setActiveFilter(category);
                setSearchTerm(''); 
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.katalogGrid}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <Link to={`/katalog/${item.id}`} key={item.id} className={styles.katalogCard}>
              <div className={styles.imageContainer}>
                {/* 3. Gunakan getImageUrl untuk menampilkan gambar dari server Flask */}
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.title} 
                  className={styles.cardImage}
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading'; 
                  }} 
                />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardCategory}>{item.category}</span>
                <h3>{item.title}</h3>
                <p className={styles.cardDescription}>
                  {item.description 
                    ? (item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description)
                    : 'Tidak ada deskripsi.'}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Tidak ada item budaya yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Katalog;