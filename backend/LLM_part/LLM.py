# backend/LLM_part/LLM.py

import os
import json
import google.generativeai as genai
from typing import Dict, List, Any, Optional, Tuple

# --- 환경 설정 ---
# API 키는 app.py에서 받아옵니다.

# [cite: gilhyeonsoo/animalloo_project/Animalloo_Project-1efa865e9723beef22ccb42dd918cb8952428a88/frontend/supabase/migrations/20251104051453_create_facilities_schema.sql]
DB_CATEGORIES = [
    'hospital', 'pharmacy', 'grooming', 'culture_center', 
    'museum', 'art_gallery', 'travel', 'care_service', 
    'pension', 'pet_supplies', 'restaurant', 'cafe'
]

class LLMProcessor:
    """
    Gemini LLM을 사용하여 Animalloo 검색 쿼리를 처리하는 클래스.
    """
    
    def __init__(self, api_key: str):
        """
        Gemini 모델을 초기화합니다.
        
        Args:
            api_key: Google AI Studio에서 발급받은 API 키 또는 시뮬레이션용 키
        """
        self.simulated_mode = (api_key == "SIMULATED_KEY")
        
        if self.simulated_mode:
            print("[LLM] 시뮬레이션 모드로 초기화되었습니다. (API 키 불필요)")
            self.model = None
        else:
            try:
                genai.configure(api_key=api_key)
                generation_config = {"response_mime_type": "application/json"}
                self.model = genai.GenerativeModel(
                    'gemini-pro', # 또는 최신 Gemini 모델
                    generation_config=generation_config
                )
                print("[LLM] Gemini 모델이 실제 API 키로 성공적으로 초기화되었습니다.")
            except Exception as e:
                print(f"[LLM] Gemini 모델 초기화 실패: {e}")
                print("[LLM] 시뮬레이션 모드로 강제 전환됩니다.")
                self.simulated_mode = True
                self.model = None


    def _build_prompt(self, query: str) -> str:
        """LLM에 전달할 프롬프트를 생성합니다."""
        
        prompt = f"""
        당신은 "Animalloo"라는 서울 반려동물 시설 위치 정보 서비스의 AI 어시스턴트입니다.
        사용자의 검색어를 분석하여 데이터베이스(Supabase, PostGIS) 쿼리에 사용할 수 있는 JSON 객체를 생성해야 합니다.

        사용자의 요구사항은 "현재 내 위치 중심"으로 검색하는 것입니다.
        
        # 분석해야 할 사용자 검색어:
        "{query}"

        # 사용 가능한 데이터베이스 카테고리 목록:
        {json.dumps(DB_CATEGORIES)}

        # 처리 규칙:
        1.  **categories**: 
            - 검색어와 가장 관련성이 높은 카테고리를 위 목록에서 정확히 선택합니다.
            - 예: "강아지 병원" -> ["hospital"]
            - 예: "밥 먹을 곳" -> ["restaurant", "cafe"]
            - 예: "24시 동물약국" -> ["pharmacy"]
            - 예: "전부" 또는 "모든 곳" -> {json.dumps(DB_CATEGORIES)} (모든 카테고리)
            - 관련 카테고리가 없으면 빈 리스트 []를 반환합니다.
        2.  **search_radius_km**:
            - "내 위치 중심" 검색을 위한 합리적인 검색 반경(km)을 추천합니다.
            - 기본값은 3km입니다.
            - "가까운", "근처" 등은 3km로 설정합니다.
            - "멀리 있는" 또는 "서울 전체" 같은 뉘앙스가 있다면 10km 이상으로 설정할 수 있습니다.
            - 도보, 자전거 등 키워드가 있다면 1km로 설정합니다.
        3.  **text_filter**:
            - "24시", "야간", "전문" 등 카테고리 외의 추가 검색 키워드를 추출합니다.
            - 이 키워드는 'facilities' 테이블의 'name', 'description' 필터를 위해 사용됩니다.
            - 없으면 null을 반환합니다.
        
        # 출력 형식 (JSON):
        {{
            "categories": ["category1", "category2"],
            "search_radius_km": 5.0,
            "text_filter": "24시" | null
        }}
        
        이제 위 규칙에 따라 다음 검색어를 분석하고 JSON을 생성해주세요: "{query}"
        """
        return prompt

    def get_search_parameters(self, query: str) -> Dict[str, Any]:
        """
        사용자의 자연어 쿼리를 분석하여 DB 검색 파라미터(JSON)를 반환합니다.
        """
        
        try:
            # --- 시뮬레이션 모드 ---
            if self.simulated_mode:
                print(f"[LLM 시뮬레이션] 쿼리: {query}")
                if "병원" in query or "hospital" in query:
                    result = {
                        "categories": ["hospital"], "search_radius_km": 3.0,
                        "text_filter": "24시" if "24시" in query or "야간" in query else None
                    }
                elif "약국" in query or "pharmacy" in query:
                    result = {"categories": ["pharmacy"], "search_radius_km": 3.0, "text_filter": None}
                elif "밥" in query or "식당" in query or "카페" in query:
                     result = {"categories": ["restaurant", "cafe"], "search_radius_km": 2.0, "text_filter": None}
                else:
                     result = {"categories": [], "search_radius_km": 3.0, "text_filter": query if query else None}
                
                return result

            # --- 실제 API 호출 모드 ---
            if not self.model:
                 raise Exception("모델이 초기화되지 않았습니다.")
                 
            prompt = self._build_prompt(query)
            print(f"[LLM 실제 호출] Gemini에 프롬프트 전송 중...")
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)

            print(f"[LLM 실제 호출] 분석 완료: {result}")
            
            if "categories" not in result or "search_radius_km" not in result:
                raise ValueError("LLM 응답에 필수 키가 누락되었습니다.")
                
            return result

        except Exception as e:
            print(f"Gemini 쿼리 처리 중 오류 발생: {e}")
            # LLM 실패 시, 검색어 원본을 text_filter로 사용하는 기본값 반환
            return {
                "categories": [],  # 카테고리 분석 실패
                "search_radius_km": 5.0, # 기본 반경 5km
                "text_filter": query # 검색어 원본을 필터로 사용
            }