// frontend/src/pages/HomePage.tsx

import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import DistrictSection from '../components/DistrictSection';
import MapSection from '../components/MapSection';

// App.tsx에서 타입 정의를 이곳으로 이동
export interface Facility {
  id: string;
  name: string;
  category: string;
  address: string;
  district: string;
  Latitude: number;
  Longitude: number;
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
  Latitude?: number;
  Longitude?: number;
  en_name?: string;
}

// 서울 시청 고정 좌표 (GPS 테스트용)
const SEOUL_TEST_COORDS = {
  lat: 37.5665,
  lng: 126.9780
};

// 카테고리 맵
const categoryMap: Record<string, string[]> = {
  'hospital': ['veterinary hospital'],
  'pharmacy': ['pharmacy'],
  'grooming': ['grooming'],
  'culture_center': ['culture_center', 'museum', 'art_gallery'],
  'travel': ['travel'],
  'care_service': ['care_service'],
  'pension': ['pension'],
  'pet_supplies': ['pet_supplies'],
  'restaurant': ['restaurant', 'cafe'],
};


// App() 함수가 HomePage() 함수로 이름만 변경됨
const HomePage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false); 
  
  const [selectedGu, setSelectedGu] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [findLocationTrigger, setFindLocationTrigger] = useState(0);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    console.log("App.tsx: 백엔드에서 '구' 목록 로드 중...");
    try {
      const response = await fetch('http://localhost:5001/api/districts');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: District[] = await response.json();
      if (data) setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const handleSearch = async (query: string) => {
    console.log("App.tsx (Req 2): '내 위치' 검색 실행:", query);
    setLoading(true);
    setSelectedGu(null);
    setSelectedCategories([]);

    try {
      // (참고) 실제 GPS로 변경하려면 이 부분을 navigator.geolocation으로 바꿔야 함
      const lat = SEOUL_TEST_COORDS.lat;
      const lng = SEOUL_TEST_COORDS.lng;

      const response = await fetch('http://localhost:5001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          lat: lat,
          lon: lng,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data: Facility[] = await response.json();
      setFacilities(data);
      
    } catch (error) {
      console.error("(Req 2) /api/search 호출 오류:", error);
    } finally {
      setLoading(false);
      setFindLocationTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!selectedGu) {
        console.log("App.tsx: '구' 선택 해제 ('전체'). 마커를 지웁니다.");
        setFacilities([]);
        return;
    }
    console.log(`App.tsx (Req 3): '구' 필터링 실행: ${selectedGu}, ${selectedCategories}`);
    handleFilterSearch();
  }, [selectedGu, selectedCategories]);

  const handleFilterSearch = async () => {
    if (!selectedGu) return;
    setLoading(true);

    const selectedDistrictInfo = districts.find(d => d.name === selectedGu);
    const districtEnName = selectedDistrictInfo?.en_name;

    if (!districtEnName) {
      console.error(`'${selectedGu}'에 해당하는 영어 '구' 이름(en_name)을 districts DB에서 찾을 수 없습니다.`);
      setLoading(false);
      return;
    }

    const dbCategories = selectedCategories.flatMap(key => categoryMap[key] || []);

    try {
      const response = await fetch('http://localhost:5001/api/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: districtEnName, 
          categories: dbCategories,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data: Facility[] = await response.json();
      setFacilities(data);
    } catch (error) {
      console.error("(Req 3) /api/filter 호출 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // App.tsx의 return JSX가 이곳으로 이동
  return (
    <>
      <HeroSection
        onSearch={handleSearch}
      />
      <MapSection
        facilities={facilities}
        loading={loading} 
        districts={districts}
        selectedGu={selectedGu}
        setSelectedGu={setSelectedGu}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        findLocationTrigger={findLocationTrigger}
      />
      <DistrictSection />
    </>
  );
}

export default HomePage;