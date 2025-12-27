import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminArticle.module.css';
import logoImage from '../assets/logo.png';

const AdminArticle = () => {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState({
    title: '', image: null, excerpt: '', content: '', is_featured: false
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const API_URL = 'http://127.0.0.1:5000/api/articles';

  const fetchArticles = async () => {
    try {
      const res = await axios.get(API_URL); 
      setArticles(res.data);
    } catch (err) { console.error("Gagal ambil artikel", err); }
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // --- FUNGSI TRIGGER EDIT ---
  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormData({
      title: item.title,
      image: null, // User hanya upload jika ingin ganti gambar
      excerpt: item.excerpt,
      content: item.content,
      is_featured: item.is_featured
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: '', image: null, excerpt: '', content: '', is_featured: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('excerpt', formData.excerpt);
    dataToSend.append('content', formData.content);
    dataToSend.append('is_featured', formData.is_featured);
    if (formData.image) dataToSend.append('image', formData.image);

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${editId}`, dataToSend);
        alert('Artikel Berhasil Diperbarui!');
      } else {
        if (!formData.image) return alert("Pilih gambar dahulu");
        await axios.post(API_URL, dataToSend);
        alert('Artikel Berhasil Ditambah!');
      }
      cancelEdit();
      fetchArticles();
    } catch (err) {
      alert('Gagal menyimpan artikel.');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus artikel ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchArticles();
      } catch (err) { alert("Gagal menghapus data"); }
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
          <Link to="/admin/artikel" className={styles.activeLink}>Artikel</Link>
          <Link to="/admin/katalog">Katalog</Link>
          <Link to="/admin/forum">Forum</Link>
          <Link to="/admin/quiz">Quiz</Link>
          <Link to="/admin/users">User</Link>
          <Link to="/admindashboard" className={styles.backLink}>&larr; Dashboard</Link>
        </div>
      </nav>

      <main className={styles.content}>
        <h1 className={styles.title}>Manajemen Artikel</h1>
        
        <div className={styles.card}>
          <h3>{isEditing ? '📝 Edit Artikel' : '➕ Tambah Artikel Baru'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Judul Artikel</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Pilih Gambar {isEditing && "(Kosongkan jika tidak ingin ganti)"}</label>
              <input type="file" name="image" onChange={handleChange} accept="image/*" />
            </div>

            <div className={styles.formGroup}>
              <label>Ringkasan (Excerpt)</label>
              <input type="text" name="excerpt" value={formData.excerpt} onChange={handleChange} maxLength="200" required />
            </div>
            <div className={styles.formGroup}>
              <label>Isi Lengkap</label>
              <textarea name="content" value={formData.content} onChange={handleChange} rows="5" required />
            </div>
            <div className={styles.checkboxGroup}>
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} id="feat" />
              <label htmlFor="feat">Featured</label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className={styles.submitBtn} disabled={loading} style={{flex: 3}}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Publish Artikel')}
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
          <h3>Daftar Artikel ({articles.length})</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.is_featured ? 'Featured' : '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} style={{marginRight: '5px', backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer'}}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminArticle;