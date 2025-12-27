// src/pages/LandingPage.jsx

import React from 'react';
import Header from '../components/Header';
import Features from '../components/Features';
import Catalog from './Katalog'; // Pastikan path ini benar (kadang di ../components/Catalog)
import LatestArticles from '../components/LatestArticles';
import styles from './LandingPage.module.css';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    // Gunakan class container dari module CSS
    <div className={styles.landingContainer}>
      <Header />
      <Features />
      <Catalog />
      <LatestArticles />
      <Footer />
    </div>
  );
};

export default LandingPage;