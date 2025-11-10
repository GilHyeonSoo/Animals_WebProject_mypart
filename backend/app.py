import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from LLM_part.LLM import LLMProcessor

# --- 1. 환경 변수 로드 ---
# .env 파일에서 환경 변수(예: GEMINI_API_KEY)를 불러옵니다.
load_dotenv()

# --- 2. Flask 앱 및 LLM 초기화 ---
app = Flask(__name__)
# React 개발 서버(localhost:3000)에서의 요청을 허용합니다.
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Gemini API 키를 환경 변수에서 가져옵니다.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
    print("="*50)
    print("경고: .env 파일에 GEMINI_API_KEY가 설정되지 않았습니다.")
    print("LLM.py가 시뮬레이션 모드로 작동합니다.")
    print("="*50)
    # 키가 없어도 시뮬레이션 모드로 작동할 수 있도록 임시 키 전달
    llm_processor = LLMProcessor(api_key="SIMULATED_KEY")
else:
    # 실제 API 키로 LLM 프로세서 초기화
    llm_processor = LLMProcessor(api_key=GEMINI_API_KEY)


# --- 3. (시뮬레이션) DB 검색 함수 ---
# "미완성 데이터베이스"를 대신할 가상 데이터베이스 검색 함수입니다.
# PostGIS의 ST_DWithin (거리 기반) 쿼리를 시뮬레이션합니다.
def simulate_db_proximity_search(lat: float, lon: float, params: dict) -> list:
    """
    사용자 위치와 LLM 분석 파라미터를 기반으로 DB 검색을 시뮬레이션합니다.
    """
    print(f"[DB 시뮬레이터] 입력: lat={lat}, lon={lon}, params={params}")
    
    # [cite: gilhyeonsoo/animalloo_project/Animalloo_Project-1efa865e9723beef22ccb42dd918cb8952428a88/frontend/supabase/migrations/20251104051453_create_facilities_schema.sql]
    # 스키마를 기반으로 한 가상 데이터
    dummy_facilities = [
        {
            "id": "uuid-hospital-1", "name": "가까운 24시 동물병원", "category": "hospital",
            "address": "서울 어딘가", "district": "강남구", "latitude": lat + 0.005, "longitude": lon + 0.005,
            "phone": "02-111-1111", "description": "24시간 운영", "opening_hours": "24시간"
        },
        {
            "id": "uuid-pharmacy-1", "name": "튼튼 동물약국", "category": "pharmacy",
            "address": "서울 저기", "district": "마포구", "latitude": lat - 0.002, "longitude": lon - 0.002,
            "phone": "02-222-2222", "description": "주말 운영", "opening_hours": "09:00-18:00"
        },
        {
            "id": "uuid-cafe-1", "name": "멍멍이 카페", "category": "cafe",
            "address": "서울 여기", "district": "송파구", "latitude": lat + 0.01, "longitude": lon - 0.01,
            "phone": "02-333-3333", "description": "대형견 입장 가능", "opening_hours": "11:00-22:00"
        }
    ]

    results = []
    
    # LLM이 분석한 카테고리
    llm_categories = params.get("categories", [])
    # LLM이 분석한 텍스트 필터
    text_filter = params.get("text_filter")

    for facility in dummy_facilities:
        # 1. 카테고리 필터링
        # LLM이 카테고리를 지정하지 않았으면(빈 리스트) 모든 카테고리를 통과시킵니다.
        if len(llm_categories) > 0 and facility["category"] not in llm_categories:
            continue # 카테고리가 일치하지 않으면 건너뜀

        # 2. 텍스트 필터링 (LLM이 추출한 키워드)
        if text_filter:
            if text_filter.lower() not in facility["name"].lower() and \
               text_filter.lower() not in facility["description"].lower():
                continue # 텍스트 필터가 이름이나 설명에 없으면 건너뜀

        # (거리 계산은 이미 PostGIS가 처리했다고 가정)
        results.append(facility)

    print(f"[DB 시뮬레이터] {len(results)}개 시설 반환")
    return results


# --- 4. API 엔드포인트 정의 ---
@app.route('/api/search', methods=['POST'])
def handle_search():
    """
    프론트엔드로부터 검색 요청을 받아 처리하는 메인 API
    """
    # 1. 프론트엔드에서 전송한 JSON 데이터 수신
    data = request.json
    query = data.get('query')
    lat = data.get('lat')
    lon = data.get('lon')

    if not query or lat is None or lon is None:
        return jsonify({"error": "필수 정보(query, lat, lon)가 누락되었습니다."}), 400

    print(f"\n[API 요청 수신] 쿼리: '{query}', 위치: ({lat}, {lon})")

    # 2. LLM(Gemini)을 호출하여 검색어 분석
    try:
        search_params = llm_processor.get_search_parameters(query)
        print(f"[LLM 분석 완료] 파라미터: {search_params}")
        
    except Exception as e:
        print(f"[LLM 오류] {e}")
        return jsonify({"error": f"LLM 분석 중 오류 발생: {e}"}), 500

    # 3. LLM 분석 결과 + 위치 정보로 (시뮬레이션) DB 검색
    try:
        # "미완성 DB" 대신 시뮬레이션 함수 호출
        facilities = simulate_db_proximity_search(lat, lon, search_params)
        
        # 4. 프론트엔드(MapSection)에 마커로 표시할 데이터 반환
        return jsonify(facilities)
    
    except Exception as e:
        print(f"[DB 오류] {e}")
        return jsonify({"error": f"데이터 검색 중 오류 발생: {e}"}), 500


# --- 5. 서버 실행 ---
if __name__ == '__main__':
    """
    터미널에서 'python app.py'를 실행하면 여기부터 시작됩니다.
    """
    print("Animalloo 백엔드 서버를 시작합니다...")
    # host='0.0.0.0'은 로컬 네트워크의 다른 기기에서도 접속할 수 있게 합니다.
    # (예: 모바일 테스트)
    app.run(host='0.0.0.0', port=5001, debug=True)