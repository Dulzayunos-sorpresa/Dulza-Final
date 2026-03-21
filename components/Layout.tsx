import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/store';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, loginWithGoogle, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleScrollToCategory = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${categoryId}`);
    } else {
      const element = document.getElementById(categoryId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-crema">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-crema/90 backdrop-blur-md border-b border-naranja/10">
        <Link to="/" className="flex flex-col items-start leading-none group">
          <span className="font-display text-xl md:text-2xl text-naranja font-bold tracking-tighter uppercase">
            Dulzayunos
          </span>
          <span className="text-[8px] md:text-[10px] text-dorado font-medium tracking-[0.2em] uppercase">
            Desayunos Reales
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xs font-semibold text-texto/70 hover:text-naranja transition-colors uppercase tracking-wider">Inicio</Link>
          <a href="/#catalog" onClick={(e) => handleScrollToCategory(e, 'catalog')} className="text-xs font-semibold text-texto/70 hover:text-naranja transition-colors uppercase tracking-wider">Catálogo</a>
          <Link to="/personalizados" className="text-xs font-semibold text-texto/70 hover:text-naranja transition-colors uppercase tracking-wider">Personalizados</Link>
          <Link to="/empresas" className="text-xs font-semibold text-texto/70 hover:text-naranja transition-colors uppercase tracking-wider">Empresas</Link>
          <Link to="/nosotros" className="text-xs font-semibold text-texto/70 hover:text-naranja transition-colors uppercase tracking-wider">Nosotros</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-3 bg-crema/50 px-3 py-1.5 rounded-full border border-naranja/10">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Foto de perfil'} className="w-6 h-6 rounded-full border border-naranja/20" />
              ) : (
                <User className="w-4 h-4 text-naranja" />
              )}
              <span className="text-[10px] font-bold text-texto/60 uppercase tracking-wider max-w-[80px] truncate">
                {user.displayName?.split(' ')[0]}
              </span>
              <button 
                onClick={() => logout()}
                className="p-1 hover:text-naranja transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => loginWithGoogle()}
              className="hidden md:flex items-center gap-2 text-[10px] font-bold text-texto/60 uppercase tracking-widest hover:text-naranja transition-colors"
            >
              <User className="w-4 h-4" />
              Ingresar
            </button>
          )}

          <Link to="/carrito" className="relative p-2 text-texto hover:bg-rosa-suave rounded-full transition-colors group">
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-naranja rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-texto p-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

            <button 
              onClick={() => navigate('/#catalog')}
              className="hidden md:block bg-naranja text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-naranja/90 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-naranja/20"
            >
              Armar mi desayuno →
            </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-crema border-b border-naranja/10 p-6 flex flex-col gap-4 md:hidden shadow-xl"
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto uppercase tracking-tight">Inicio</Link>
              <a href="/#catalog" onClick={(e) => handleScrollToCategory(e, 'catalog')} className="text-lg font-display font-bold text-texto uppercase tracking-tight">Catálogo</a>
              <Link to="/personalizados" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto uppercase tracking-tight">Personalizados</Link>
              <Link to="/empresas" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto uppercase tracking-tight">Empresas</Link>
              <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display font-bold text-texto uppercase tracking-tight">Nosotros</Link>
              
              <div className="pt-4 border-t border-naranja/10 mt-2">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL && <img src={user.photoURL} alt="Foto de perfil del usuario" className="w-8 h-8 rounded-full" />}
                      <span className="font-bold text-texto">{user.displayName}</span>
                    </div>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-naranja font-bold text-sm uppercase tracking-widest">Salir</button>
                  </div>
                ) : (
                  <button onClick={() => { loginWithGoogle(); setIsMobileMenuOpen(false); }} className="w-full bg-naranja text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Ingresar con Google</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-texto text-crema/50 px-6 md:px-20 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-start leading-none mb-6"
              >
                <span className="font-display text-2xl text-naranja font-bold tracking-tighter uppercase">
                  Dulzayunos
                </span>
                <span className="text-[10px] text-dorado font-medium tracking-[0.2em] uppercase">
                  Desayunos Reales
                </span>
              </motion.div>
              <p className="text-sm leading-relaxed text-crema/40">
                "Se nota que lo pensaste." Transformando momentos cotidianos en recuerdos inolvidables con desayunos artesanales y experiencias reales.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 md:gap-24">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Menú</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/" className="text-sm text-crema/60 hover:text-naranja transition-colors">Inicio</Link>
                  <a href="/#catalog" className="text-sm text-crema/60 hover:text-naranja transition-colors">Catálogo</a>
                  <Link to="/personalizados" className="text-sm text-crema/60 hover:text-naranja transition-colors">Personalizados</Link>
                  <Link to="/empresas" className="text-sm text-crema/60 hover:text-naranja transition-colors">Empresas</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Nosotros</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-naranja transition-colors">Quiénes somos</Link>
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-naranja transition-colors">Cómo trabajamos</Link>
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-naranja transition-colors">Zona de cobertura</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Contacto</h4>
                <div className="flex flex-col gap-2">
                  <a href="https://instagram.com/dulzayunos.sorpresa" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-naranja transition-colors">Instagram</a>
                  <a href="https://wa.me/5493512261245" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-naranja transition-colors">WhatsApp</a>
                  <a href="https://tiktok.com/@dulzayunos" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-naranja transition-colors">TikTok</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-crema/10 text-center text-[10px] tracking-wider uppercase">
            © {new Date().getFullYear()} Dulzayunos Sorpresa · Todos los desayunos artesanales, todas las sorpresas reales.
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Layout;