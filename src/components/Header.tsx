import { Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <h1 className="text-3xl font-bold text-primary">
            {/* [수정됨] 
              <a> 태그에 flex, items-center, gap-2를 추가하고
              <img> 태그를 삽입했습니다.
            */}
            <a
              href="/"
              className="hover:text-primary-dark transition-colors flex items-center"
            >
              <img
                src="/logo.png" // public 폴더의 이미지 경로
                alt="Animalloo Logo"
                className="h-12 w-auto" // 로고 높이를 8 (2rem, 32px)로 설정
              />
              <span>Animalloo</span>
            </a>
          </h1>

          {/* 이 부분에 'items-center'를 추가하여 
            내부 요소(로그인, 회원가입)들의 세로 정렬을 맞춥니다.
          */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#login"
              className="text-gray-700 hover:text-primary font-bold transition-colors"
            >
              로그인
            </a>
            <a
              href="#signup"
              className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md font-medium transition-colors"
            >
              회원가입
            </a>
          </nav>

          <button className="md:hidden p-2 text-gray-700 hover:text-primary ">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;