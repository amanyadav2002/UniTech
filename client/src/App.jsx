import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Institutions from "./pages/Institutions";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

function App() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [authModalRole, setAuthModalRole] = useState("student");

  const openAuthModal = (tab = "login", role = "student") => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const isStudentLoggedIn = user && user.role === "student";
  const isFacultyLoggedIn = user && user.role === "faculty";
  const isAnyDashboardLoggedIn = isStudentLoggedIn || isFacultyLoggedIn;

  // If a token exists and we are still fetching user details, show a premium loader
  const token = localStorage.getItem("token");
  if (token && loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <p className="text-slate-600 font-semibold animate-pulse">Loading UniTech Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAnyDashboardLoggedIn && <Navbar onOpenAuth={openAuthModal} />}

      <Routes>
        {isStudentLoggedIn && (
          <>
            <Route path="/students" element={<Students onOpenAuth={openAuthModal} />} />
            <Route path="*" element={<Navigate to="/students" replace />} />
          </>
        )}
        {isFacultyLoggedIn && (
          <>
            <Route path="/faculty" element={<Faculty onOpenAuth={openAuthModal} />} />
            <Route path="*" element={<Navigate to="/faculty" replace />} />
          </>
        )}
        {!isAnyDashboardLoggedIn && (
          <>
            <Route path="/" element={<Home onOpenAuth={openAuthModal} />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/students" element={<Students onOpenAuth={openAuthModal} />} />
            <Route path="/faculty" element={<Faculty onOpenAuth={openAuthModal} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>

      {!isAnyDashboardLoggedIn && <Footer />}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        defaultRole={authModalRole}
      />
    </>
  );
}

export default App;