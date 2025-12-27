import enum 
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
migrate = Migrate()

# 2. DEFINISIKAN PILIHAN ROLE (ENUM)
class UserRole(enum.Enum):
 USER = "user"
 ADMIN = "admin"

class User(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 full_name = db.Column(db.String(100), nullable=False)
 email = db.Column(db.String(120), unique=True, nullable=False)
 password_hash = db.Column(db.String(256), nullable=False) 
 created_at = db.Column(db.DateTime, default=datetime.utcnow)
 
 phone = db.Column(db.String(20), nullable=True) 
 bio = db.Column(db.Text, nullable=True)
 avatar = db.Column(db.String(255), nullable=True)

 # Kolom Role
 role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)

 # Relasi
 forum_posts = db.relationship('ForumPost', backref='author', lazy=True, cascade="all, delete-orphan")
 forum_replies = db.relationship('ForumReply', backref='author', lazy=True, cascade="all, delete-orphan")

 def set_password(self, password):
  self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

 def check_password(self, password):
  return check_password_hash(self.password_hash, password)

 def to_dict(self):
  return {
   "id": self.id, 
   "full_name": self.full_name, 
   "email": self.email,
   "phone": self.phone,
   "bio": self.bio,
   "avatar": self.avatar,
   "role": self.role.value 
  }

class ForumPost(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 title = db.Column(db.String(200), nullable=False)
 content = db.Column(db.Text, nullable=False)
 author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
 created_at = db.Column(db.DateTime, default=datetime.utcnow)

 # Relasi replies
 replies = db.relationship('ForumReply', backref='post', lazy=True, cascade='all, delete-orphan')

 def to_dict(self):
  return {
   "id": self.id,
   "title": self.title,
   "content": self.content,
   "author_id": self.author_id,
   "created_at": self.created_at.isoformat(),
   "author": {
    "id": self.author.id,
    "full_name": self.author.full_name
   },
   "replies": [r.to_dict() for r in self.replies]
  }

class ForumReply(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 content = db.Column(db.Text, nullable=False)
 post_id = db.Column(db.Integer, db.ForeignKey('forum_post.id'), nullable=False)
 author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
 created_at = db.Column(db.DateTime, default=datetime.utcnow)

 def to_dict(self):
  return {
   "id": self.id,
   "content": self.content,
   "post_id": self.post_id,
   "author_id": self.author_id,
   "created_at": self.created_at.isoformat(),
   "author": {
    "id": self.author.id,
    "full_name": self.author.full_name
   }
  }

class Article(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 title = db.Column(db.String(200), nullable=False)
 image = db.Column(db.Text, nullable=False) 
 excerpt = db.Column(db.String(500), nullable=False) 
 content = db.Column(db.Text, nullable=False) 
 is_featured = db.Column(db.Boolean, default=False)
 created_at = db.Column(db.DateTime, default=datetime.utcnow)

 def to_dict(self):
  return {
   "id": self.id,
   "title": self.title,
   "image": self.image,
   "excerpt": self.excerpt,
   "content": self.content,
   "is_featured": self.is_featured,
   "date": self.created_at.strftime("%d %B %Y") 
  }

# --- [BARU] TABEL KATALOG ---
class Catalog(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 title = db.Column(db.String(200), nullable=False)
 category = db.Column(db.String(100), nullable=False) # Misal: Rumah Adat, Tari
 image = db.Column(db.Text, nullable=False)
 description = db.Column(db.Text, nullable=False)
 created_at = db.Column(db.DateTime, default=datetime.utcnow)

 def to_dict(self):
  return {
   "id": self.id,
   "title": self.title,
   "category": self.category,
   "image": self.image,
   "description": self.description,
   "date": self.created_at.strftime("%d %B %Y")
  }

class Quiz(db.Model):
 __tablename__ = "quizzes"

 id = db.Column(db.Integer, primary_key=True)
 question = db.Column(db.Text, nullable=False)

 option_a = db.Column(db.String(255), nullable=False)
 option_b = db.Column(db.String(255), nullable=False)
 option_c = db.Column(db.String(255), nullable=False)
 option_d = db.Column(db.String(255), nullable=False)

 correct_answer = db.Column(db.String(255), nullable=False)
 created_at = db.Column(db.DateTime, default=datetime.utcnow)

 def to_dict(self):
  return {
   "id": self.id,
   "question": self.question,
   "option_a": self.option_a,
   "option_b": self.option_b,
   "option_c": self.option_c,
   "option_d": self.option_d,
   "correct_answer": self.correct_answer,
   "created_at": self.created_at.isoformat() if self.created_at else None
  }



