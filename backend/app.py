import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from LLM_part.LLM import LLMProcessor
import sqlite3
import math
from models import db, bcrypt, User
from flask_jwt_extended import JWTManager
import secrets
from auth import auth_bp
# --- 1. 환경 변수 로드 ---
load_dotenv()

# --- 2. Flask 앱 및 LLM 초기화 ---
app = Flask(__name__)

# ⬇️ CORS 설정 (Authorization 헤더 허용)
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Authorization", "Content-Type"],
     expose_headers=["Authorization"])

# ⬇️ 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'animalloo_en_db.sqlite')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ⬇️ JWT 설정 (중요!)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # 헤더에서만 토큰 받기
app.config['JWT_HEADER_NAME'] = 'Authorization'  # Authorization 헤더 사용
app.config['JWT_HEADER_TYPE'] = 'Bearer'  # Bearer 타입
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1시간 (초 단위)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # CSRF 보호 비활성화 (개발 환경)

# ⬇️ 확장 객체 초기화
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Gemini API 키를 환경 변수에서 가져옵니다.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
    llm_processor = LLMProcessor(api_key="SIMULATED_KEY")
else:
    llm_processor = LLMProcessor(api_key=GEMINI_API_KEY)

def get_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # 지구 반지름 (km)
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def query_sqlite_db(user_lat: float, user_lon: float, params: dict) -> list:
    """
    (Req 2) 사용자 위치(lat/lon)와 LLM 파라미터 기반으로 SQLite DB 검색
    """
    print(f"[DB 쿼리] 입력: lat={user_lat}, lon={user_lon}, params={params}")
    DB_PATH = '../animalloo_en_db.sqlite'
    llm_categories = params.get("categories", [])
    text_filter = params.get("text_filter")
    search_radius_km = params.get("search_radius_km", 3.0)
    conn = None
    results = []
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        query = "SELECT * FROM facilities WHERE 1=1"
        query_params = []
        
        if len(llm_categories) > 0:
            placeholders = ', '.join('?' for _ in llm_categories)
            query += f" AND category IN ({placeholders})"
            query_params.extend(llm_categories)
        
        if text_filter:
            query += " AND (name LIKE ? OR description LIKE ?)"
            query_params.extend([f"%{text_filter}%", f"%{text_filter}%"])
        
        cursor.execute(query, query_params)
        potential_facilities = cursor.fetchall()
        print(f"[DB 쿼리] 1차 필터링 결과: {len(potential_facilities)}개")
        
        for row in potential_facilities:
            facility = dict(row)
            fac_lat = facility.get('Latitude')
            fac_lon = facility.get('Longitude')
            if fac_lat is None or fac_lon is None:
                continue
            
            try:
                distance = get_haversine_distance(user_lat, user_lon, float(fac_lat), float(fac_lon))
            except (ValueError, TypeError):
                print(f"[DB 경고] 좌표 변환 실패: lat={fac_lat}, lon={fac_lon}")
                continue
            
            if distance <= search_radius_km:
                facility['distance_km'] = round(distance, 2)
                results.append(facility)
    
    except sqlite3.Error as e:
        print(f"[DB 오류] SQLite 오류: {e}")
        raise e
    finally:
        if conn:
            conn.close()
    
    print(f"[DB 쿼리] 최종 {len(results)}개 시설 반환 (반경: {search_radius_km}km)")
    return sorted(results, key=lambda x: x['distance_km'])

def query_db_by_district(district: str, categories: list) -> list:
    """
    (Req 3) '구' 이름과 카테고리 목록으로 DB를 검색합니다.
    """
    print(f"[DB 필터] 입력: district={district}, categories={categories}")
    DB_PATH = '../animalloo_en_db.sqlite'
    conn = None
    results = []
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        query = "SELECT * FROM facilities WHERE district = ?"
        query_params = [district]
        
        if len(categories) > 0:
            placeholders = ', '.join('?' for _ in categories)
            query += f" AND category IN ({placeholders})"
            query_params.extend(categories)
        
        cursor.execute(query, query_params)
        rows = cursor.fetchall()
        results = [dict(row) for row in rows]
    
    except sqlite3.Error as e:
        print(f"[DB 오류] SQLite 오류: {e}")
        raise e
    finally:
        if conn:
            conn.close()
    
    print(f"[DB 필터] 최종 {len(results)}개 시설 반환")
    return results

def query_all_districts() -> list:
    """
    DB에서 'districts' 테이블의 모든 '구' 목록을 가져옵니다.
    """
    print(f"[DB 필터] 'districts' 테이블 전체 조회")
    DB_PATH = '../animalloo_en_db.sqlite'
    conn = None
    results = []
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        query = "SELECT * FROM districts ORDER BY name"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        for row in rows:
            district_dict = dict(row)
            try:
                if district_dict.get('Latitude') is not None:
                    district_dict['Latitude'] = float(district_dict['Latitude'])
                if district_dict.get('Longitude') is not None:
                    district_dict['Longitude'] = float(district_dict['Longitude'])
            except (ValueError, TypeError):
                print(f"[DB 경고] 'districts' 좌표 변환 실패: {district_dict.get('name')}")
                district_dict['Latitude'] = None
                district_dict['Longitude'] = None
            results.append(district_dict)
    
    except sqlite3.Error as e:
        print(f"[DB 오류] (districts) SQLite 오류: {e}")
        raise e
    finally:
        if conn:
            conn.close()
    
    print(f"[DB 필터] 최종 {len(results)}개 '구' 반환")
    return results

# ⬇️ Blueprint 등록 (auth_bp)
app.register_blueprint(auth_bp)

# --- 4. API 엔드포인트 정의 ---
@app.route('/api/search', methods=['POST'])
def handle_search():
    data = request.json
    query = data.get('query')
    lat = data.get('lat')
    lon = data.get('lon')
    
    if not query or lat is None or lon is None:
        return jsonify({"error": "필수 정보(query, lat, lon)가 누락되었습니다."}), 400
    
    print(f"\n[API 요청 수신] 쿼리: '{query}', 위치: ({lat}, {lon})")
    
    try:
        search_params = llm_processor.get_search_parameters(query)
        print(f"[LLM 분석 완료] 파라미터: {search_params}")
    except Exception as e:
        print(f"[LLM 오류] {e}")
        return jsonify({"error": f"LLM 분석 중 오류 발생: {e}"}), 500
    
    try:
        facilities = query_sqlite_db(lat, lon, search_params)
        return jsonify(facilities)
    except Exception as e:
        print(f"[DB 오류] {e}")
        return jsonify({"error": f"데이터 검색 중 오류 발생: {e}"}), 500

@app.route('/api/filter', methods=['POST'])
def handle_filter():
    """
    (Req 3) MapSection '필터링' API ('구' 기반)
    """
    data = request.json
    district = data.get('district')
    categories = data.get('categories', [])
    
    if not district:
        return jsonify({"error": "필수 정보(district)가 누락되었습니다."}), 400
    
    try:
        facilities = query_db_by_district(district, categories)
        return jsonify(facilities)
    except Exception as e:
        print(f"[DB 오류] {e}")
        return jsonify({"error": f"데이터 검색 중 오류 발생: {e}"}), 500

@app.route('/api/districts', methods=['GET'])
def handle_districts():
    """
    프론트엔드 필터에 사용할 '구' 목록 전체를 반환합니다.
    """
    try:
        districts = query_all_districts()
        return jsonify(districts)
    except Exception as e:
        print(f"[DB 오류] {e}")
        return jsonify({"error": f"데이터 검색 중 오류 발생: {e}"}), 500

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)
# --- 5. 서버 실행 ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("Animalloo 백엔드 서버를 시작합니다...")
    app.run(host='0.0.0.0', port=5001, debug=True)
