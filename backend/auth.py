from flask import Blueprint, request, jsonify
from models import db, bcrypt, User
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    verify_jwt_in_request
)
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

# 'auth'라는 이름의 Blueprint를 생성합니다.
auth_bp = Blueprint('auth', __name__, url_prefix='/api')


# --- 회원가입 API ---
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "아이디와 비밀번호가 필요합니다."}), 400

    # 이미 존재하는 사용자인지 확인
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "이미 존재하는 아이디입니다."}), 409

    # 비밀번호 해싱
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
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "아이디와 비밀번호가 필요합니다."}), 400

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        # JWT 토큰 생성 (user.id를 문자열로 변환!)
        access_token = create_access_token(identity=str(user.id))  # ⬅️ str() 추가!
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "아이디 또는 비밀번호가 잘못되었습니다."}), 401


# --- 보호된 API (마이페이지용) ---
@auth_bp.route('/protected', methods=['GET'])
def protected():
    print("=" * 50)
    print("🔑 받은 Authorization 헤더:", request.headers.get("Authorization"))
    print("🔑 모든 헤더:", dict(request.headers))
    
    try:
        # JWT 토큰 검증 시도
        verify_jwt_in_request()
        
        current_user_id = get_jwt_identity()  # 문자열로 반환됨
        print("✅ JWT 검증 성공! 사용자 ID:", current_user_id)
        
        # 문자열을 정수로 변환해서 DB 조회
        user = User.query.get(int(current_user_id))  # ⬅️ int() 추가!
        if not user:
            print("❌ 사용자를 DB에서 찾을 수 없음")
            return jsonify({"error": "사용자를 찾을 수 없습니다"}), 404
            
        print("✅ 사용자 찾음:", user.username)
        return jsonify(logged_in_as=user.username), 200
        
    except ExpiredSignatureError:
        print("❌ 토큰 만료")
        return jsonify({"error": "토큰이 만료되었습니다"}), 401
    except InvalidTokenError as e:
        print(f"❌ 유효하지 않은 토큰: {e}")
        return jsonify({"error": "유효하지 않은 토큰입니다"}), 422
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        return jsonify({"error": str(e)}), 500
