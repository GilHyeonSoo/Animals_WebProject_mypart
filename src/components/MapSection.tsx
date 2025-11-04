import { useState, useEffect, useRef } from 'react';
import { Facility } from '../lib/supabase';
import FacilityModal from './FacilityModal';
import { List } from 'lucide-react';

interface MapSectionProps {
  facilities: Facility[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  loading: boolean;
}

const categories = [
  { value: 'hospital', label: '병 원'},
  { value: 'pharmacy', label: '약 국'},
  { value: 'grooming', label: '미 용 샵'},
  { value: 'culture_center', label: '문 화 센 터'}, //문화센터, 미술관, 박물관
  { value: 'travel', label: '여 행 지'},
  { value: 'care_service', label: '위 탁 관 리'},
  { value: 'pension', label: '펜 션'},
  { value: 'pet_supplies', label: '동 물 용 품'},
  { value: 'restaurant', label: '식 당'} //식당, 카페
];

declare global {
  interface Window {
    kakao: any;
  }
}

const MapSection = ({ facilities, selectedCategory, onCategoryChange, loading }: MapSectionProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

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
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!map || !facilities.length) return;

    markers.forEach(marker => marker.setMap(null));

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

    if (facilities.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      facilities.forEach(facility => {
        bounds.extend(new window.kakao.maps.LatLng(facility.latitude, facility.longitude));
      });
      map.setBounds(bounds);
    }
  }, [map, facilities]);

  return (
    <section id="map" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 데스크탑용 그리드 레이아웃 */}
        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          
          {/* 왼쪽: 카테고리 필터 (세로) */}
          <div className="lg:col-span-1 mb-8 lg:mb-0 ">
            <div className="flex flex-row overflow-x-auto lg:flex-col lg:overflow-x-visible lg:space-y-3 p-1">
              <div
                className={`flex items-center justify-center gap-1 w-full px-4 py-2 rounded-lg border-2 font-bold whitespace-nowrap lg:whitespace-normal
                  bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed
                  lg:mr-0 mr-3 flex-shrink-0 lg:flex-shrink
                `}
              >
                <List className="mr-2" size={20} />
                <span>리스트</span>
              </div>
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => onCategoryChange(category.value)}
                  className={`text-lg flex items-center justify-center w-full px-5 py-4 rounded-xl border-2 font-bold transition-all whitespace-nowrap lg:whitespace-normal 
                    ${
                      selectedCategory === category.value
                        ? 'text-xl bg-primary text-white border-primary shadow-md'
                        : 'bg-white text-primary border-primary hover:bg-blue-50 '
                    }
                    lg:mr-0 mr-3 flex-shrink-0 lg:flex-shrink 
                  `}
                >
                  <span className="mr-2 text-lg"></span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 지도 (확대됨) */}
          <div className="lg:col-span-5">
            {/* [수정됨]
              - 이 div가 띠(프레임) 역할을 합니다.
              - bg-cyan-50: 옅은 하늘색 배경 (이미지와 유사)
              - p-3: 안쪽 여백 (띠 두께)
              - rounded-lg, shadow-lg, border: 스타일을 이 부모 div로 이동
            */}
            <div className="relative bg-blue-100 p-3 rounded-lg shadow-lg border bg-blue-100">
              <div
                ref={mapRef}
                // [수정됨]
                // - 맵 자체에도 둥근 모서리(rounded-lg) 적용
                // - 기존 shadow, border 등은 부모로 이동
                className="w-full h-[500px] lg:h-[700px] bg-gray-200 rounded-lg"
              >
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 italic">지도를 로딩 중입니다...</p>
                  </div>
                )}
              </div>
              {!loading && facilities.length === 0 && (
                // [수정됨]
                // - 부모의 padding(p-3)에 맞춰 'inset-3'로 수정
                // - 맵 영역과 같이 'rounded-lg' 적용
                <div className="absolute inset-3 flex items-center justify-center bg-gray-200 rounded-lg">
                  <p className="text-gray-500">해당 카테고리의 시설이 없습니다.</p>
                </div>
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