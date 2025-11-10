// frontend/src/pages/LoginPage.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// [수정] Supabase 대신 우리가 만든 useAuth 훅을 가져옵니다.
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  // [수정] 'email' 대신 'username' 상태를 사용합니다.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // [수정] useAuth 훅에서 login 함수를 가져옵니다.
  const { login } = useAuth();

  // [수정] Supabase 로직을 Flask 백엔드 fetch 로직으로 교체
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 우리가 만든 /api/login 엔드포인트 호출
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 로그인 성공
      login(data.access_token); // AuthContext에 토큰 저장
      navigate("/"); // 메인 페이지로 이동

    } catch (err: any) {
      setError("로그인 실패: " + err.message);
    }
  };

  return (
    // UI 부분은 깃허브 버전과 동일 (스타일 유지)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-2xl p-10 w-[380px]"
      >
        <h2 className="text-3xl font-extrabold text-sky-700 mb-6 text-center">
          로그인 🐾
        </h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        
        {/* [수정] 'email' 입력 필드를 'username'으로 변경 */}
        <input
          type="text"
          placeholder="아이디"
          className="border rounded-md w-full p-3 mb-3 focus:ring-2 focus:ring-sky-400 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="비밀번호"
          className="border rounded-md w-full p-3 mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold w-full py-3 rounded-md transition"
          type="submit"
        >
          로그인
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          계정이 없나요?{" "}
          {/* [수정] 깃허브의 /signup 경로를 사용 */}
          <Link
            to="/signup" 
            className="text-sky-600 font-semibold hover:underline"
          >
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}