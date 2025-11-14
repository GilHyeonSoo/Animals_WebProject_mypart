import { useState, useEffect, useRef } from 'react';
import FacilityModal from './FacilityModal';
import { Crosshair, ChevronDown, RefreshCcw } from 'lucide-react';
import { Facility, District } from '../types';

interface MapSectionProps {
  facilities: Facility[];
  loading: boolean;
  districts: District[];
  selectedGu: string | null;
  setSelectedGu: (gu: string | null) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  findLocationTrigger: number;
}

const uiCategories = [
  { value: 'hospital', label: '병원' },
  { value: 'pharmacy', label: '약국' },
  { value: 'grooming', label: '미용샵' },
  { value: 'culture_center', label: '문화센터' },
  { value: 'travel', label: '여행지' },
  { value: 'care_service', label: '위탁관리' },
  { value: 'pension', label: '펜션' },
  { value: 'pet_supplies', label: '동물용품' },
  { value: 'restaurant', label: '식당' }
];

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
  findLocationTrigger
}: MapSectionProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  const [usingMyLocation, setUsingMyLocation] = useState(false);

  // 1. 맵 기본 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY || 'YOUR_API_KEY'}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 8,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);
          console.log('🗺️ 카카오 지도 초기화 완료');
        }
      });
    };

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 2. 마커 업데이트
  useEffect(() => {
    if (!map) return;

    console.log('🗺️ 마커 업데이트:', facilities.length, '개');

    // 이전 마커 모두 제거
    markers.forEach(marker => marker.setMap(null));
    if (userMarker) userMarker.setMap(null);

    if (!facilities.length) {
      setMarkers([]);
      return;
    }

    // 새 마커 생성
    const newMarkers = facilities.map((facility) => {
      const markerPosition = new window.kakao.maps.LatLng(facility.Latitude, facility.Longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        console.log('🎯 마커 클릭!', facility);
        setSelectedFacility(facility);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // 지도 범위 조정
    if (facilities.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      facilities.forEach(facility => {
        bounds.extend(new window.kakao.maps.LatLng(facility.Latitude, facility.Longitude));
      });

      if (usingMyLocation && userMarker) {
        bounds.extend(userMarker.getPosition());
      }

      if (!bounds.isEmpty()) {
        map.setBounds(bounds);
        if (map.getLevel() > 8) {
          map.setLevel(8);
        }
      }
    }
  }, [map, facilities, userMarker, usingMyLocation]);

  // 3. '구' 선택 시 지도 이동
  useEffect(() => {
    if (map && selectedGu) {
      const selectedDistrict = districts.find(d => d.name === selectedGu);
      if (selectedDistrict && selectedDistrict.Latitude && selectedDistrict.Longitude) {
        const moveLatLon = new window.kakao.maps.LatLng(
          selectedDistrict.Latitude,
          selectedDistrict.Longitude
        );
        map.panTo(moveLatLon);
        map.setLevel(5);
        setUsingMyLocation(false);
      }
    } else if (map && !selectedGu && !usingMyLocation) {
      const moveLatLon = new window.kakao.maps.LatLng(37.5665, 126.9780);
      map.panTo(moveLatLon);
      map.setLevel(8);
    }
  }, [map, selectedGu, districts]);

  // 4. '내 위치' GPS 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      console.log("[GPS] 실제 '내 위치'를 가져옵니다.");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locPosition = new window.kakao.maps.LatLng(lat, lng);

          if (userMarker) userMarker.setMap(null);

          const newUserMarker = new window.kakao.maps.Marker({
            position: locPosition,
            map: map,
          });

          setUserMarker(newUserMarker);
          map.panTo(locPosition);
          map.setLevel(4);
          setSelectedGu(null);
          setUsingMyLocation(true);
          setLocationSelected(true);
          setIsLocationOpen(false);
          setIsCategoryOpen(true);
        },
        (err) => {
          console.warn('ERROR(' + err.code + '): ' + err.message);
          alert('위치 정보를 가져오는 데 실패했습니다. 브라우저의 위치 권한을 확인해주세요.');
        }
      );
    } else {
      alert('이 브라우저에서는 Geolocation을 지원하지 않습니다.');
    }
  };

  // 5. HeroSection 검색 시 '내 위치' 강제 실행
  useEffect(() => {
    if (findLocationTrigger > 0) {
      console.log("[Trigger] HeroSection 검색으로 '내 위치'를 실행합니다.");
      handleCurrentLocationClick();
    }
  }, [findLocationTrigger]);

  // 6. '항목' (다중) 선택 토글 핸들러
  const handleCategoryToggle = (categoryValue: string) => {
    const newSelection = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    setSelectedCategories(newSelection);
  };

  // 7. '구' 선택 핸들러
  const handleGuSelect = (gu: string | null) => {
    setSelectedGu(gu);
    setUsingMyLocation(false);
    if (gu) {
      setLocationSelected(true);
      setIsLocationOpen(false);
      setIsCategoryOpen(true);
    } else {
      setLocationSelected(true);
    }
  };

  // 버튼 스타일
  const activeBtnClass = "bg-primary text-white font-medium py-1 px-3 rounded-full text-sm transition-all";
  const inactiveBtnClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium py-1 px-3 rounded-full text-sm transition-all";

  // --- 아코디언 헤더 스타일 (기존과 동일) ---
  const accordionHeaderBaseClass = "flex justify-between items-center w-full p-2 rounded transition-colors";
  const accordionHeaderActive = "hover:bg-gray-100";
  const accordionHeaderDisabled = "cursor-not-allowed";
  const accordionTitleBase = "font-bold text-lg";
  const accordionTitleActive = "text-gray-800";
  const accordionTitleDisabled = "text-gray-400";

  console.log('🔍 selectedFacility:', selectedFacility);

  return (
    <section id="map" className="py-16 bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="lg:flex lg:gap-8">
          
          {/* 1. 지도 영역 (기존과 동일) */}
          <div className="lg:flex-1 relative bg-blue-100 p-3 rounded-lg shadow-lg border bg-blue-100">
            <div
              ref={mapRef}
              className="w-full h-[500px] lg:h-[700px] bg-gray-200 rounded-lg"
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

          {/* 2. 필터 패널 (오른쪽) (기존과 동일) */}
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
                  {/* --- [수정됨] RefreshCcw 아이콘으로 변경 --- */}
                  {locationSelected && selectedCategories.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategories([]);
                      }}
                      className="p-1 text-gray-500 hover:text-primary transition-colors"
                      title="항목 초기화"
                    >
                      <RefreshCcw size={18} /> {/* RefreshCcw 아이콘 */}
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