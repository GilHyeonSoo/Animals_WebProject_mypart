import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/LoginPage";
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import SearchPage from "./pages/SearchPage";
import FacilityDetail from "./pages/FacilityDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;