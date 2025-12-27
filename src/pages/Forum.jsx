import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import styles from './Forum.module.css';
import { 
  BsHouseDoor, BsCompass, BsChatText, 
  BsSearch, BsSend, BsBoxArrowRight 
} from 'react-icons/bs';

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData); 
      fetchPosts(); 
    } else {
      navigate('/login'); 
    }
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/posts');
      if (!response.ok) throw new Error('Gagal mengambil data diskusi');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostTitle.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          title: newPostTitle,
          content: newPostContent
        }),
      });

      if (response.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        setSuccessMessage('Diskusi berhasil dipublikasikan!');
        fetchPosts();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal membuat postingan');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReplySubmit = async (postId) => {
    const content = replyContent[postId];
    if (!content || !content.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          content: content
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReplyContent(prev => ({ ...prev, [postId]: '' }));
        setSuccessMessage('Balasan terkirim!');
        fetchPosts();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Gagal mengirim balasan');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading && posts.length === 0) return <div className={styles.loading}>Memuat diskusi...</div>;

  return (
    <div className={styles.forumLayout}>
      {/* SIDEBAR KIRI - Tanpa Logo HeritEdge */}
      <aside className={styles.sidebarLeft}>
        <div className={styles.stickyNav}>
          <nav className={styles.mainNav}>
            <Link to="/" className={styles.navItem}><BsHouseDoor /> <span>Beranda</span></Link>
            <Link to="/katalog" className={styles.navItem}><BsCompass /> <span>Eksplorasi</span></Link>
            <Link to="/forum" className={`${styles.navItem} ${styles.active}`}><BsChatText /> <span>Forum</span></Link>
          </nav>
          <button onClick={handleLogout} className={styles.logoutBtn}><BsBoxArrowRight /> <span>Keluar</span></button>
        </div>
      </aside>

      {/* KONTEN TENAH */}
      <main className={styles.feed}>
        <header className={styles.feedHeader}><h2>Forum Budaya</h2></header>

        {successMessage && <div className={styles.toastSuccess}>{successMessage}</div>}
        {error && <div className={styles.toastError}>{error}</div>}

        <div className={styles.createPostCard}>
          <input 
            type="text" placeholder="Judul Diskusi..." className={styles.titleInput}
            value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <textarea 
            placeholder="Apa yang ingin Anda diskusikan?"
            value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className={styles.postActions}>
            <button onClick={handlePostSubmit} className={styles.postBtn}>Kirim Postingan</button>
          </div>
        </div>

        <div className={styles.postsList}>
          {posts.map(post => (
            <article key={post.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div className={styles.authorMeta}>
                  <span className={styles.authorName}>{post.author?.full_name || 'User'}</span>
                  <small className={styles.postDate}>{post.date}</small>
                </div>
              </div>
              <div className={styles.postContent}>
                <h3 className={styles.postTitleText}>{post.title}</h3>
                <p>{post.postBodyText || post.content}</p>
              </div>

              <div className={styles.repliesSection}>
                <div className={styles.repliesList}>
                  {post.replies?.map(reply => (
                    <div key={reply.id} className={styles.replyItem}>
                      <strong>{reply.author?.full_name}</strong>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.replyInputWrapper}>
                  <input 
                    type="text" placeholder="Tulis balasan..." 
                    value={replyContent[post.id] || ''} 
                    onChange={(e) => setReplyContent({...replyContent, [post.id]: e.target.value})}
                  />
                  <button onClick={() => handleReplySubmit(post.id)} className={styles.replySendBtn}><BsSend /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <aside className={styles.sidebarRight}>
        <div className={styles.searchBar}><BsSearch /><input type="text" placeholder="Cari..." /></div>
      </aside>
    </div>
  );
};

export default Forum;