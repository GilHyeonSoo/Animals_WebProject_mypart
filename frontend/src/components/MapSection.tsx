import { useState, useEffect, useRef } from 'react';
import FacilityModal from './FacilityModal';
// --- [수정됨] RefreshCcw 아이콘 import ---
import { Crosshair, ChevronDown, RefreshCcw } from 'lucide-react'; 

export interface Facility {
  id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  Latitude: number; // 대소문자 확인
  Longitude: number; // 대소문자 확인
  phone?: string;
  description?: string;
  opening_hours?: string;
  distance_km?: number;
}

export interface District {
  id: string; // 또는 number
  name: string;
  description?: string;
  popular_services?: string;
  Latitude?: number;  // <-- [추가] DB에 추가한 컬럼
  Longitude?: number; // <-- [추가] DB에 추가한 컬럼
  en_name?: string;
}
// --- [신규] 타입 정의 끝 ---

// Props 인터페이스 (기존과 동일)
interface MapSectionProps {
  facilities: Facility[];
  loading: boolean;
  districts: District[];
  selectedGu: string | null;
  setSelectedGu: (gu: string | null) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  findLocationTrigger: number; // App.tsx로부터 받는 트리거
}

// 카테고리 목록 (기존과 동일)
const uiCategories = [
  { value: 'hospital', label: '병 원'},
  { value: 'pharmacy', label: '약 국'},
  { value: 'grooming', label: '미 용 샵'},
  { value: 'culture_center', label: '문 화 센 터'},
  { value: 'travel', label: '여 행 지'},
  { value: 'care_service', label: '위 탁 관 리'},
  { value: 'pension', 'label': '펜 션'},
  { value: 'pet_supplies', label: '동 물 용 품'},
  { value: 'restaurant', label: '식 당'}
];

// --- [추가] 테스트용 서울 고정 좌표 ---

declare global {
  interface Window {
    kakao: any;
  }
}

const MapSection = ({
  facilities,
  loading,
  districts,
  selectedGu,
  setSelectedGu,
  selectedCategories,
  setSelectedCategories,
  findLocationTrigger // --- [추가됨] ---
}: MapSectionProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  // --- [오류 수정] ---
  const [markers, setMarkers] = useState<any[]>([]); // 괄호를 추가하여 수정
  const [userMarker, setUserMarker] = useState<any>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // --- 아코디언 상태 관리 (기존과 동일) ---
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [usingMyLocation, setUsingMyLocation] = useState(false);

  // 1. 맵 기본 로드 (기존과 동일)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY || 'YOUR_API_KEY'}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            // --- [수정됨] 지도의 기본 중심을 서울 좌표로 설정 ---
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 8,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 2. 마커 업데이트 (기존과 동일)
  useEffect(() => {
    if (!map) return;
    
    // 이전 마커 모두 제거
    markers.forEach(marker => marker.setMap(null));
    if (userMarker) userMarker.setMap(null); // '내 위치' 마커도 제거
    
    if (!facilities.length) {
      setMarkers([]);
      return;
    }
    
    const newMarkers = facilities.map((facility) => {
      // --- [!!!] (수정됨) 소문자 -> 대문자 컬럼명 사용 ---
      const markerPosition = new window.kakao.maps.LatLng(facility.Latitude, facility.Longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedFacility(facility);
      });
      return marker;
    });
    setMarkers(newMarkers);
    
    // 마커 + '내 위치'가 있다면 함께 표시
    if (facilities.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      
      facilities.forEach(facility => {
        // --- [!!!] (수정됨) 소문자 -> 대문자 컬럼명 사용 ---
        bounds.extend(new window.kakao.maps.LatLng(facility.Latitude, facility.Longitude));
      });
      
      // '내 위치' 검색('usingMyLocation')으로 마커가 찍힌 경우,
      // '내 위치' 마커(userMarker)도 bounds에 포함시킴
      if (usingMyLocation && userMarker) {
         bounds.extend(userMarker.getPosition());
      }
      
      if (bounds.isEmpty() === false) {
        map.setBounds(bounds);
        
        // 줌 레벨이 너무 가까우면(예: 1개일 때) 살짝 조정
        if (map.getLevel() > 8) {
          map.setLevel(8);
        }
      }
    }
  }, [map, facilities, userMarker, usingMyLocation]); // userMarker, usingMyLocation 의존성 추가

  // 3. '구' 선택 시 지도 이동 (기존과 동일)
  useEffect(() => {
    if (map && selectedGu) {
      // App.tsx에서 받은 25개 구 목록(props)에서
      // 현재 선택된 '구'의 정보를 찾습니다.
      const selectedDistrict = districts.find(d => d.name === selectedGu);

      // 찾았고, 좌표값이 있다면
      if (selectedDistrict && selectedDistrict.Latitude && selectedDistrict.Longitude) {
        const moveLatLon = new window.kakao.maps.LatLng(
          selectedDistrict.Latitude, 
          selectedDistrict.Longitude
        );
        map.panTo(moveLatLon);
        map.setLevel(5); // '구'가 잘 보이도록 줌 레벨 조정
        setUsingMyLocation(false); // '내 위치' 모드 해제
      }
      
    } else if (map && !selectedGu && !usingMyLocation) { // '전체' 선택 시
      const moveLatLon = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청
      map.panTo(moveLatLon);
      map.setLevel(8);
    }
  }, [map, selectedGu, districts]); // <-- [중요] districts를 의존성 배열에 추가!

  
  // --- [!!!] 4. '내 위치' GPS 버튼 클릭 핸들러 (수정됨) ---
  const handleCurrentLocationClick = () => {
    
    // --- [수정됨] 실제 GPS를 가져오는 코드로 복구 ---
    if (navigator.geolocation) {
      console.log("[GPS] 실제 '내 위치'를 가져옵니다.");
      
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locPosition = new window.kakao.maps.LatLng(lat, lng);

        if (userMarker) userMarker.setMap(null);
        
        const newUserMarker = new window.kakao.maps.Marker({
          position: locPosition,
          map: map,
        });
        
        // (주의) newUserMarker는 facilities 목록에 포함되지 않음.
        // 마커 목록(markers) state가 아닌 별도의 userMarker state로 관리
        setUserMarker(newUserMarker); 
        map.panTo(locPosition);
        map.setLevel(4); // 1km 반경이 잘 보이도록 줌 레벨 조정
        
        setSelectedGu(null); // '구' 선택 해제
        setUsingMyLocation(true);
        setLocationSelected(true);
        setIsLocationOpen(false);
        setIsCategoryOpen(true);

      }, 
      (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        alert('위치 정보를 가져오는 데 실패했습니다. 브라우저의 위치 권한을 확인해주세요.');
      });
    } else {
      alert('이 브라우저에서는 Geolocation을 지원하지 않습니다.');
    }
  };

  
  // --- [추가] HeroSection 검색 시 '내 위치' 강제 실행 ---
  useEffect(() => {
    // 0보다 클 때만 (즉, 최초 로드가 아닐 때) 실행
    if (findLocationTrigger > 0) {
      console.log("[Trigger] HeroSection 검색으로 '내 위치'를 실행합니다.");
      
      // '내 위치' 버튼 클릭과 동일한 효과
      handleCurrentLocationClick();
      
      // (참고) App.tsx의 handleSearch가 API 요청을 하고,
      // API 결과가 facilities state를 바꾸면,
      // 이 컴포넌트의 2번 useEffect가 마커를 다시 그립니다.
    }
  }, [findLocationTrigger]);


  // 5. '항목' (다중) 선택 토글 핸들러 (기존과 동일)
  const handleCategoryToggle = (categoryValue: string) => {
    const newSelection = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    setSelectedCategories(newSelection);
  };

  // 6. '구' 선택 핸들러 (기존과 동일)
  const handleGuSelect = (gu: string | null) => {
    setSelectedGu(gu);
    setUsingMyLocation(false); // '구' 선택 시 '내 위치' 모드 해제
    
    if(gu) { // 특정 '구' 선택 시
      setLocationSelected(true);
      setIsLocationOpen(false);
      setIsCategoryOpen(true);
    } else { // '전체' 선택 시
      setLocationSelected(true); // '전체'도 선택된 상태
    }
  };

  // --- 버튼 스타일 (기존과 동일) ---
  const activeBtnClass = "bg-primary text-white font-medium py-1 px-3 rounded-full text-sm transition-all";
  const inactiveBtnClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium py-1 px-3 rounded-full text-sm transition-all";

  // --- 아코디언 헤더 스타일 (기존과 동일) ---
  const accordionHeaderBaseClass = "flex justify-between items-center w-full p-2 rounded transition-colors";
  const accordionHeaderActive = "hover:bg-gray-100";
  const accordionHeaderDisabled = "cursor-not-allowed";
  const accordionTitleBase = "font-bold text-lg";
  const accordionTitleActive = "text-gray-800";
  const accordionTitleDisabled = "text-gray-400";


  return (
    <section id="map" className="py-16 bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="lg:flex lg:gap-8">
          
          {/* 1. 지도 영역 */}
          <div className="lg:flex-1 relative bg-blue-100 p-3 rounded-lg shadow-lg border bg-blue-100">
            <div
              ref={mapRef}
              className="w-full h-[500px] lg:h-[700px] bg-gray-200 rounded-lg"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                  <p className="text-gray-600 font-medium text-lg italic">데이터 로딩 중...</p>
                </div>
              )}
            </div>
            {!loading && facilities.length === 0 && (
              <div className="absolute inset-3 flex items-center justify-center bg-gray-200 rounded-lg pointer-events-none">
                <p className="text-gray-500">
                  {selectedGu ? `'${selectedGu}'에 해당 시설이 없습니다.` : 
                   usingMyLocation ? "내 위치 1km 근방에 해당 시설이 없습니다." : 
                   "검색 또는 필터링 결과가 없습니다."}
                </p>
              </div>
            )}
          </div>

          {/* 2. 필터 패널 (오른쪽) */}
          <div className="w-full lg:w-72 lg:flex-none mt-8 lg:mt-0 bg-white p-4 rounded-lg shadow-xl lg:max-h-[700px] overflow-y-auto">
            
            {/* --- 1. '위치 선택' 아코디언 --- */}
            <div className="mb-2">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className={`${accordionHeaderBaseClass} ${accordionHeaderActive}`}
              >
                <h3 className={`${accordionTitleBase} ${accordionTitleActive}`}>
                  1. 위치 선택
                  {locationSelected && (
                    <span className="text-sm font-medium text-primary ml-2">
                      ({usingMyLocation ? '내 위치' : selectedGu || '전체'})
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      handleCurrentLocationClick();
                    }} 
                    title="내 위치 찾기"
                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Crosshair size={20} />
                  </button>
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
              </button>

              {isLocationOpen && (
                <div className="flex flex-wrap gap-2 pt-3">
                  <button 
                    onClick={() => handleGuSelect(null)} 
                    className={!selectedGu && !usingMyLocation ? activeBtnClass : inactiveBtnClass}
                  >
                    전체
                  </button>
                  {districts.map(d => (
                    <button 
                      key={d.id} 
                      onClick={() => handleGuSelect(d.name)} 
                      className={selectedGu === d.name ? activeBtnClass : inactiveBtnClass}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <hr className="my-3" />

            {/* --- 2. '항목 선택' 아코디언 --- */}
            <div className="mb-2">
              <button
                onClick={() => {
                  if (locationSelected) setIsCategoryOpen(!isCategoryOpen);
                }}
                className={`${accordionHeaderBaseClass} ${!locationSelected ? accordionHeaderDisabled : accordionHeaderActive}`}
                disabled={!locationSelected}
              >
                <h3 className={`${accordionTitleBase} ${!locationSelected ? accordionTitleDisabled : accordionTitleActive}`}>
                  2. 항목 선택
                  {selectedCategories.length > 0 && (
                    <span className="text-sm font-medium text-primary ml-2">
                      ({selectedCategories.length}개)
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center">
                  {locationSelected && selectedCategories.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategories([]);
                      }}
                      className="p-1 text-gray-500 hover:text-primary transition-colors"
                      title="항목 초기화"
                    >
                      <RefreshCcw size={18} />
                    </button>
                  )}
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''} ${!locationSelected ? 'text-gray-400' : 'text-gray-800'}`} 
                  />
                </div>
              </button>

              {isCategoryOpen && locationSelected && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {uiCategories.map(c => (
                    <button 
                      key={c.value} 
                      onClick={() => handleCategoryToggle(c.value)} 
                      className={selectedCategories.includes(c.value) ? activeBtnClass : inactiveBtnClass}
                    >
                      {c.label.trim()}
                    </button>
                  ))}
                </div>
              )}
              
              {!locationSelected && (
                <p className="text-sm text-gray-400 italic pt-2">
                  먼저 1. 위치 선택을 완료해주세요.
                </p>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {selectedFacility && (
        <FacilityModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </section>
  );
};

export default MapSection;