import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/HomePage";  // ⬅️ HomePage → Home
import Login from "./pages/LoginPage";  // ⬅️ LoginPage → Login
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import SearchPage from "./pages/SearchPage";
import FacilityDetail from "./pages/FacilityDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/mypage",
    element: <MyPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/facility/:id",
    element: <FacilityDetail />,
  },
]);
