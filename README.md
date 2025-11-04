# 애니멀루 (Animalloo) - 서울 반려동물 시설 위치 정보 서비스

서울특별시 반려동물 관련 시설의 위치와 정보를 제공하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 고급 웹 애플리케이션 개발
- React + TypeScript + Vite를 활용한 최신 웹 기술 스택
- Supabase를 활용한 실시간 데이터베이스 연동
- 반응형 디자인으로 모든 디바이스 지원

### 2. 오픈소스 협업
- Supabase (오픈소스 Firebase 대안)
- Kakao Maps API
- React 생태계 활용

### 3. 데이터 시각화
- 지도 기반 시설 위치 시각화
- 12개 카테고리별 필터링
- 마커 클릭을 통한 상세 정보 표시
- 지역별 통계 및 추천 서비스

## 시설 카테고리 (12개)

1. 🏥 동물병원 (hospital)
2. 💊 동물약국 (pharmacy)
3. ✂️ 미용샵 (grooming)
4. 🎭 문화센터 (culture_center)
5. 🏛️ 박물관 (museum)
6. 🎨 미술관 (art_gallery)
7. 🗺️ 여행지 (travel)
8. 🐕 위탁관리 (care_service)
9. 🏠 펜션 (pension)
10. 🛍️ 반려동물용품 (pet_supplies)
11. 🍽️ 식당 (restaurant)
12. ☕ 카페 (cafe)

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Map**: Kakao Maps API
- **Icons**: Lucide React

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

#### Supabase 설정
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. Project Settings > API에서 URL과 anon key 복사
3. 데이터베이스 마이그레이션은 자동으로 적용됨

#### Kakao Maps API 설정
1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 등록
2. 웹 플랫폼 추가 및 JavaScript 키 발급
3. 사이트 도메인 등록 (개발: http://localhost:5173)

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 데이터베이스 구조

### facilities 테이블
시설 정보를 저장하는 메인 테이블
- 위치 정보 (위도/경도)
- 카테고리별 분류
- 연락처 및 운영 정보

### reviews 테이블
사용자 리뷰 저장
- 5점 만점 평점
- 리뷰 내용
- 작성자 닉네임

### districts 테이블
서울시 구별 정보
- 구 이름
- 대표 서비스
- 설명

## 주요 컴포넌트

- **Header**: 네비게이션 헤더
- **HeroSection**: 검색 기능이 포함된 히어로 섹션
- **DistrictSection**: 지역별 추천 서비스
- **MapSection**: 카카오 지도 통합 및 마커 표시
- **FacilityModal**: 시설 상세 정보 모달
- **ReviewSection**: 사용자 리뷰 표시
- **CTASection**: 행동 유도 섹션
- **Footer**: 푸터

## 주요 기능 설명

### 지도 마커 시스템
- 시설 위치를 지도에 마커로 표시
- 마커 클릭 시 상세 정보 모달 표시
- 카테고리별 필터링 시 해당 시설만 표시

### 검색 기능
- 시설명, 주소, 지역으로 검색
- 실시간 필터링

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 최적화
- 빈티지 블루 컬러 테마
- 사용자 친화적인 UI/UX

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── DistrictSection.tsx
│   ├── MapSection.tsx
│   ├── FacilityModal.tsx
│   ├── ReviewSection.tsx
│   ├── CTASection.tsx
│   └── Footer.tsx
├── lib/
│   └── supabase.ts     # Supabase 클라이언트 및 타입
├── App.tsx             # 메인 앱 컴포넌트
├── main.tsx            # 진입점
└── index.css           # 글로벌 스타일
```

## 라이선스

고급웹프로그래밍 프로젝트 © 2024
