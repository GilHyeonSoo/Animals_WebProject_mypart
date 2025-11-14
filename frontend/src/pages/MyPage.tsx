import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MyPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ⬅️ useAuth에서 토큰 가져오기
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log("🔑 현재 토큰:", token); // 디버깅용
      
      if (!token) {
        console.log("❌ 토큰 없음, 로그인 페이지로 이동");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch("http://localhost:5001/api/protected", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // ⬅️ 토큰 전달
          },
        });

        console.log("📡 응답 상태:", response.status);

        if (!response.ok) {
          throw new Error("인증 실패");
        }

        const data = await response.json();
        console.log("✅ 받은 데이터:", data);
        setUsername(data.logged_in_as);

      } catch (error) {
        console.error("❌ 사용자 정보 로드 실패:", error);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-sky-700 mb-8 text-center">
          My Page 🐾
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            내 정보
          </h3>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-24 font-medium text-gray-500">아이디</span>
              <span className="text-gray-900">{username || "로딩 중..."}</span>
            </div>
          </div>
        </div>

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
