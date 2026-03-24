import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider } from '@/context/store';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { trackPageView } from '@/utils/analytics';

// Page tracker component
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

// Dark Mode Manager
const DarkModeManager = () => {
  useEffect(() => {
    // Check if user has already manually toggled in this session
    const manualPreference = sessionStorage.getItem('dark-mode-preference');
    if (manualPreference) {
      if (manualPreference === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return;
    }

    const checkTime = () => {
      // Get current time in Argentina (UTC-3)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const artTime = new Date(utc + (3600000 * -3));
      const hour = artTime.getHours();

      // Night mode from 19:00 to 07:00
      const isNight = hour >= 19 || hour < 7;
      
      if (isNight) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    checkTime();
    // We only check once on mount to avoid fighting the user's manual toggle
    // unless the app is reloaded.
  }, []);

  return null;
};

// Lazy loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Cart = lazy(() => import('@/pages/Cart'));
const About = lazy(() => import('@/pages/About'));
const Corporate = lazy(() => import('@/pages/Corporate'));
const CustomOrders = lazy(() => import('@/pages/CustomOrders'));
const Admin = lazy(() => import('@/pages/Admin'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tostado"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/empresas" element={<Corporate />} />
            <Route path="/personalizados" element={<CustomOrders />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const scriptId = 'google-maps-script';
    if (apiKey && !document.getElementById(scriptId) && !(window as any).google) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PageTracker />
        <DarkModeManager />
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;