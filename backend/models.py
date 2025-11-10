from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# 1. 앱에 연결되지 않은 비어있는 확장(extension) 객체를 생성합니다.
db = SQLAlchemy()
bcrypt = Bcrypt()

# 2. User 모델 정의를 app.py에서 이곳으로 옮겨옵니다.
#    이 모델은 이제 db 객체를 통해 SQLAlchemy 기능에 접근합니다.
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)