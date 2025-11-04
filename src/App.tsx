import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DistrictSection from './components/DistrictSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import { supabase, Facility, District } from './lib/supabase'; // District import 추가

// UI 카테고리와 실제 DB 카테고리를 매핑합니다.
const categoryMap: Record<string, string[]> = {
  'hospital': ['hospital'],
  'pharmacy': ['pharmacy'],
  'grooming': ['grooming'],
  'culture_center': ['culture_center', 'museum', 'art_gallery'], // 문화센터는 3개 항목 통합
  'travel': ['travel'],
  'care_service': ['care_service'],
  'pension': ['pension'],
  'pet_supplies': ['pet_supplies'],
  'restaurant': ['restaurant', 'cafe'], // 식당은 2개 항목 통합
};


function App() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [districts, setDistricts] = useState<District[]>([]); // '구' 목록 state 추가
  const [loading, setLoading] = useState(true);
  
  // --- 필터 state 변경 ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGu, setSelectedGu] = useState<string | null>(null); // '구' 선택 state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // 다중 '항목' 선택 state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // facilities와 districts 데이터를 함께 불러옵니다.
      const [facilitiesRes, districtsRes] = await Promise.all([
        supabase.from('facilities').select('*'),
        supabase.from('districts').select('*')
      ]);

      if (facilitiesRes.error) throw facilitiesRes.error;
      if (districtsRes.error) throw districtsRes.error;

      if (facilitiesRes.data) setFacilities(facilitiesRes.data);
      if (districtsRes.data) setDistricts(districtsRes.data);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 필터 로직 고도화 ---
  const filteredFacilities = facilities.filter(facility => {
    // 1. '구' 필터링
    const matchesGu = !selectedGu || facility.district === selectedGu;

    // 2. '검색어' 필터링
    const matchesSearch = !searchQuery ||
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.district.includes(searchQuery) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. '항목' (다중선택) 필터링
    // 사용자가 선택한 UI 카테고리(예: 'restaurant')를 DB 카테고리(예: ['restaurant', 'cafe'])로 변환
    const activeDbCategories = selectedCategories.flatMap(key => categoryMap[key] || []);
    const matchesCategory = selectedCategories.length === 0 || activeDbCategories.includes(facility.category);

    return matchesGu && matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <MapSection
        facilities={filteredFacilities}
        loading={loading}
        // '구' 필터 관련 props 전달
        districts={districts}
        selectedGu={selectedGu}
        setSelectedGu={setSelectedGu}
        // '항목' 필터 관련 props 전달
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <DistrictSection />
      <Footer />
    </div>
  );
}

export default App;