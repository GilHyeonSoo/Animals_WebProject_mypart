import { useState } from 'react';
import { Search } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#007BFF] to-[#007BFF5C] text-white py-20">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          내 주변 반려동물 시설, LLM 기반으로 더 스마트하게 찾아보세요.
        </h2>

        {/* 검색창 */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="서비스 (병원, 약국 등) 또는 지역을 검색해보세요."
              className="flex-1 px-6 py-4 text-gray-800 text-lg outline-none"
            />
            <button
              type="submit"
              className="bg-[#FFC75F] hover:bg-[#FFB33F] px-8 py-4 text-gray-800 font-bold transition-colors"
            >
              <Search size={20} />
              검색
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
