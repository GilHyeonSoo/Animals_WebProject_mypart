// frontend/src/pages/MyPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// [수정] Supabase 대신 우리가 만든 useAuth 훅을 가져옵니다.
import { useAuth } from "../contexts/AuthContext";

export default function MyPage() {
  const navigate = useNavigate();
  // [수정] AuthContext에서 토큰과 로그아웃 함수를 가져옵니다.
  const { token, logout } = useAuth();
  // [수정] email 대신 username을 저장할 상태
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // [수정] Supabase.auth.getUser() 대신
  // Flask 백엔드의 /api/protected 엔드포인트에서 사용자 정보를 가져옵니다.
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 보냅니다.
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // /api/protected는 auth.py에 정의되어 있으며,
        // 유효한 토큰을 보내면 { "logged_in_as": "username" }을 반환합니다.
        const response = await fetch("http://localhost:5001/api/protected", {
          method: "GET",
          headers: {
            // [중요] JWT 토큰을 헤더에 담아 보냅니다.
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // 토큰이 만료되었거나 유효하지 않으면
          throw new Error("인증 실패");
        }

        const data = await response.json();
        setUsername(data.logged_in_as); // 'logged_in_as' 키로 username이 옵니다.

      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        logout(); // 에러 발생 시 강제 로그아웃
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, navigate, logout]); // 의존성 배열 추가

  // [수정] Supabase.auth.signOut 대신
  // AuthContext의 logout 함수를 사용합니다.
  const handleLogout = () => {
    logout();
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    // UI 부분은 깃허브 버전과 동일 (스타일 유지)
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-sky-700 mb-8 text-center">
          My Page 🐾
        </h2>

        {/* 내 정보 섹션 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            내 정보
          </h3>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-24 font-medium text-gray-500">아이디</span>
              {/* [수정] email 대신 username 표시 */}
              <span className="text-gray-900">{username || "로딩 중..."}</span>
            </div>
            {/* (참고: email이 없으므로 email 필드는 제거) */}
          </div>
        </div>

        {/* 나의 펫 정보 (임시 하드코딩) */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            나의 펫 정보 (예시)
          </h3>
          <div className="bg-sky-50 p-4 rounded-lg text-gray-700">
            <p className="font-medium">🐾 이름: 멍멍이</p>
            <p>🐶 견종: 골든 리트리버</p>
            <p>🎂 나이: 3살</p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold w-full py-3 rounded-md transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}