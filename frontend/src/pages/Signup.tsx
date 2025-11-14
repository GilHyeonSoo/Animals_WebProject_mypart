import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      alert("회원가입 성공! 로그인해주세요.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100">
      <form onSubmit={handleSignup} className="bg-white shadow-lg rounded-2xl p-10 w-[380px]">
        <h2 className="text-3xl font-extrabold text-sky-700 mb-6 text-center">회원가입</h2>
        
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        
        <input
          type="text"
          placeholder="아이디"
          className="border rounded-md w-full p-3 mb-3 focus:ring-2 focus:ring-sky-400 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          className="border rounded-md w-full p-3 mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold w-full py-3 rounded-md transition"
          type="submit"
        >
          회원가입
        </button>
        
        <p className="text-sm text-center mt-4 text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-sky-600 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
