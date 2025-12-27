import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Email dan kata sandi tidak boleh kosong.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // --- MENGHUBUNGI FLASK API ---
      const response = await axios.post('http://127.0.0.1:5000/api/login', {
        email: email,
        password: password
      });

      console.log('Login berhasil:', response.data);
      
      // REVISI: Ambil bagian .user dari response.data
      // Karena routes.py mengirimkan { "message": "...", "user": { "id": 1, "role": "admin", ... } }
      const userData = response.data.user;

      // Simpan hanya data profil user ke LocalStorage
      localStorage.setItem('user', JSON.stringify(userData));

      setIsLoading(false);
      
      // Berikan data user yang sudah bersih ke App.js
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      
      navigate('/'); 

    } catch (err) {
      setIsLoading(false);
      console.error("Login Error:", err);

      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); 
      } else {
        setError('Gagal masuk. Periksa koneksi server atau internet Anda.');
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <Link to="/" className={styles.backButton}>
          &larr; Kembali
        </Link>

        <div className={styles.loginHeader}>
          <h1 className={styles.logo}>HeritEdge</h1>
          <h2 className={styles.title}>Masuk ke Akun Anda</h2>
          <p className={styles.subtitle}>Selamat datang kembali! Masukkan kredensial Anda.</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Alamat Email</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Kata Sandi</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi Anda"
              disabled={isLoading}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.rememberForgot}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              Ingat saya
            </label>
            <button type="button" className={styles.forgotPassword}>Lupa kata sandi?</button>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? <span className={styles.loadingText}>Memproses...</span> : 'Masuk'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.footerText}>
            Belum punya akun?
            <Link to="/register" className={styles.switchButton}>Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;