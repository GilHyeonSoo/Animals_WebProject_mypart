from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)  # 로그인 ID (변경 불가)
    password_hash = db.Column(db.String(200), nullable=False)
    
    nickname = db.Column(db.String(100), nullable=True)  # ⬅️ 새로 추가! 닉네임 (변경 가능)
    profile_url = db.Column(db.String(500), nullable=True)
    favorite_hospitals = db.Column(db.JSON, nullable=True)
    
    def __repr__(self):
        return f'<User {self.username}>'