// frontend/src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
// [수정] RegisterPage 대신 SignupPage를 임포트 (파일 이름 일치)
import SignupPage from './pages/Signup.tsx';
// [신규] 깃허브에 새로 추가된 SearchPage 임포트
import SearchPage from './pages/SearchPage.tsx';
import MyPage from './pages/MyPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      // [수정] /register 경로를 /signup으로 변경
      {
        path: '/signup', 
        element: <SignupPage />,
      },
      // [신규] /search 경로 추가
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)