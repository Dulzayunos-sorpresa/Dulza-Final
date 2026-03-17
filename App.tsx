import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/store';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

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

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/empresas" element={<Corporate />} />
              <Route path="/personalizados" element={<CustomOrders />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;