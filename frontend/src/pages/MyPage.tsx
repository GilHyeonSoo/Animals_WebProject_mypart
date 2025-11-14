import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MyPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  
  const [loginId, setLoginId] = useState<string>("");  // ⬅️ 로그인 ID (변경 불가)
  const [nickname, setNickname] = useState<string>("");  // ⬅️ 닉네임 (변경 가능)
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ 사용자 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        
        // 프로필 정보 가져오기
        const response = await fetch("http://localhost:5001/api/profile", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("인증 실패");

        const data = await response.json();
        setLoginId(data.username);  // ⬇️ 로그인 ID
        setNickname(data.nickname);  // ⬇️ 닉네임
        setProfilePic(data.profile_url || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png");
        
        if (data.favorite_hospitals?.length > 0) {
          setFavorites([]);
        }

      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, navigate, logout]);

  // ✅ 프로필 사진 업로드
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/api/profile/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("업로드 실패");

      const data = await response.json();
      setProfilePic(data.profile_url);
      alert("프로필 사진이 변경되었습니다!");
    } catch (error) {
      alert("업로드 실패: " + error);
    }
  };

  // ✅ 닉네임 변경
  const handleNicknameChange = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
    
    try {
      const response = await fetch("http://localhost:5001/api/profile/nickname", {  // ⬅️ URL 변경
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),  // ⬅️ nickname으로 변경
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      alert("닉네임이 변경되었습니다!");
    } catch (error: any) {
      alert("닉네임 변경 실패: " + error.message);
    }
  };

  // ✅ 비밀번호 변경
  const handlePasswordChange = async () => {
    if (newPassword.length < 6)
      return alert("비밀번호는 최소 6자 이상이어야 합니다.");
    
    try {
      const response = await fetch("http://localhost:5001/api/profile/password", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      alert("비밀번호가 변경되었습니다!");
      setNewPassword("");
    } catch (error: any) {
      alert("비밀번호 변경 실패: " + error.message);
    }
  };

  // ✅ 로그아웃
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-sky-600">
        로딩 중...
      </div>
    );

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center py-12">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[480px] text-center">
        <h2 className="text-2xl font-bold text-sky-600 mb-6">마이페이지</h2>

        {/* 프로필 */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={profilePic || ""}
              alt="프로필"
              className="w-28 h-28 rounded-full border-4 border-sky-200 object-cover"
            />
            <label className="absolute bottom-1 right-1 bg-sky-500 text-white rounded-full p-1 cursor-pointer hover:bg-sky-600">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              📷
            </label>
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-800">
            {nickname}  {/* ⬅️ 닉네임 표시 */}
          </p>
          <p className="text-gray-500 text-sm">@{loginId}</p>  {/* ⬅️ 로그인 ID 표시 */}
        </div>

        {/* 즐겨찾기 병원 */}
        <div className="mt-8 border-t pt-4 text-left">
          <h3 className="text-lg font-bold text-sky-700 mb-3">
            즐겨찾는 병원 🏥
          </h3>
          {favorites.length ? (
            <ul className="space-y-2">
              {favorites.map((h) => (
                <li
                  key={h.id}
                  className="p-3 border rounded-lg hover:bg-sky-50 transition"
                >
                  <p className="font-semibold text-gray-800">{h.name}</p>
                  <p className="text-sm text-gray-600">{h.address}</p>
                  <span className="text-xs text-sky-500">{h.category}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">
              아직 즐겨찾은 병원이 없습니다.
            </p>
          )}
        </div>

        {/* 닉네임 변경 */}
        <div className="mt-6 border-t pt-4 text-left">
          <h3 className="text-lg font-bold text-sky-700 mb-2">
            닉네임 변경 ✏️
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}  
              onChange={(e) => setNickname(e.target.value)}
              className="flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-400"
              placeholder="새 닉네임 입력"
            />
            <button
              onClick={handleNicknameChange}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 rounded-md text-sm"
            >
              변경
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="mt-6 border-t pt-4 text-left">
          <h3 className="text-lg font-bold text-sky-700 mb-2">
            비밀번호 변경 🔒
          </h3>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 입력"
              className="flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 rounded-md text-sm"
            >
              변경
            </button>
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 w-full py-2 rounded-md"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
