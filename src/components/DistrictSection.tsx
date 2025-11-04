import { useState } from 'react'; // 1. useState 훅 import
import {
  Building,
  Droplet,
  Store,
  PawPrint,
  Sun,
  MapPin,
  ChevronLeft, // 2. 왼쪽 화살표 아이콘 import
  ChevronRight, // 3. 오른쪽 화살표 아이콘 import
} from 'lucide-react';

// 광고 배너에 사용할 샘플 데이터 (기존과 동일)
const adBanners = [
  {
    icon: Building,
    title: '프리미엄 펫 호텔',
    description: '최고급 시설에서 편안한 휴식을 경험하세요.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Premium+Hotel',
  },
  {
    icon: Droplet,
    title: '전문 펫 스파 & 그루밍',
    description: '전문가의 손길로 더욱 사랑스럽게.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Spa',
  },
  {
    icon: Store,
    title: '유기농 수제 간식 전문점',
    description: '건강과 맛을 모두 잡은 특별한 간식.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Organic+Food',
  },
  {
    icon: PawPrint,
    title: '행동 교정 클리닉',
    description: '반려동물과의 행복한 동행을 위한 첫걸음.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Training',
  },
  {
    icon: Sun,
    title: '도심 속 펫 놀이터',
    description: '넓은 공간에서 마음껏 뛰어놀아요!',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Playground',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
  {
    icon: MapPin,
    title: '펫 동반 가능 여행지',
    description: '반려동물과 함께 특별한 추억 만들기.',
    imageUrl: 'https://via.placeholder.com/400x250/0064FF/FFFFFF?text=Pet+Travel',
  },
];

// --- [수정됨] 컴포넌트 이름 변경 (AdSection -> DistrictSection) 및 로직 추가 ---
const DistrictSection = () => {
  // 4. 현재 페이지 상태 관리 (0 = 첫 페이지)
  const [currentPage, setCurrentPage] = useState(0);
  
  // 5. 한 페이지에 보여줄 아이템 수 (lg 화면 기준 3개)
  const ITEMS_PER_PAGE = 6;
  
  // 6. 총 페이지 수 계산 (총 6개 배너 / 3개씩 = 2 페이지)
  const totalPages = Math.ceil(adBanners.length / ITEMS_PER_PAGE);

  // 7. 이전 페이지로 이동 (마지막 페이지에서 처음으로 순환)
  const prevPage = () => {
    setCurrentPage((current) => (current === 0 ? totalPages - 1 : current - 1));
  };

  // 8. 다음 페이지로 이동 (처음에서 마지막으로 순환)
  const nextPage = () => {
    setCurrentPage((current) => (current === totalPages - 1 ? 0 : current + 1));
  };

  // 9. 현재 페이지에 보여줄 배너만 잘라내기
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentBanners = adBanners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="py-16 bg-white">
      {/* [수정됨] 
        max-w-7xl -> max-w-8xl (지난 요청 사항 반영)
        만약 지난번 요청(너비 늘리기)을 적용하지 않았다면 max-w-7xl로 두셔도 됩니다.
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-semibold text-center text-primary mb-12">
          <p>이런 곳은 어떠신가요?</p>
        </h3>

        {/* 10. [수정됨] 그리드와 버튼을 감싸는 'relative' 컨테이너 추가 */}
        <div className="relative">
          
          {/* 11. [신규] 이전 버튼 */}
          <button
            onClick={prevPage}
            className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-16 bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white rounded-full p-2 shadow-lg transition-colors text-primary z-10"
            aria-label="이전 배너"
          >
            <ChevronLeft size={28} />
          </button>

          {/* 12. [수정됨] adBanners -> currentBanners로 변경 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentBanners.map((ad, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
              >
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <ad.icon className="text-primary mr-2" size={24} />
                    <h4 className="text-xl font-bold text-gray-800">
                      {ad.title}
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                    {ad.description}
                  </p>
                  <a
                    href="#"
                    className="inline-block text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {/* 13. [신규] 다음 버튼 */}
          <button
            onClick={nextPage}
            className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-16 bg-white/80 backdrop-blur-sm hover:bg-primary hover:text-white rounded-full p-2 shadow-lg transition-colors text-primary z-10"
            aria-label="다음 배너"
          >
            <ChevronRight size={28} />
          </button>

        </div> {/* 10. 'relative' 컨테이너 끝 */}
      </div>
    </section>
  );
};

export default DistrictSection; // [수정됨] export 이름 변경