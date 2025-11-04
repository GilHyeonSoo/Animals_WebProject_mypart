import { Search } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="bg-gradient-to-r from-[#007BFF] to-[#007BFF5C] text-white py-20">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          내 반려동물을 위한 장소, 애니멀루에서 찾으세요!
        </h2>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="서비스 (병원, 약국 등) 또는 지역을 검색해보세요."
              className="flex-1 px-6 py-4 text-gray-800 text-lg outline-none"
            />
            <button className="bg-[#FFC75F] hover:bg-[#FFB33F] px-8 py-4 text-gray-800 font-bold transition-colors">
              <Search size={28} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
