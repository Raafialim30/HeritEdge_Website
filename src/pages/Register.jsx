import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // <--- JANGAN LUPA IMPORT INI
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (event) => { // <--- Tambahkan async di sini
    event.preventDefault();
    
    // Validasi input
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (password.length < 8) {
        setError('Kata sandi minimal harus 8 karakter.');
        return;
    }
    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    // --- BAGIAN INI YANG DIPERBAIKI ---
    try {
      // Mengirim data ke Flask Backend
      const response = await axios.post('http://127.0.0.1:5000/api/register', {
        full_name: fullName, // Sesuaikan dengan routes.py (data['full_name'])
        email: email,
        password: password
      });

      console.log('Response:', response.data);
      setIsLoading(false);
      alert('Registrasi berhasil! Silakan masuk.');
      navigate('/login');

    } catch (err) {
      setIsLoading(false);
      // Menangkap pesan error dari Flask (misal: "email exists")
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Terjadi kesalahan saat menghubungi server.');
      }
      console.error(err);
    }
    // ----------------------------------
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        
        <Link to="/" className={styles.backButton}>
          &larr; Kembali
        </Link>
        
        <div className={styles.registerHeader}>
          <h1 className={styles.logo}>HeritEdge</h1>
          <h2 className={styles.title}>Buat Akun Baru</h2>
          <p className={styles.subtitle}>Satu langkah lagi untuk memulai perjalanan Anda.</p>
        </div>
        
        <form className={styles.registerForm} onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="fullName">Nama Lengkap</label>
            <input 
              type="text" 
              id="fullName"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap Anda"
              disabled={isLoading}
            />
          </div>
          
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
              placeholder="Minimal 8 karakter"
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <input 
              type="password" 
              id="confirmPassword"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              disabled={isLoading}
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}
          
          <div className={styles.terms}>
            <label className={styles.termsLabel}>
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
              />
              Saya setuju dengan <button type="button" className={styles.termsLink}>Syarat & Ketentuan</button> yang berlaku.
            </label>
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? (
              <span className={styles.loadingText}>Mendaftarkan...</span>
            ) : (
              'Daftar'
            )}
          </button>
        </form>

        <div className={styles.registerFooter}>
          <p className={styles.footerText}>
            Sudah punya akun?
            <Link to="/login" className={styles.switchButton}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;