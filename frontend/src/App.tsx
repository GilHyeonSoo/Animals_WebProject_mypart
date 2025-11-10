// frontend/src/App.tsx
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom'; // 라우터의 페이지 컨텐츠가 표시될 위치

function App() {
  // 모든 state와 로직은 HomePage.tsx로 이동했습니다.
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header는 모든 페이지에 공통으로 표시됨 */}
      <Header />
      
      {/* 메인 컨텐츠 영역 
        <Outlet /> 자리에 HomePage, LoginPage, RegisterPage가
        URL에 따라 번갈아 표시됩니다.
      */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer도 모든 페이지에 공통으로 표시됨 */}
      <Footer />
    </div>
  );
}

export default App;