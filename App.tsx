import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider } from './context/store';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { trackPageView } from './src/utils/analytics';

// Page tracker component
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const About = lazy(() => import('./pages/About'));
const Corporate = lazy(() => import('./pages/Corporate'));
const CustomOrders = lazy(() => import('./pages/CustomOrders'));
const Admin = lazy(() => import('./pages/Admin'));

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
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PageTracker />
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;