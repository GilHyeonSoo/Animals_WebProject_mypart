import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import { Search } from "lucide-react";

export default function SearchPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 상단 고정 헤더 (메인과 동일) */}
      <Header />

      <section className="pt-28 pb-12 text-center px-4">
        <h1 className="text-3xl font-bold text-sky-700 mb-3">
          🔍 검색 결과
        </h1>
        <p className="text-gray-600 mb-8">
          “<span className="text-sky-600 font-semibold">{query}</span>” 에 대한 결과를 보여드릴게요!
        </p>

        {/* 🔹 임시: 검색 결과 없을 때 안내 */}
        <div className="max-w-xl mx-auto bg-white border rounded-2xl shadow-md py-10 px-6">
          <Search className="mx-auto text-sky-500 mb-3" size={48} />
          <p className="text-gray-700 text-lg font-medium">
            아직 검색 결과가 없습니다 
          </p>
          <p className="text-gray-500 text-sm mt-1">
            (UI만 표시 중이에요)
          </p>

          <Link
            to="/"
            className="inline-block mt-6 text-sky-600 hover:underline font-semibold"
          >
            ← 메인 페이지로 돌아가기
          </Link>
        </div>
      </section>
    </div>
  );
}
