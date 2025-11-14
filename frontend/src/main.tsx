// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { RouterProvider } from 'react-router-dom';

// [수정] App과 페이지 컴포넌트 import를 모두 삭제합니다.

// [수정] router.tsx 파일에서 router 객체를 가져옵니다.
import { router } from './router.tsx';

// [삭제] createBrowserRouter(...) 정의 코드를 삭제합니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <AuthProvider>
      {/* router 변수는 이제 router.tsx에서 가져온 것입니다. */}
      <RouterProvider router={router} /> 
    </AuthProvider>
  // </React.StrictMode>,
)