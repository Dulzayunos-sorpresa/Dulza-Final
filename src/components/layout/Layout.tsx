import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, loginWithGoogle, logout, uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    // Set manual override flag to prevent automatic time-based switching
    sessionStorage.setItem('dark-mode-manual', 'true');
    // Also store the preference for the current session
    sessionStorage.setItem('dark-mode-preference', isDark ? 'dark' : 'light');
  };

  const cartCount = React.useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const handleScrollToCategory = React.useCallback((e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (categoryId === 'catalog') {
      if (location.pathname.startsWith('/catalogo') || location.pathname === '/') {
        const element = document.getElementById('catalog');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/catalogo');
      }
      return;
    }

    const element = document.getElementById(categoryId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const targetTop = rect.top + window.scrollY - 80;
      
      if (location.pathname !== '/') {
        navigate(`/#${categoryId}`);
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: "smooth"
        });
      }
    } else {
      if (location.pathname !== '/') {
        navigate(`/#${categoryId}`);
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme.bg} dark:bg-dark-bg transition-colors duration-300`}>
      <a href="#main-content" className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] ${theme.secondary} focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:font-bold`}>
        Saltar al contenido principal
      </a>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-3 md:py-4 ${theme.bg}/90 dark:bg-dark-bg/90 backdrop-blur-md border-b ${theme.accent}/10 dark:border-white/5`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex flex-col items-start leading-none group shrink-0" aria-label="Dulzayunos Sorpresa - Inicio">
            <span className={`font-display text-lg md:text-2xl ${theme.primary} font-bold tracking-tighter uppercase`}>
              Dulzayunos
            </span>
            <span className={`text-[9px] md:text-[11px] ${theme.primary} font-bold tracking-[0.2em] uppercase`}>
              Desayunos Reales
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Menú principal">
            <Link to="/" className={`text-[11px] font-semibold text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors uppercase tracking-wider`}>Inicio</Link>
            <Link to="/catalogo" className={`text-[11px] font-semibold text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors uppercase tracking-wider`}>Catálogo</Link>
            <Link to="/personalizados" className={`text-[11px] font-semibold text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors uppercase tracking-wider`}>Personalizados</Link>
            <Link to="/empresas" className={`text-[11px] font-semibold text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors uppercase tracking-wider`}>Empresas</Link>
            <Link to="/nosotros" className={`text-[11px] font-semibold text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors uppercase tracking-wider`}>Nosotros</Link>
          </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleDarkMode}
            className={`p-2 text-texto/70 dark:text-dark-text/70 hover:${theme.primary} transition-colors rounded-full hover:bg-rosa-suave dark:hover:bg-white/5`}
            aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={isDarkMode ? "Modo claro" : "Modo oscuro"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {user ? (
            <div className={`hidden md:flex items-center gap-2 ${theme.bg}/50 dark:bg-white/5 px-2.5 py-1 rounded-full border ${theme.accent}/10 dark:border-white/10`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Foto de perfil'} className={`w-5 h-5 rounded-full border ${theme.accent}/20`} width="20" height="20" loading="lazy" />
              ) : (
                <User className={`w-3.5 h-3.5 ${theme.primary}`} />
              )}
              <span className="text-[9px] font-bold text-texto/60 uppercase tracking-wider max-w-[60px] truncate">
                {user.displayName?.split(' ')[0]}
              </span>
              <button 
                onClick={() => logout()}
                className={`p-1 hover:text-red-500 transition-colors`}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : null}

          <Link to="/carrito" className="relative p-2 text-texto dark:text-dark-text hover:bg-rosa-suave dark:hover:bg-white/5 rounded-full transition-colors group" aria-label={`Ver carrito con ${cartCount} productos`}>
            <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className={`absolute top-0 right-0 flex items-center justify-center min-w-[14px] h-[14px] px-1 text-[8px] font-bold text-white ${theme.secondary} rounded-full`}>
                {cartCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-texto dark:text-dark-text p-2"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
          </button>

          <button 
            onClick={() => navigate('/#catalog')}
            className={`hidden lg:block ${theme.secondary} text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-brand-200 shrink-0`}
            aria-label="Armar mi desayuno personalizado"
          >
            Armar mi desayuno →
          </button>
        </div>
      </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 right-0 ${theme.bg} dark:bg-dark-bg border-b ${theme.accent}/10 dark:border-white/5 p-6 flex flex-col gap-4 md:hidden shadow-xl`}
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Inicio</Link>
              <Link to="/catalogo" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Catálogo</Link>
              <Link to="/personalizados" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Personalizados</Link>
              <Link to="/empresas" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Empresas</Link>
              <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Nosotros</Link>
              
              <div className={`pt-4 border-t ${theme.accent}/10 dark:border-white/5 mt-2`}>
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL && <img src={user.photoURL} alt="Foto de perfil del usuario" className="w-8 h-8 rounded-full" />}
                      <span className="font-bold text-texto dark:text-dark-text">{user.displayName}</span>
                    </div>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className={`${theme.primary} font-bold text-sm uppercase tracking-widest`}>Salir</button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-texto text-crema/50 px-6 md:px-20 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <div className="flex flex-col items-start leading-none mb-6">
                <span className={`font-display text-2xl ${theme.primary} font-bold tracking-tighter uppercase`}>
                  Dulzayunos
                </span>
                <span className={`text-[11px] ${theme.primary} opacity-70 font-bold tracking-[0.2em] uppercase`}>
                  Desayunos Reales
                </span>
              </div>
              <p className="text-sm leading-relaxed text-crema/40">
                {uiContent.hero_subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-12 md:gap-24">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Menú</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Inicio</Link>
                  <Link to="/catalogo" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Catálogo</Link>
                  <Link to="/personalizados" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Personalizados</Link>
                  <Link to="/empresas" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Empresas</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Nosotros</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/nosotros" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Quiénes somos</Link>
                  <Link to="/nosotros" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Cómo trabajamos</Link>
                  <Link to="/nosotros" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Zona de cobertura</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Contacto</h4>
                <div className="flex flex-col gap-2">
                  <a href="https://instagram.com/dulzayunos.sorpresa" target="_blank" rel="noopener noreferrer" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>Instagram</a>
                  <a href="https://wa.me/5493512261245" target="_blank" rel="noopener noreferrer" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>WhatsApp</a>
                  <a href="https://tiktok.com/@dulzayunos" target="_blank" rel="noopener noreferrer" className={`text-sm text-crema/60 hover:${theme.primary} transition-colors`}>TikTok</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-crema/10 text-center text-[10px] tracking-wider uppercase">
            © {new Date().getFullYear()} Dulzayunos Sorpresa · Todos los desayunos artesanales, todas las sorpresas reales.
          </div>
          </div>
        </footer>
    </div>
  );
};

export default Layout;