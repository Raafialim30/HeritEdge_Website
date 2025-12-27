# ...existing code...
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = "change-this-to-a-strong-secret"
    # DB otomatis dibuat di folder Flask_uas dengan nama app.db (tidak lagi database.db)
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/heritedge_v2'
    # Format: mysql+pymysql://username:password@host/nama_database
    SQLALCHEMY_TRACK_MODIFICATIONS = False