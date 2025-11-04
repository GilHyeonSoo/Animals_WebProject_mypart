import { Building, Droplet, Store, PawPrint, Sun, MapPin } from 'lucide-react';

// 광고 배너에 사용할 샘플 데이터
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
];

const AdSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-semibold text-center text-primary mb-12">
        <p>이런 곳은 어떠신가요?</p>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {adBanners.map((ad, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
            >
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <ad.icon className="text-primary mr-2" size={24} />
                  <h4 className="text-xl font-bold text-gray-800">{ad.title}</h4>
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
      </div>
    </section>
  );
};

export default AdSection;