import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UpOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { fetchProducts } from './redux/productsSlice';

// Importojmë Header dhe Footer
import Header from './Header-Footer/Header';
import Footer from './Header-Footer/Footer';

// Importojmë faqet
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetailed from './pages/ProductDetailed';
import Aboutus from './pages/Aboutus';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import ReviewPage from './pages/ReviewPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const AutoScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Hero intro: on the first visit of a browser session (landing on Home), only the
// animated hero shows; header, footer and the rest of the page fade in after it.
const INTRO_SEEN_KEY = 'lemea_intro_seen';
const INTRO_SAFETY_MS = 5000; // never keep the site hidden longer than this
const shouldPlayIntro = (pathname) => {
  if (pathname !== '/') return false;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return !window.sessionStorage.getItem(INTRO_SEEN_KEY);
  } catch {
    return false;
  }
};

function AppContent() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const [introPhase, setIntroPhase] = useState(() =>
    shouldPlayIntro(location.pathname) ? 'playing' : 'done'
  );

  const isAdminPath = location.pathname.startsWith('/admin');

  const endIntro = useCallback(() => {
    setIntroPhase((phase) => (phase === 'playing' ? 'revealing' : phase));
  }, []);

  useEffect(() => {
    if (introPhase === 'playing') {
      try {
        window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
      } catch {
        /* storage unavailable: the intro just plays again next time */
      }
      const safety = setTimeout(endIntro, INTRO_SAFETY_MS);
      return () => clearTimeout(safety);
    }
    if (introPhase === 'revealing') {
      const done = setTimeout(() => setIntroPhase('done'), 1000);
      return () => clearTimeout(done);
    }
    return undefined;
  }, [introPhase, endIntro]);

  // Leaving Home during the intro shows everything right away.
  const introClass =
    introPhase === 'playing' && location.pathname === '/'
      ? ' app-intro-playing'
      : introPhase === 'revealing'
        ? ' app-intro-revealing'
        : '';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col min-h-screen bg-slate-50 font-sans relative${introClass}`}>
      <AutoScrollToTop />
      
      {!isAdminPath && <Header />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home playIntro={introPhase === 'playing'} onIntroDone={endIntro} />} />
          <Route path="/produktet" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/rreth-nesh" element={<Aboutus />} />
          <Route path="/kontakti" element={<Contact />} />
          <Route path="/produktet/:id" element={<ProductDetailed />} /> 
          <Route path="/pagesa" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profili" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/vleresim" element={<ReviewPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}

      {/* BUTONI GLOBALE FLUTURUES - Punon në çdo faqe përveç admin! */}
      {!isAdminPath && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          className={`fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg transition-all duration-300 sm:bottom-8 sm:right-8 ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'
          } hover:bg-pink-600 hover:shadow-pink-300/50`}
        >
          <UpOutlined className="text-xl" />
        </button>
      )}
      
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;