import os
from flask import Flask
from flask_cors import CORS
from models import db, migrate
from routes import bp as api_bp

def create_app():
    # Menggunakan path absolut agar folder static ditemukan dengan benar
    base_dir = os.path.abspath(os.path.dirname(__file__))
    static_dir = os.path.join(base_dir, 'static')

    app = Flask(__name__, static_url_path='/static', static_folder=static_dir)

    # 1. Pastikan database heritedge_v2 sudah dibuat di MySQL/XAMPP
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/heritedge_v2'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'rahasia-dapur'
    app.config['UPLOAD_FOLDER'] = static_dir

    db.init_app(app)
    migrate.init_app(app, db)

    # 2. PERBAIKAN CORS (PENTING)
    # Tambahkan support_credentials agar koneksi dari emulator tidak diputus tiba-tiba
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    app.register_blueprint(api_bp)

    with app.app_context():
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    # 3. debug=True tetap aktif, host 0.0.0.0 agar bisa diakses emulator
    app.run(debug=True, host='0.0.0.0', port=5000)