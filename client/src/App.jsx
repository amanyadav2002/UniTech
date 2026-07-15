import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Institutions from "./pages/Institutions";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <Navbar onOpenAuth={openAuthModal} />

      <Routes>
        <Route path="/" element={<Home onOpenAuth={openAuthModal} />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/students" element={<Students />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}

export default App;