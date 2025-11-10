from flask import Blueprint, request, jsonify
# [수정] app.py 대신 models.py에서 확장 객체와 모델을 가져옵니다.
from models import db, bcrypt, User 
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# 'auth'라는 이름의 Blueprint를 생성합니다.
auth_bp = Blueprint('auth', __name__, url_prefix='/api')


# --- 회원가입 API ---
@auth_bp.route('/register', methods=['POST'])
def register():
    # [수정] 함수 내부에 있던 import 구문은 이제 필요 없으므로 삭제합니다.
    
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "아이디와 비밀번호가 필요합니다."}), 400

    # 이제 db와 User가 전역에서 올바르게 임포트되었으므로 정상 작동합니다.
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "이미 존재하는 아이디입니다."}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(username=username, password_hash=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "회원가입 성공"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"[DB 오류] 회원가입 실패: {e}")
        return jsonify({"error": "서버 오류로 회원가입에 실패했습니다."}), 500

# --- 로그인 API ---
@auth_bp.route('/login', methods=['POST'])
def login():
    # [수정] 함수 내부에 있던 import 구문은 이제 필요 없으므로 삭제합니다.
    
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "아이디와 비밀번호가 필요합니다."}), 400

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "아이디 또는 비밀번호가 잘못되었습니다."}), 401

# --- (예시) 보호된 API ---
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # [수정] 함수 내부에 있던 import 구문은 이제 필요 없으므로 삭제합니다.
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.username), 200