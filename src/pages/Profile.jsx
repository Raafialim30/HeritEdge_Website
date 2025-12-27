import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';

// Import gambar default
import defaultAvatar from '../assets/logo.png'; 

const Profile = () => {
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pastikan URL server sesuai dengan backend Flask Anda
  const SERVER_URL = 'http://127.0.0.1:5000/';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Menyesuaikan mapping field dari database/localstorage
      setUserData({
        id: parsedUser.id || parsedUser.user_id,
        name: parsedUser.full_name || parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        bio: parsedUser.bio || '',
        avatar: parsedUser.avatar || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');
  setIsLoading(true);

  if (!userData.id) {
    setError("ID User tidak ditemukan. Silakan login ulang.");
    setIsLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('phone', userData.phone);
    formData.append('bio', userData.bio);
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    const response = await axios.put(`${SERVER_URL}api/users/${userData.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Simpan hasil update ke LocalStorage agar saat refresh data tetap baru
    localStorage.setItem('user', JSON.stringify(response.data));

    window.dispatchEvent(new Event("storage_updated"));

    setUserData(prev => ({
      ...prev,
      ...response.data,
      name: response.data.full_name || response.data.name // Sinkronkan key name
    }));

    setSuccessMessage('Profil berhasil diperbarui!');
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  } catch (err) {
    // Tangkap pesan error dari backend untuk mempermudah debug
    setError(err.response?.data?.error || 'Gagal memperbarui profil.');
  } finally {
    setIsLoading(false);
  }
};

  // Logika penentuan sumber gambar
  const getAvatarSource = () => {
    if (previewUrl) return previewUrl;
    if (userData.avatar) return `${SERVER_URL}${userData.avatar}`;
    return defaultAvatar;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Profil Saya</h2>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}

        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img src={getAvatarSource()} alt="Foto Profil" className={styles.avatarImage} />
            {isEditing && (
              <>
                <button 
                  className={styles.changePhotoBtn} 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                >
                  📷 Ubah
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                />
              </>
            )}
          </div>
        </div>

        {/* --- FORM SECTION --- */}
        <form className={styles.infoSection} onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label>Nama Lengkap</label>
            {isEditing ? (
              <input type="text" name="name" value={userData.name} onChange={handleChange} className={styles.inputField} disabled={isLoading} />
            ) : (
              <p className={styles.infoText}>{userData.name || '-'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Nomor Telepon</label>
            {isEditing ? (
              <input type="text" name="phone" value={userData.phone} onChange={handleChange} className={styles.inputField} placeholder="08xx-xxxx-xxxx" disabled={isLoading} />
            ) : (
              <p className={styles.infoText}>{userData.phone || '-'}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Bio / Tentang Saya</label>
            {isEditing ? (
              <textarea name="bio" value={userData.bio} onChange={handleChange} className={styles.textArea} rows="3" disabled={isLoading} />
            ) : (
              <p className={styles.infoText}>{userData.bio || 'Belum ada bio.'}</p>
            )}
          </div>

          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button type="button" onClick={() => { setIsEditing(false); setPreviewUrl(null); }} className={styles.cancelBtn} disabled={isLoading}>
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className={styles.editBtn}>
                Edit Profil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;