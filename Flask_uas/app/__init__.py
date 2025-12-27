# ...existing code...
from flask import Flask
from config import Config
from .extensions import db, migrate, cors

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(config_class)

    # inisialisasi ekstensi
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # pastikan models dimuat supaya flask-migrate/ Alembic tahu skema
    with app.app_context():
        from . import models  # noqa: F401

    # register blueprint jika ada routes.bp
    try:
        from .routes import bp
        app.register_blueprint(bp)
    except Exception:
        pass

    return app