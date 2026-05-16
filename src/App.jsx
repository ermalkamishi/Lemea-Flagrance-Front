import React, { useState, useEffect } from 'react';
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

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const dispatch = useDispatch();

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
    <Router>
      <AutoScrollToTop />

      <div className="flex flex-col min-h-screen bg-slate-900 font-sans relative">
        
        <Header />
        
        <main className="flex-grow bg-slate-50">
          <Routes>
            <Route path="/" element={<Home />} />
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

        <Footer />

        {/* BUTONI GLOBALE FLUTURUES - Punon në çdo faqe! */}
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
        
      </div>
    </Router>
  );
}

export default App;