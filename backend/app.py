import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from LLM_part.LLM import LLMProcessor
import sqlite3  # <-- 1. SQLite3 라이브러리 추가
import math     # <-- 2. 거리 계산을 위한 math 라이브러리 추가

from models import db, bcrypt, User
from flask_jwt_extended import JWTManager
import secrets
from auth import auth_bp
# --- 1. 환경 변수 로드 ---
# .env 파일에서 환경 변수(예: GEMINI_API_KEY)를 불러옵니다.
load_dotenv()

# --- 2. Flask 앱 및 LLM 초기화 ---
app = Flask(__name__)
# React 개발 서버(localhost:3000)에서의 요청을 허용합니다.
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "allow_headers": ["Authorization", "Content-Type"] # <-- 이 줄 추가
}})

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'animalloo_en_db.sqlite')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Gemini API 키를 환경 변수에서 가져옵니다.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
    llm_processor = LLMProcessor(api_key="SIMULATED_KEY")
else:
    # 실제 API 키로 LLM 프로세서 초기화
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

# (신규) DB 쿼리 및 거리 필터링 함수
def query_sqlite_db(user_lat: float, user_lon: float, params: dict) -> list:
    """
    (Req 2) 사용자 위치(lat/lon)와 LLM 파라미터 기반으로 SQLite DB 검색
    """
    print(f"[DB 쿼리] 입력: lat={user_lat}, lon={user_lon}, params={params}")
    
    DB_PATH = '../animalloo_en_db.sqlite'
    
    llm_categories = params.get("categories", [])
    text_filter = params.get("text_filter")
    
    # [수정됨] LLM이 정해준 값(1km)을 사용하고, 없으면 기본 1km
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
            
            # [수정됨] DB의 대문자 컬럼명 사용
            fac_lat = facility.get('Latitude')
            fac_lon = facility.get('Longitude')
            
            if fac_lat is None or fac_lon is None:
                continue
                
            # [수정됨] DB 좌표값이 문자열(str)일 경우 숫자로 변환
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

        # 카테고리 필터가 있으면 추가
        if len(categories) > 0:
            placeholders = ', '.join('?' for _ in categories)
            query += f" AND category IN ({placeholders})"
            query_params.extend(categories)

        cursor.execute(query, query_params)
        rows = cursor.fetchall()
        
        # [수정됨] 거리 계산이 필요 없으므로 바로 dict로 변환
        results = [dict(row) for row in rows]

    except sqlite3.Error as e:
        print(f"[DB 오류] SQLite 오류: {e}")
        raise e
    finally:
        if conn:
            conn.close()

    print(f"[DB 필터] 최종 {len(results)}개 시설 반환")
    return results
# --- 3. (시뮬레이션) DB 검색 함수 ---
# "미완성 데이터베이스"를 대신할 가상 데이터베이스 검색 함수입니다.
# PostGIS의 ST_DWithin (거리 기반) 쿼리를 시뮬레이션합니다.
def simulate_db_proximity_search(lat: float, lon: float, params: dict) -> list:
    # ... (이 함수는 이제 사용되지 않지만, 비교를 위해 남겨둘 수 있습니다) ...
    pass #

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
        
        # [수정] 좌표를 숫자로 변환하며 딕셔너리 수동 생성
        for row in rows:
            district_dict = dict(row)
            try:
                # 'Latitude'와 'Longitude'가 null이 아닐 때 float으로 변환
                if district_dict.get('Latitude') is not None:
                    district_dict['Latitude'] = float(district_dict['Latitude'])
                
                if district_dict.get('Longitude') is not None:
                    district_dict['Longitude'] = float(district_dict['Longitude'])
                    
            except (ValueError, TypeError):
                # 좌표가 있지만 float 변환에 실패한 경우
                print(f"[DB 경고] 'districts' 좌표 변환 실패: {district_dict.get('name')}")
                district_dict['Latitude'] = None # 프론트엔드에서 실패하도록 None 처리
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

app.register_blueprint(auth_bp)

# --- 4. API 엔드포인트 정의 ---
@app.route('/api/search', methods=['POST'])
def handle_search():
    # ... (1. 데이터 수신 코드는 동일) ...
    data = request.json
    query = data.get('query')
    lat = data.get('lat')
    lon = data.get('lon')

    if not query or lat is None or lon is None:
        return jsonify({"error": "필수 정보(query, lat, lon)가 누락되었습니다."}), 400

    print(f"\n[API 요청 수신] 쿼리: '{query}', 위치: ({lat}, {lon})")

    # ... (2. LLM 분석 코드는 동일) ...
    try:
        search_params = llm_processor.get_search_parameters(query)
        print(f"[LLM 분석 완료] 파라미터: {search_params}")
    except Exception as e:
        print(f"[LLM 오류] {e}")
        return jsonify({"error": f"LLM 분석 중 오류 발생: {e}"}), 500

    # 3. LLM 분석 결과 + 위치 정보로 (실제) DB 검색
    try:
        # (수정) 시뮬레이션 함수 대신 실제 DB 쿼리 함수 호출
        facilities = query_sqlite_db(lat, lon, search_params) # <-- 5. 함수 교체
        
        # 4. 프론트엔드(MapSection)에 마커로 표시할 데이터 반환
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
    categories = data.get('categories', []) # 기본값 빈 리스트

    if not district:
        return jsonify({"error": "필수 정보(district)가 누락되었습니다."}), 400

    try:
        # '구' 기반 필터링 함수 호출
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



# --- 5. 서버 실행 ---
if __name__ == '__main__':
    # [수정] import와 blueprint 등록을 모두 파일 상단으로 옮겼습니다.
    
    with app.app_context():
        # db.create_all()은 app 컨텍스트 안에서 실행되어야 합니다.
        db.create_all()
        
    print("Animalloo 백엔드 서버를 시작합니다...")
    app.run(host='0.0.0.0', port=5001, debug=True)