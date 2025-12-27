import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Konfigurasi Flask-SQLAlchemy
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Kunci rahasia untuk keamanan sesi
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'kunci-rahasia-yang-kuat-sekali'