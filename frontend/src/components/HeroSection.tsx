// frontend/src/components/HeroSection.tsx

import { useState } from 'react';
import { Search } from 'lucide-react';

// App.tsx에서 onSearch 함수를 받도록 props 변경
interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  // HeroSection이 자체적으로 검색어 state를 관리
  const [query, setQuery] = useState('');

  // 폼 제출(Enter 키 또는 버튼 클릭) 시 App.tsx의 handleSearch 실행
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <section className="bg-primary text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
          Animalloo
        </h1>
        <p className="mt-3 text-xl text-blue-100 max-w-2xl mx-auto">
          내 주변 반려동물 시설, LLM 기반으로 더 스마트하게 찾아보세요.
        </p>
        
        {/* form 태그로 input과 button을 감싸서 Enter키로 제출 가능하게 함 */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 max-w-lg mx-auto flex"
        >
          <input
            type="text"
            placeholder="서울시 반려동물 시설을 검색하세요 (예: 24시 동물병원)"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // 내부 state 업데이트
            className="flex-grow w-full px-5 py-3 border border-gray-300 rounded-l-full shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-900"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-r-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <Search size={20} className="mr-2" />
            검색
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;