from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os 
from datetime import datetime
from models import db, User, ForumPost, ForumReply, Article, Catalog, Quiz

# ==============================================================================
# 🛠️ KONFIGURASI FILE UPLOAD
# ==============================================================================
UPLOAD_FOLDER = 'static' 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
 """Mengecek apakah ekstensi file diizinkan."""
 return '.' in filename and \
  filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

bp = Blueprint('api', __name__, url_prefix='/api')

## ==========================
## 👤 API USERS
## ==========================

@bp.route('/users', methods=['GET'])
def get_users():
 users = User.query.all()
 return jsonify([u.to_dict() for u in users])

@bp.route('/users/<int:id>', methods=['PUT'])
def update_profile(id):
    user = User.query.get_or_404(id)
    
    # Ambil data dari React (FormData)
    # React mengirimkan 'name', kita simpan ke kolom 'full_name'
    new_name = request.form.get('name')
    new_phone = request.form.get('phone')
    new_bio = request.form.get('bio')

    if new_name: user.full_name = new_name
    if new_phone: user.phone = new_phone
    if new_bio: user.bio = new_bio
    
    file = request.files.get('avatar')
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"user_{id}_{int(datetime.utcnow().timestamp())}_{filename}"
        
        # Pastikan folder static ada
        if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
            os.makedirs(current_app.config['UPLOAD_FOLDER'])
            
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
        file.save(upload_path)
        user.avatar = f"static/{unique_name}"

    try:
        db.session.commit()
        # Debugging: Cetak ke terminal Flask untuk memastikan data masuk
        print(f"User {id} updated: {user.full_name}, {user.phone}") 
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Update Error: {str(e)}") # Cek error ini di terminal hitam (CMD)
        return jsonify({"error": str(e)}), 500
    
    # Tambahkan di routes.py

# DELETE USER
@bp.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User berhasil dihapus"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# UPDATE USER ROLE & DATA (Admin Side)
@bp.route('/users/<int:id>/admin-update', methods=['PUT'])
def admin_update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()

    if 'full_name' in data: user.full_name = data['full_name']
    if 'email' in data: user.email = data['email']
    if 'role' in data: 
        # PERBAIKAN: Pastikan UserRole diimport dengan benar
        from models import UserRole 
        # Cek apakah string yang dikirim 'admin' atau 'user'
        user.role = UserRole.ADMIN if data['role'] == 'admin' else UserRole.USER

    try:
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/register', methods=['POST'])
def register():
 data = request.get_json() or {} 
 if not data.get('email') or not data.get('password') or not data.get('full_name'):
  return jsonify({"error": "Semua kolom wajib diisi."}), 400 
 if User.query.filter_by(email=data['email']).first():
  return jsonify({"error": "Email sudah terdaftar. Silakan masuk."}), 400
 
 try:
  new_user = User(
   email=data['email'],
   full_name=data['full_name']
  )
  new_user.set_password(data['password'])
  db.session.add(new_user)
  db.session.commit()
  return jsonify(new_user.to_dict()), 201
 except Exception as e:
  db.session.rollback()
  return jsonify({"error": str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
 data = request.get_json() or {}
 user = User.query.filter_by(email=data.get('email')).first()
 if user and user.check_password(data.get('password')):
  return jsonify({
   "message": "Login berhasil",
   "user": user.to_dict()
  }), 200
 return jsonify({"error": "Email atau password salah."}), 401

## ==========================
## 🏛️ API CATALOGS (PENTING UNTUK GAMBAR)
## ==========================

@bp.route('/catalogs', methods=['GET'])
def get_catalogs():
 """Mengambil semua data katalog."""
 items = Catalog.query.all()
 return jsonify([i.to_dict() for i in items]), 200

@bp.route('/catalogs/<int:id>', methods=['GET'])
def get_catalog_detail(id):
 """Mengambil detail satu katalog berdasarkan ID."""
 item = Catalog.query.get_or_404(id)
 # Memastikan to_dict() dipanggil untuk konversi JSON
 return jsonify(item.to_dict()), 200

@bp.route('/catalogs', methods=['POST'])
def create_catalog():
    # Ambil dari request.form, bukan get_json
    title = request.form.get('title')
    category = request.form.get('category')
    description = request.form.get('description')
    file = request.files.get('image')

    image_path = ""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"cat_{int(datetime.utcnow().timestamp())}_{filename}"
        
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
            
        file.save(os.path.join(UPLOAD_FOLDER, unique_name))
        image_path = f"static/{unique_name}"

    try:
        new_item = Catalog(
            title=title,
            category=category,
            description=description,
            image=image_path # Sekarang hanya menyimpan PATH (misal: static/cat_123.jpg)
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/catalogs/<int:id>', methods=['PUT'])
def update_catalog(id):
    catalog = Catalog.query.get_or_404(id)
    
    # Ambil data dari form (FormData), bukan get_json()
    title = request.form.get('title')
    category = request.form.get('category')
    description = request.form.get('description')
    file = request.files.get('image')

    if title: catalog.title = title
    if category: catalog.category = category
    if description: catalog.description = description

    # Logika jika ada file gambar baru yang diunggah
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"cat_{int(datetime.utcnow().timestamp())}_{filename}"
        
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
            
        file.save(os.path.join(UPLOAD_FOLDER, unique_name))
        catalog.image = f"static/{unique_name}"

    try:
        db.session.commit()
        return jsonify(catalog.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@bp.route('/catalogs/<int:id>', methods=['DELETE'])
def delete_catalog(id):
    catalog = Catalog.query.get_or_404(id)
    try:
        db.session.delete(catalog)
        db.session.commit()
        return jsonify({"message": "Katalog berhasil dihapus"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
## ==========================
## 📰 API ARTICLES
## ==========================


@bp.route('/articles', methods=['GET'])
def get_articles():
    articles = Article.query.order_by(Article.created_at.desc()).all()
    return jsonify([a.to_dict() for a in articles]), 200

@bp.route('/articles/<int:id>', methods=['GET'])
def get_article_detail(id):
    # Mengambil satu artikel berdasarkan ID atau kirim 404 jika tidak ada
    article = Article.query.get_or_404(id)
    return jsonify(article.to_dict()), 200

@bp.route('/articles', methods=['POST'])
def create_article():
    # Menggunakan request.form karena ada upload file (multipart/form-data)
    title = request.form.get('title')
    excerpt = request.form.get('excerpt')
    content = request.form.get('content')
    is_featured = request.form.get('is_featured') == 'true'
    file = request.files.get('image')

    if not title or not content:
        return jsonify({"error": "Judul dan isi wajib diisi"}), 400

    image_path = "static/default_article.jpg"
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"art_{int(datetime.utcnow().timestamp())}_{filename}"
        file.save(os.path.join(UPLOAD_FOLDER, unique_name))
        image_path = f"static/{unique_name}"

    try:
        new_article = Article(
            title=title,
            image=image_path,
            excerpt=excerpt,
            content=content,
            is_featured=is_featured
        )
        db.session.add(new_article)
        db.session.commit()
        return jsonify(new_article.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/articles/<int:id>', methods=['PUT'])
def update_article(id):
    article = Article.query.get_or_404(id)
    # Gunakan request.form karena kemungkinan ada upload file baru
    title = request.form.get('title')
    excerpt = request.form.get('excerpt')
    content = request.form.get('content')
    is_featured = request.form.get('is_featured') == 'true'
    file = request.files.get('image')

    if title: article.title = title
    if excerpt: article.excerpt = excerpt
    if content: article.content = content
    article.is_featured = is_featured

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"art_{int(datetime.utcnow().timestamp())}_{filename}"
        file.save(os.path.join(UPLOAD_FOLDER, unique_name))
        article.image = f"static/{unique_name}"

    try:
        db.session.commit()
        return jsonify(article.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bp.route('/articles/<int:id>', methods=['DELETE'])
def delete_article(id):
    article = Article.query.get_or_404(id)
    try:
        # Opsional: Hapus file fisik di folder static jika perlu
        # if os.path.exists(article.image): os.remove(article.image)
        db.session.delete(article)
        db.session.commit()
        return jsonify({"message": "Artikel berhasil dihapus"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

## ==========================
## 💬 API FORUM
## ==========================

@bp.route('/posts', methods=['GET'])
def list_posts():
 posts = ForumPost.query.order_by(ForumPost.created_at.desc()).all()
 return jsonify([p.to_dict() for p in posts])

@bp.route('/posts', methods=['POST'])
def create_post():
 data = request.get_json() or {}
 if not data.get('title') or not data.get('content') or not data.get('author_id'):
  return jsonify({"error": "missing fields"}), 400
 post = ForumPost(title=data['title'], content=data['content'], author_id=data['author_id'])
 db.session.add(post)
 db.session.commit()
 return jsonify(post.to_dict()), 201

@bp.route('/posts/<int:post_id>/replies', methods=['GET', 'POST'])
def post_replies(post_id):
 if request.method == 'GET':
  replies = ForumReply.query.filter_by(post_id=post_id).order_by(ForumReply.created_at).all()
  return jsonify([r.to_dict() for r in replies])
 
 data = request.get_json() or {}
 if not data.get('content') or not data.get('author_id'):
  return jsonify({"error": "missing fields"}), 400
 
 reply = ForumReply(content=data['content'], post_id=post_id, author_id=data['author_id'])
 db.session.add(reply)
 db.session.commit()
 return jsonify(reply.to_dict()), 201

@bp.route('/posts/<int:id>', methods=['DELETE'])
def delete_post(id):
 post = ForumPost.query.get(id)
 if not post:
  return jsonify({"error": "Postingan tidak ditemukan"}), 404

 try:
  ForumReply.query.filter_by(post_id=id).delete()
  db.session.delete(post)
  db.session.commit()
  return jsonify({"message": "Postingan dan komentar berhasil dihapus"}), 200
  
 except Exception as e:
  db.session.rollback()
  print(f"Error saat menghapus: {e}") 
  return jsonify({"error": str(e)}), 500



## ==========================
## 🎮 API QUIZ
## ==========================

# 1. AMBIL SEMUA SOAL (GET)
@bp.route('/quiz', methods=['GET'])
def get_quiz_questions():
    try:
        quizzes = Quiz.query.all()
        return jsonify([q.to_dict() for q in quizzes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. TAMBAH SOAL BARU (POST)
@bp.route('/quiz', methods=['POST'])
def create_quiz():
    data = request.get_json() or {}
    required_fields = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
    
    if not all(k in data and data[k] for k in required_fields):
        return jsonify({"error": "Semua kolom wajib diisi"}), 400
        
    try:
        new_quiz = Quiz(
            question=data.get('question'),
            option_a=data.get('option_a'),
            option_b=data.get('option_b'),
            option_c=data.get('option_c'),
            option_d=data.get('option_d'),
            correct_answer=data.get('correct_answer')
        )
        db.session.add(new_quiz)
        db.session.commit()
        return jsonify(new_quiz.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Gagal menyimpan: {str(e)}"}), 500

# 3. EDIT/UPDATE SOAL (PUT) - INI YANG ANDA BUTUHKAN
@bp.route('/quiz/<int:id>', methods=['PUT'])
def update_quiz(id):
    # Cari soal berdasarkan ID, jika tidak ada kirim error 404
    quiz = Quiz.query.get_or_404(id)
    data = request.get_json() or {}

    try:
        # Update data hanya jika field tersebut dikirim dari frontend
        if 'question' in data: quiz.question = data['question']
        if 'option_a' in data: quiz.option_a = data['option_a']
        if 'option_b' in data: quiz.option_b = data['option_b']
        if 'option_c' in data: quiz.option_c = data['option_c']
        if 'option_d' in data: quiz.option_d = data['option_d']
        if 'correct_answer' in data: quiz.correct_answer = data['correct_answer']

        db.session.commit()
        return jsonify({
            "message": "Soal berhasil diperbarui",
            "quiz": quiz.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Gagal memperbarui data: {str(e)}"}), 500

# 4. HAPUS SOAL (DELETE)
@bp.route('/quiz/<int:id>', methods=['DELETE'])
def delete_quiz(id):
    quiz = Quiz.query.get_or_404(id)
    try:
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"message": "Soal berhasil dihapus"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
 
 
