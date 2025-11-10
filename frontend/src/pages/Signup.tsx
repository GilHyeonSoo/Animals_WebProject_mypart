// frontend/src/pages/Signup.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// [수정] Supabase import 삭제

export default function Signup() {
  const navigate = useNavigate();
  // [수정] 'email' 대신 'username' 상태를 사용합니다.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // 회원가입 성공 메시지

  // [수정] Supabase 로직을 Flask 백엔드 fetch 로직으로 교체
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 우리가 만든 /api/register 엔드포인트 호출
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공
      setSuccess("회원가입 완료! 로그인해주세요 🐶");
      setTimeout(() => {
        navigate("/login"); // 로그인 페이지로 이동
      }, 3000);

    } catch (err: any) {
      setError("회원가입 실패: " + err.message);
    }
  };

  return (
    // UI 부분은 깃허브 버전과 동일 (스타일 유지)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-lg rounded-2xl p-10 w-[380px]"
      >
        <h2 className="text-3xl font-extrabold text-sky-700 mb-6 text-center">
          회원가입 🐾
        </h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}
        
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
          회원가입
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          이미 계정이 있나요?{" "}
          <Link
            to="/login"
            className="text-sky-600 font-semibold hover:underline"
          >
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}