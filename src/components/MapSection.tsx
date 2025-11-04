import { useState, useEffect, useRef } from 'react';
import { Facility, District } from '../lib/supabase'; // District import
import FacilityModal from './FacilityModal';
import { Crosshair } from 'lucide-react'; // '내 위치' 아이콘

// MapSection이 받을 Props 인터페이스 수정
interface MapSectionProps {
  facilities: Facility[];
  loading: boolean;
  districts: District[];
  selectedGu: string | null;
  setSelectedGu: (gu: string | null) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

// UI에 표시될 카테고리 목록 (기존 파일 내용 사용)
const uiCategories = [
  { value: 'hospital', label: '병 원'},
  { value: 'pharmacy', label: '약 국'},
  { value: 'grooming', label: '미 용 샵'},
  { value: 'culture_center', label: '문 화 센 터'}, // (문화센터, 미술관, 박물관)
  { value: 'travel', label: '여 행 지'},
  { value: 'care_service', label: '위 탁 관 리'},
  { value: 'pension', label: '펜 션'},
  { value: 'pet_supplies', label: '동 물 용 품'},
  { value: 'restaurant', label: '식 당'} // (식당, 카페)
];

// '구' 클릭 시 이동할 좌표 (DB에 없으므로 하드코딩)
const guCoordinates: Record<string, [number, number]> = {
  '강남구': [37.5172, 127.0473],
  '마포구': [37.5662, 126.9015],
  '구로구': [37.4954, 126.8875],
  '송파구': [37.5145, 127.1058],
  // 필요시 다른 '구' 좌표 추가
};


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
  setSelectedCategories
}: MapSectionProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any>(null); // '내 위치' 마커 state
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // 1. 맵 기본 로드 (변경 없음)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY || 'YOUR_API_KEY'}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
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

  // 2. facilities 변경 시 마커 업데이트 (변경 없음)
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    
    // facilities가 비어있으면(loading 중이거나, 필터 결과가 없으면) 마커를 그리지 않음
    if (!facilities.length) {
      setMarkers([]);
      return;
    }

    const newMarkers = facilities.map((facility) => {
      const markerPosition = new window.kakao.maps.LatLng(facility.latitude, facility.longitude);
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

    // 필터링된 시설이 1개 이상일 때만 지도를 재조정함
    if (facilities.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      facilities.forEach(facility => {
        bounds.extend(new window.kakao.maps.LatLng(facility.latitude, facility.longitude));
      });
      map.setBounds(bounds);
    }
  }, [map, facilities]); // facilities가 바뀔 때마다 실행

  // 3. '구' 선택 시 지도 이동 (변경 없음)
  useEffect(() => {
    if (map && selectedGu && guCoordinates[selectedGu]) {
      const [lat, lng] = guCoordinates[selectedGu];
      const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
      map.panTo(moveLatLon);
      map.setLevel(5); // 확대 레벨
    } else if (map && !selectedGu) {
      // '전체' 선택 시 서울 중심으로 복귀
      const moveLatLon = new window.kakao.maps.LatLng(37.5665, 126.9780);
      map.panTo(moveLatLon);
      map.setLevel(8); // 축소 레벨
    }
  }, [map, selectedGu]); // selectedGu가 바뀔 때마다 실행

  // 4. '내 위치' GPS 버튼 클릭 핸들러 (변경 없음)
  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locPosition = new window.kakao.maps.LatLng(lat, lng);

        // '내 위치' 마커가 이미 있으면 제거
        if (userMarker) {
          userMarker.setMap(null);
        }
        
        // 새 '내 위치' 마커 생성
        const newUserMarker = new window.kakao.maps.Marker({
          position: locPosition,
          map: map,
        });
        setUserMarker(newUserMarker);
        map.panTo(locPosition);
        map.setLevel(4); // 확대
      }, 
      (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        alert('위치 정보를 가져오는 데 실패했습니다.');
      });
    } else {
      alert('이 브라우저에서는 Geolocation을 지원하지 않습니다.');
    }
  };

  // 5. '항목' (다중) 선택 토글 핸들러 (변경 없음)
  const handleCategoryToggle = (categoryValue: string) => {
    const newSelection = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue) // 이미 있으면 제거
      : [...selectedCategories, categoryValue]; // 없으면 추가
    setSelectedCategories(newSelection);
  };

  // --- 버튼 스타일 ---
  const activeBtnClass = "bg-primary text-white font-medium py-1 px-3 rounded-full text-sm transition-all";
  const inactiveBtnClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium py-1 px-3 rounded-full text-sm transition-all";

  return (
    <section id="map" className="py-16 bg-gray-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* [수정됨] 
          - 기존 "relative" 컨테이너를 "lg:flex lg:gap-8"으로 변경
          - 데스크톱에서는 flex row, 모바일에서는 flex column (기본값)으로 작동
        */}
        <div className="lg:flex lg:gap-8">
          
          {/* 1. 지도 영역 (왼쪽) */}
          {/* [수정됨] "lg:flex-1"을 추가하여 남은 공간을 모두 차지하도록 함 */}
          <div className="lg:flex-1 relative bg-blue-100 p-3 rounded-lg shadow-lg border bg-blue-100">
            <div
              ref={mapRef}
              className="w-full h-[500px] lg:h-[800px] bg-gray-200 rounded-lg"
            >
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 italic">지도를 로딩 중입니다...</p>
                </div>
              )}
            </div>
            {!loading && facilities.length === 0 && (
              <div className="absolute inset-3 flex items-center justify-center bg-gray-200 rounded-lg">
                <p className="text-gray-500">해당 카테고리의 시설이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 2. 필터 패널 (오른쪽) */}
          {/* [수정됨] 
            - "absolute top-4 right-7 z-10" 등 절대 위치 클래스 제거
            - "mt-8 lg:mt-0" : 모바일에선 상단 마진, 데스크톱에선 마진 제거
            - "w-full lg:w-72 lg:flex-none" : 모바일에선 꽉 채우고, 데스크톱에선 72(288px) 너비 고정
            - "lg:max-h-[700px]" : 데스크톱에서 지도 높이와 맞춤
          */}
          <div className="w-full lg:w-72 lg:flex-none mt-8 lg:mt-0 bg-white p-4 rounded-lg shadow-xl lg:max-h-[800px] overflow-y-auto">
            
            {/* '구' 선택 필터 */}
            <div className="mb-4">
              {/* [수정됨] 
                - '내 위치' 버튼을 H3 태그와 같은 줄에 flex로 배치
                - '내 위치' 버튼의 "absolute" 클래스 제거
              */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-800">위치 선택</h3>
                <button 
                  onClick={handleCurrentLocationClick} 
                  title="내 위치 찾기"
                  className="p-1 text-gray-500 hover:text-primary transition-colors"
                >
                  <Crosshair size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedGu(null)} 
                  className={!selectedGu ? activeBtnClass : inactiveBtnClass}
                >
                  전체
                </button>
                {districts.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => setSelectedGu(d.name)} 
                    className={selectedGu === d.name ? activeBtnClass : inactiveBtnClass}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-3" />

            {/* '항목' 선택 필터 */}
            <div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">항목 선택</h3>
              <div className="flex flex-wrap gap-2">
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