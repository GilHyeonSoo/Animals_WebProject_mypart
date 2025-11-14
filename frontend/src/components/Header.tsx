import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { token, logout } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUsername(null);
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/api/profile", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.nickname || data.username);
        } else {
          setUsername(null);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        setUsername(null);
      }
    };

    loadUser();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-2xl font-bold text-sky-600 flex items-center gap-2 hover:text-sky-700 transition"
        >
          <img src="/logo.png" alt="Animalloo" className="h-16 w-auto" />
          Animalloo
        </Link>

        <nav className="flex items-center gap-5">
          {username ? (
            <>
              <span className="text-gray-700 font-medium">
                <span className="text-sky-600">{username}</span>님 환영합니다!
              </span>
              <Link to="/mypage" className="text-sky-600 font-semibold hover:underline">
                마이페이지
              </Link>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sky-600 font-semibold hover:underline">
                로그인
              </Link>
              <Link to="/signup" className="px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
