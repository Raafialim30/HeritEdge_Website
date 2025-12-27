import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminQuiz.module.css';
import logoImage from '../assets/logo.png'; 

const AdminQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: ''
  });
  const [loading, setLoading] = useState(false);
  
  // State baru untuk menangani proses Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz');
      setQuestions(res.data);
    } catch (err) { 
      console.error("Gagal mengambil data:", err.message);
    }
  };

  useEffect(() => { 
    fetchQuestions(); 
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNGSI TRIGGER EDIT ---
  const handleEditClick = (q) => {
    setIsEditing(true);
    setEditId(q.id);
    // Masukkan data soal ke form input
    setFormData({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    });
    // Scroll ke atas agar admin langsung melihat form edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FUNGSI BATAL EDIT ---
  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correct_answer) {
      alert("Silakan pilih Jawaban Benar.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // JIKA SEDANG EDIT: Panggil endpoint PUT
        await axios.put(`http://localhost:5000/api/quiz/${editId}`, formData);
        alert('Soal berhasil diperbarui!');
      } else {
        // JIKA TAMBAH BARU: Panggil endpoint POST
        await axios.post('http://localhost:5000/api/quiz', formData);
        alert('Soal berhasil ditambahkan!');
      }
      
      cancelEdit(); // Reset form dan balik ke mode tambah
      fetchQuestions(); // Refresh tabel
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
      try {
        await axios.delete(`http://localhost:5000/api/quiz/${id}`);
        alert("Soal berhasil dihapus!");
        fetchQuestions();
      } catch (err) {
        alert(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logoImage} alt="Logo" className={styles.logoIcon} />
          <span className={styles.adminTitle}>HeritEdge Admin</span>
        </div>
        <nav className={styles.topNav}>
          <Link to="/admin/artikel">Artikel</Link>
          <Link to="/admin/katalog">Katalog</Link>
          <Link to="/admin/forum">Forum</Link>
          <Link to="/admin/quiz" className={styles.activeLink}>Quiz</Link>
          <Link to="/admin/users">User</Link>
          <Link to="/admindashboard" className={styles.backLink}>&larr; Dashboard</Link>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Manajemen Kuis Budaya</h1>

        {/* Card Form: Bisa jadi Tambah atau Edit */}
        <div className={styles.card}>
          <h3 className={styles.cardHeader}>
            {isEditing ? '📝 Edit Soal Kuis' : '➕ Tambah Soal Kuis'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Pertanyaan</label>
              <textarea name="question" value={formData.question} onChange={handleChange} rows="3" required />
            </div>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Opsi A</label>
                <input type="text" name="option_a" value={formData.option_a} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Opsi B</label>
                <input type="text" name="option_b" value={formData.option_b} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Opsi C</label>
                <input type="text" name="option_c" value={formData.option_c} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Opsi D</label>
                <input type="text" name="option_d" value={formData.option_d} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{color: '#8b5e3c', fontWeight: 'bold'}}>Pilih Jawaban Benar</label>
              <select name="correct_answer" value={formData.correct_answer} onChange={handleChange} required className={styles.selectInput}>
                <option value="">-- Pilih Jawaban --</option>
                {formData.option_a && <option value={formData.option_a}>{formData.option_a}</option>}
                {formData.option_b && <option value={formData.option_b}>{formData.option_b}</option>}
                {formData.option_c && <option value={formData.option_c}>{formData.option_c}</option>}
                {formData.option_d && <option value={formData.option_d}>{formData.option_d}</option>}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className={styles.submitBtn} disabled={loading} style={{ flex: 3 }}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Soal')}
              </button>
              
              {isEditing && (
                <button type="button" onClick={cancelEdit} className={styles.cancelBtn} style={{ flex: 1, backgroundColor: '#7f8c8d', color: 'white', border:'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabel Daftar Soal */}
        <div className={styles.card}>
          <h3 className={styles.cardHeader}>Daftar Soal ({questions.length})</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th width="5%">No</th>
                  <th width="40%">Pertanyaan</th>
                  <th width="35%">Jawaban Benar</th>
                  <th width="20%">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Belum ada data soal.</td></tr>
                ) : (
                    questions.map((q, index) => (
                    <tr key={q.id || index}>
                        <td>{index + 1}</td>
                        <td>{q.question}</td>
                        <td style={{color: '#27ae60', fontWeight:'bold'}}>{q.correct_answer}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleEditClick(q)} 
                              style={{ backgroundColor: '#f39c12', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(q.id)} 
                              className={styles.deleteBtn}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminQuiz;