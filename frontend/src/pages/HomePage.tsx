import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import DistrictSection from '../components/DistrictSection';
import MapSection from '../components/MapSection';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Facility, District } from '../types';  // ⬅️ 추가!

const SEOUL_TEST_COORDS = {
  lat: 37.5665,
  lng: 126.9780
};

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
    console.log("백엔드에서 '구' 목록 로드 중...");
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
    console.log("'내 위치' 검색 실행:", query);
    setLoading(true);
    setSelectedGu(null);
    setSelectedCategories([]);

    try {
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
      console.error("/api/search 호출 오류:", error);
    } finally {
      setLoading(false);
      setFindLocationTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!selectedGu) {
      console.log("'구' 선택 해제 ('전체'). 마커를 지웁니다.");
      setFacilities([]);
      return;
    }

    console.log(`'구' 필터링 실행: ${selectedGu}, ${selectedCategories}`);
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
      console.error("/api/filter 호출 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <HeroSection onSearch={handleSearch} />
      <MapSection
        facilities={facilities}
        loading={loading}
        districts={districts}
        selectedGu={selectedGu}
        setSelectedGu={setSelectedGu}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        findLocationTrigger={findLocationTrigger}
      />  {/* ⬅️ 지도를 위로 */}
      <DistrictSection />  {/* ⬅️ 광고 배너를 아래로 */}
      <Footer />
    </>
  );
};

export default HomePage;
