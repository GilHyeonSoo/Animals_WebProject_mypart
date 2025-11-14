// frontend/src/router.tsx

import { createBrowserRouter } from 'react-router-dom';

// ... (App, HomePage 등 import) ...
import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/Signup.tsx';
import SearchPage from './pages/SearchPage.tsx';
import MyPage from './pages/MyPage.tsx';

// [수정] 이 줄 맨 앞에 "export" 키워드가 있는지 확인하세요.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      // ... (나머지 경로들) ...
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/mypage',
        element: <MyPage />,
      },
    ],
  },
]);