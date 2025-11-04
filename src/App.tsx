import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DistrictSection from './components/DistrictSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import { supabase, Facility } from './lib/supabase';

function App() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // facilities 데이터만 불러옵니다.
      const { data, error } = await supabase.from('facilities').select('*');

      if (error) throw error;
      if (data) setFacilities(data);
    } catch (error) {
      console.error('Error loading facilities data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesCategory = selectedCategory === 'all' || facility.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.district.includes(searchQuery) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {/* 맵 섹션이 먼저 나옵니다. */}
      <MapSection
        facilities={filteredFacilities}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        loading={loading}
      />
      {/* 리뷰 섹션이 삭제되고, 광고 섹션(구 DistrictSection)이 이 위치로 이동했습니다. */}
      <DistrictSection />
      <Footer />
    </div>
  );
}

export default App;