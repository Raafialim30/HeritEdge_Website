// src/components/Features.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BsBook, BsGeoAlt, BsQuestionCircle, BsChatDots } from 'react-icons/bs';
import styles from './Features.module.css';

const Features = () => {
  return (
    <section className={styles.featuresSection}>
      <h2 className={styles.title}>Fitur Utama</h2>
      
      <div className={styles.featuresGrid}>
        
        {/* Kartu 1: Katalog */}
        <Link to="/katalog" className={styles.featureCard}>
          <div className={styles.iconCircle}>
            <BsBook size={32} />
          </div>
          <span>Katalog</span>
        </Link>
        
        {/* Kartu 2: Peta */}
        <Link to="/peta" className={styles.featureCard}>
          <div className={styles.iconCircle}>
            <BsGeoAlt size={32} />
          </div>
          <span>Peta</span>
        </Link>
        
        {/* Kartu 3: Kuis */}
        <Link to="/quiz" className={styles.featureCard}>
          <div className={styles.iconCircle}>
            <BsQuestionCircle size={32} />
          </div>
          <span>Kuis</span>
        </Link>

        {/* Kartu 4: Forum */}
        <Link to="/forum" className={styles.featureCard}>
          <div className={styles.iconCircle}>
            <BsChatDots size={32} />
          </div>
          <span>Forum</span>
        </Link>

      </div>
    </section>
  );
};

export default Features;