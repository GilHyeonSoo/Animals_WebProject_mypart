import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { Facility } from "../types";

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/facilities/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFacility(data);
        }
      } catch (error) {
        console.error("시설 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (!facility) {
    return <div className="min-h-screen flex items-center justify-center">시설을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* 상단 타이틀 */}
      <section className="pt-28 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 shadow-sm pb-6">
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-sky-700">{facility.name}</h1>
            <p className="text-yellow-700 font-semibold mt-1">{facility.category}</p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 transition"
          >
            목록으로
          </Link>
        </div>
      </section>

      {/* 본문 */}
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 - 대표 이미지 */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <img
            src={facility.imageurl}
            alt={facility.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-5 space-y-2 text-sm">
            <p><strong>주소:</strong> {facility.address}</p>
            <p><strong>전화번호:</strong> {facility.phone}</p>
            <p>
              <strong>홈페이지:</strong>{" "}
              <a
                href={facility.website}
                target="_blank"
                className="text-sky-600 hover:underline"
              >
                {facility.website}
              </a>
            </p>
          </div>
        </div>

        {/* 오른쪽 - 카드형 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 설명 */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-sky-700 mb-3">시설 설명</h2>
            <p className="text-gray-700">{facility.description}</p>
          </div>

          {/* 기본 정보 */}
          <Card title="기본 정보" items={[
            ["도로명", facility.address],
            ["우편번호", facility.postalcode],
            ["위도", facility.Latitude],
            ["경도", facility.Longitude],
          ]} />

          {/* 반려동물 정책 */}
          <Card title="반려동물 정책" items={[
            ["동반 가능 여부", facility.PetFriendly],
            ["전용 시설", facility.PetExclusiveInfo],
            ["입장 가능 크기", facility.PetSizeLimit],
            ["제한 사항", facility.PetRestrictions],
            ["추가 요금", facility.PetExtraFee],
          ]} />

          {/* 운영 정보 */}
          <Card title="운영 정보" items={[
            ["운영 요일", facility.DayOfWeek],
            ["오픈 시간", facility.Opens],
            ["마감 시간", facility.Closes],
            ["휴무일", facility.HolidayInfo],
            ["주차 가능 여부", facility.ParkingAvailable],
            ["입장료", facility.AdmissionFeeInfo],
            ["실내 여부", facility.IsIndoor],
            ["실외 여부", facility.IsOutdoor],
          ]} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: [string, any][] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-sky-700 mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {items.map(([label, value], idx) => (
          <div key={idx} className="flex justify-between border-b py-1">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-800">{value || "정보 없음"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
