import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminUsers.module.css';
import logoImage from '../assets/logo.png';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mengambil data dari @bp.route('/users', methods=['GET'])
      const res = await axios.get('http://127.0.0.1:5000/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Gagal mengambil data user. Pastikan server Flask berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini secara permanen?")) {
      try {
        // Mengikuti @bp.route('/users/<int:id>', methods=['DELETE'])
        await axios.delete(`http://127.0.0.1:5000/api/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
        alert("User berhasil dihapus");
      } catch (err) {
        alert("Gagal menghapus user");
      }
    }
  };

  const toggleRole = async (user) => {
    // Logika penentuan role baru (kebalikan dari role sekarang)
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    try {
      // Mengikuti @bp.route('/users/<int:id>/admin-update', methods=['PUT'])
      // Mengirimkan payload sesuai data.get('role') di Flask
      await axios.put(`http://127.0.0.1:5000/api/users/${user.id}/admin-update`, {
        role: newRole
      });
      
      alert(`Role ${user.full_name} berhasil diubah menjadi ${newRole}`);
      fetchUsers(); // Refresh data agar UI terupdate
    } catch (err) {
      console.error("Update Role Error:", err);
      alert("Gagal mengubah role");
    }
  };

  return (
    <div className={styles.adminPageContainer}>
      <nav className={styles.adminNav}>
        <div className={styles.logoWrapper}>
          <Link to="/admindashboard">
            <img src={logoImage} alt="Logo" className={styles.adminLogoIcon} />
            <span className={styles.adminLogoText}>HeritEdge Admin</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link to="/admin/artikel">Artikel</Link>
          <Link to="/admin/katalog">Katalog</Link>
          <Link to="/admin/forum">Forum</Link>
          <Link to="/admin/quiz">Quiz</Link>
          <Link to="/admin/users" className={styles.activeLink}>User</Link>
          <Link to="/admindashboard" className={styles.backLink}>&larr; Dashboard</Link>
        </div>
      </nav>

      <main className={styles.content}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Manajemen Pengguna</h1>
          <p className={styles.subtitle}>Kelola hak akses dan data seluruh pengguna platform.</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Memuat data pengguna...</p>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Pengguna</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td className={styles.userName}>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>
                          {/* Sesuai dengan string 'admin' atau 'user' dari to_dict() */}
                          <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className={styles.actionButtons}>
                          <button 
                            className={styles.btnToggle}
                            onClick={() => toggleRole(user)}
                            title="Tukar Role User/Admin"
                          >
                            Tukar Role
                          </button>
                          <button 
                            className={styles.btnDelete}
                            onClick={() => handleDelete(user.id)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.emptyRow}>
                        Tidak ada data pengguna ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;