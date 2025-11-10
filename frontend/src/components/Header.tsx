// frontend/src/components/Header.tsx

import { useState } from 'react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';

// [신규] 4-A 단계에서 만든 useAuth 훅을 가져옵니다.
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // [신규] <Link> 태그 import


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // [신규] AuthContext에서 로그인 상태와 로그아웃 함수를 가져옵니다.
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center"> {/* [수정] */}
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Animalloo logo"
              />
              <span className="ml-2 text-xl font-bold text-primary">
                Animalloo
              </span>
            </Link> {/* [수정] */}
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {/* [신규] 로그인 상태에 따라 버튼 변경 */}
            {isLoggedIn ? (
              // [수정] 로그인 시 마이페이지 + 로그아웃 버튼 표시
              <div className="flex items-center space-x-4">
                <Link
                  to="/mypage"
                  className="flex items-center text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User size={18} className="mr-1" />
                  마이페이지
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} className="mr-1" />
                  로그아웃
                </button>
              </div>
            ) : (
              // 로그아웃 상태 (동일)
              <Link
                to="/login"
                className="flex items-center bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <LogIn size={18} className="mr-1" />
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 (드롭다운) */}
      {isOpen && (
        <div className="md:hidden shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* [신규] 모바일에서도 로그인 상태에 따라 버튼 변경 */}
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left flex items-center text-gray-600 hover:text-primary px-3 py-2 rounded-md text-base font-medium"
                >
                  <User size={18} className="mr-1" />
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left flex items-center bg-red-500 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} className="mr-1" />
                  로그아웃
                </button>
              </>
            ) : (
              // 로그아웃 상태 (동일)
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-left flex items-center bg-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
              >
                <LogIn size={18} className="mr-1" />
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;