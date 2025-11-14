import { X, MapPin, Phone, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Facility } from '../types';

interface FacilityModalProps {
  facility: Facility;
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  'veterinary hospital': '동물병원',
  'pharmacy': '동물약국',
  'beauty salon': '미용샵',
  'cultural center': '문화센터',
  'museum building': '박물관',
  'art museum': '미술관',
  'travel': '여행지',
  'hotel': '위탁관리',
  '펜션': '펜션',
  'shop': '반려동물용품',
  'Korean restaurant': '음식점',
  'café au lait': '카페',
};

const FacilityModal = ({ facility, onClose }: FacilityModalProps) => {
  const navigate = useNavigate();

  console.log('🎨 FacilityModal 렌더링:', facility);

  const handleDetailClick = () => {
    const facilityId = facility.id;
    
    if (!facilityId) {
      alert('시설 ID를 찾을 수 없습니다.');
      return;
    }
    
    navigate(`/facility/${facilityId}`);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="닫기"
        >
          <X size={24} />
        </button>

        {/* 시설 이름 */}
        <h2 className="text-2xl font-bold text-sky-700 mb-2 pr-8">
          {facility.name}
        </h2>
        
        {/* 카테고리 */}
        <p className="text-yellow-600 font-semibold mb-4">
          {categoryLabels[facility.category] || facility.category}
        </p>

        {/* 주소 */}
        <div className="mb-4 flex items-start gap-2">
          <MapPin className="text-sky-500 mt-1 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm text-gray-500">주소</p>
            <p className="text-gray-800">{facility.address}</p>
            <p className="text-gray-600 text-sm">{facility.district}</p>
          </div>
        </div>

        {/* 전화번호 */}
        {facility.phone && (
          <div className="mb-4 flex items-start gap-2">
            <Phone className="text-sky-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">전화번호</p>
              <p className="text-gray-800">{facility.phone}</p>
            </div>
          </div>
        )}

        {/* 운영시간 - Opens/Closes 사용 */}
        {(facility.Opens || facility.Closes) && (
          <div className="mb-4 flex items-start gap-2">
            <Clock className="text-sky-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-500">운영시간</p>
              <p className="text-gray-800">
                {facility.Opens && facility.Closes 
                  ? `${facility.Opens} - ${facility.Closes}`
                  : facility.Opens || facility.Closes || '정보 없음'
                }
              </p>
              {facility.DayOfWeek && (
                <p className="text-gray-600 text-sm">{facility.DayOfWeek}</p>
              )}
            </div>
          </div>
        )}

        {/* 시설 정보 */}
        {facility.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">시설 정보</p>
            <p className="text-gray-700 text-sm">{facility.description}</p>
          </div>
        )}

        {/* 좌표 정보 */}
        <p className="text-xs text-gray-400 mb-4">
          위도: {facility.Latitude} / 경도: {facility.Longitude}
        </p>

        {/* 버튼 영역 */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open(
                `https://map.kakao.com/link/to/${facility.name},${facility.Latitude},${facility.Longitude}`,
                '_blank'
              )
            }
            className="flex-1 bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition-colors font-medium"
          >
            🗺️ 길찾기
          </button>
          <button
            onClick={handleDetailClick}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            📋 자세히 보기
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityModal;
