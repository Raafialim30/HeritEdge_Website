import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminKatalog.module.css';
import logoImage from '../assets/logo.png';

const API_BASE_URL = 'http://127.0.0.1:5000';

const AdminKatalog = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [formData, setFormData] = useState({
    title: '', category: 'Rumah Adat', description: ''
  });
  const [imageFile, setImageFile] = useState(null); // State khusus untuk file asli
  const [previewUrl, setPreviewUrl] = useState(''); // State untuk preview gambar
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCatalogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/catalogs`);
      setCatalogs(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCatalogs(); }, []);

  // --- 1. Fungsi Handle File (Kirim File, Bukan String) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Simpan file asli untuk dikirim ke server
      setPreviewUrl(URL.createObjectURL(file)); // Buat URL sementara untuk preview di browser
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description
    });
    // Jika gambar sudah ada di server, buat preview-nya
    setPreviewUrl(item.image ? (item.image.startsWith('data') ? item.image : `${API_BASE_URL}/${item.image}`) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', category: 'Rumah Adat', description: '' });
    setImageFile(null);
    setPreviewUrl('');
    if(document.getElementById("fileInput")) document.getElementById("fileInput").value = "";
  };

  // --- 2. Fungsi Submit Menggunakan FormData (Penting!) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    
    // Hanya append gambar jika ada file baru yang dipilih
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/catalogs/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Katalog Berhasil Diperbarui!');
      } else {
        if (!imageFile) return alert("Silakan pilih gambar terlebih dahulu!");
        await axios.post(`${API_BASE_URL}/api/catalogs`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Katalog Berhasil Ditambah!');
      }
      cancelEdit();
      fetchCatalogs();
    } catch (err) { 
      alert('Gagal menyimpan data. Pastikan ukuran file tidak terlalu besar.'); 
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus item katalog ini?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/catalogs/${id}`);
        fetchCatalogs();
      } catch (err) {
        alert("Gagal menghapus item.");
      }
    }
  };

  return (
    <div className={styles.adminPageContainer}>
      <nav className={styles.adminNav}>
        <div className={styles.logoWrapper}>
          <Link to="/admindashboard">
            <img src={logoImage} alt="HeritEdge Logo" className={styles.adminLogoIcon} />
            <span className={styles.adminLogoText}>HeritEdge Admin</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link to="/admin/artikel">Artikel</Link>
          <Link to="/admin/katalog" className={styles.activeLink}>Katalog</Link>
          <Link to="/admin/forum">Forum</Link>
          <Link to="/admin/quiz">Quiz</Link>
          <Link to="/admin/users">User</Link>
          <Link to="/admindashboard" className={styles.backLink}>&larr; Dashboard</Link>
        </div>
      </nav>

      <main className={styles.content}>
        <h1 className={styles.title}>Manajemen Katalog Budaya</h1>

        <div className={styles.card}>
          <h3>{isEditing ? '📝 Edit Item Katalog' : '➕ Tambah Item Katalog'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Nama Budaya</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Kategori</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Rumah Adat">Rumah Adat</option>
                  <option value="Tarian">Tarian</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Alat Musik">Alat Musik</option>
                  <option value="Senjata">Senjata</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Upload Gambar (PNG/JPG)</label>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} required={!isEditing} />
              {previewUrl && (
                <div style={{ marginTop: '10px' }}>
                  <img src={previewUrl} alt="Preview" style={{ height: '100px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Deskripsi</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className={styles.submitBtn} disabled={loading} style={{flex: 3}}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Katalog')}
              </button>
              {isEditing && (
                <button type="button" onClick={cancelEdit} style={{flex: 1, backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <h3>List Katalog ({catalogs.length})</h3>
          <div className={styles.gridList}>
            {catalogs.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <img 
                  src={item.image ? (item.image.startsWith('data') ? item.image : `${API_BASE_URL}/${item.image}`) : 'https://via.placeholder.com/150'} 
                  alt={item.title} 
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}} 
                />
                <div className={styles.itemInfo}>
                  <h4>{item.title}</h4>
                  <span className={styles.catBadge}>{item.category}</span>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <button onClick={() => handleEdit(item)} style={{backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} className={styles.deleteIcon}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminKatalog;