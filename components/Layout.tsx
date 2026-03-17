import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '../context/store';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart } = useStore();
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
    <div className="min-h-screen flex flex-col font-sans bg-blanco">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-blanco/90 backdrop-blur-md border-b border-tostado/15">
        <Link to="/" className="font-display text-xl text-cafe tracking-tight">
          Dulzayunos <span className="font-slogan text-tostado italic">Sorpresa</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-cafe hover:text-tostado transition-colors">Inicio</Link>
          <a href="/#catalog" onClick={(e) => handleScrollToCategory(e, 'catalog')} className="text-sm font-medium text-cafe hover:text-tostado transition-colors">Catálogo</a>
          <Link to="/personalizados" className="text-sm font-medium text-cafe hover:text-tostado transition-colors">Personalizados</Link>
          <Link to="/empresas" className="text-sm font-medium text-cafe hover:text-tostado transition-colors">Empresas</Link>
          <Link to="/nosotros" className="text-sm font-medium text-cafe hover:text-tostado transition-colors">Nosotros</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/carrito" className="relative p-2 text-cafe hover:bg-crema rounded-full transition-colors group">
            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-tostado rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-cafe p-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <button 
            onClick={() => navigate('/#catalog')}
            className="hidden md:block bg-cafe text-crema px-6 py-2.5 rounded-full text-xs font-medium tracking-wide hover:bg-tostado transition-all transform hover:-translate-y-0.5"
          >
            Armar mi desayuno →
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-blanco border-b border-tostado/10 p-6 flex flex-col gap-4 md:hidden animate-fade-in-down shadow-xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display text-cafe">Inicio</Link>
            <a href="/#catalog" onClick={(e) => handleScrollToCategory(e, 'catalog')} className="text-lg font-display text-cafe">Catálogo</a>
            <Link to="/personalizados" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display text-cafe">Personalizados</Link>
            <Link to="/empresas" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display text-cafe">Empresas</Link>
            <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-display text-cafe">Nosotros</Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-cafe text-crema/50 px-6 md:px-20 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <div className="font-display text-2xl text-crema mb-4">
                Dulzayunos <span className="font-slogan text-tostado italic">Sorpresa</span>
              </div>
              <p className="text-sm leading-relaxed text-crema/40">
                "Se nota que lo pensaste." Transformando momentos cotidianos en recuerdos inolvidables con desayunos artesanales.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 md:gap-24">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Menú</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/" className="text-sm text-crema/60 hover:text-tostado transition-colors">Inicio</Link>
                  <a href="/#catalog" className="text-sm text-crema/60 hover:text-tostado transition-colors">Catálogo</a>
                  <Link to="/personalizados" className="text-sm text-crema/60 hover:text-tostado transition-colors">Personalizados</Link>
                  <Link to="/empresas" className="text-sm text-crema/60 hover:text-tostado transition-colors">Empresas</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Nosotros</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-tostado transition-colors">Quiénes somos</Link>
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-tostado transition-colors">Cómo trabajamos</Link>
                  <Link to="/nosotros" className="text-sm text-crema/60 hover:text-tostado transition-colors">Zona de cobertura</Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[2px] text-crema/30 font-bold">Contacto</h4>
                <div className="flex flex-col gap-2">
                  <a href="https://instagram.com/dulzayunos" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-tostado transition-colors">Instagram</a>
                  <a href="https://wa.me/5493510000000" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-tostado transition-colors">WhatsApp</a>
                  <a href="https://tiktok.com/@dulzayunos" target="_blank" rel="noopener noreferrer" className="text-sm text-crema/60 hover:text-tostado transition-colors">TikTok</a>
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