import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      login(data.access_token);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      <form onSubmit={handleLogin} className="bg-white shadow-lg rounded-2xl p-10 w-[380px]">
        <h2 className="text-3xl font-extrabold text-sky-700 mb-6 text-center">로그인</h2>
        
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
          placeholder="비밀번호"
          className="border rounded-md w-full p-3 mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold w-full py-3 rounded-md transition"
          type="submit"
        >
          로그인
        </button>
        
        <p className="text-sm text-center mt-4 text-gray-600">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-sky-600 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}