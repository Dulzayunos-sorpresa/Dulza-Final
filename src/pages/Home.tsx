import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, Eye, Share2, Sparkles, AlertCircle, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/context/store';
import { ProductCategory, Product } from '@/types';
import { getTheme } from '@/utils/themes';
import ProductModal from '@/components/product/ProductModal';
import ProductCard from '@/components/product/ProductCard';

// Lazy load below-the-fold components
const PainBanner = lazy(() => import('@/components/home/PainBanner'));
const MoodBanner = lazy(() => import('@/components/home/MoodBanner'));
const Moments = lazy(() => import('@/components/home/Moments'));
const HowItWorks = lazy(() => import('@/components/home/HowItWorks'));
const Testimonials = lazy(() => import('@/components/home/Testimonials'));
const Urgency = lazy(() => import('@/components/home/Urgency'));
const FAQ = lazy(() => import('@/components/home/FAQ'));

const LoadingFallback = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  return <div className={`h-32 flex items-center justify-center ${theme.primary} opacity-20`}>...</div>;
};

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const { products, addToCart, categories, uiContent, shippingSettings } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const location = useLocation();

  const rotatingWords = ["Permanecen", "Sorprenden", "Conectan", "Enamoran", "Emocionan"];

  const valentineCategory = ProductCategory.VALENTINE;

  const specialCategory = useMemo(() => {
    if (!shippingSettings.specialCategoryId) return null;
    return categories.find(c => c.id === shippingSettings.specialCategoryId);
  }, [categories, shippingSettings.specialCategoryId]);

  useEffect(() => {
    if (categorySlug) {
      const category = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug);
      if (category) {
        setActiveFilter(category.name);
        // Scroll to catalog after a short delay to ensure rendering
        setTimeout(() => {
          const element = document.getElementById('catalog');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (location.pathname.startsWith('/catalogo')) {
      setActiveFilter('Todos');
    }
  }, [categorySlug, categories, location.pathname]);

  const handleFilterChange = (catName: string) => {
    setActiveFilter(catName);
    const slug = catName === 'Todos' ? '' : catName.toLowerCase().replace(/\s+/g, '-');
    if (slug) {
      navigate(`/catalogo/${slug}`);
    } else {
      navigate('/');
    }
  };

  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    
    // 1. Add categories from the categories state (usually from Firestore)
    if (categories && categories.length > 0) {
      categories.forEach(c => cats.add(c.name));
    }
    
    // 2. ALWAYS add categories from products to ensure they show up in navigation
    // even if they are not explicitly in the categories collection (common with mock data)
    products.forEach(p => {
      if (p.category && 
          p.category !== ProductCategory.VALENTINE && 
          p.category !== ProductCategory.CUSTOM_BOX) {
        cats.add(p.category);
      }
    });
    
    return Array.from(cats);
  }, [products, categories]);

  const allNavCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add(valentineCategory);
    dynamicCategories.forEach(cat => cats.add(cat));
    return Array.from(cats);
  }, [valentineCategory, dynamicCategories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const targetTop = rect.top + window.scrollY - 160;
          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });
          setActiveCategory(hash);
        }, 300);
      }
    }
  }, [location]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-160px 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && activeCategory !== entry.target.id) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    allNavCategories.forEach((category) => {
      const element = document.getElementById(category);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [allNavCategories, activeCategory]);

  const scrollToCategory = useCallback((category: string) => {
    const element = document.getElementById(category);
    if (element) {
      const rect = element.getBoundingClientRect();
      const targetTop = rect.top + window.scrollY - 160;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
      setActiveCategory(category);
    }
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleAddToCart = useCallback((product: Product, quantity: number, options: Record<string, string[]>) => {
    // Convert Record<string, string[]> to { optionId: string; values: string[] }[]
    const formattedOptions = Object.entries(options).map(([optionName, values]) => {
      const option = product.options?.find(o => o.name === optionName);
      return {
        optionId: option?.id || optionName,
        values: values
      };
    });
    addToCart(product.id, quantity, formattedOptions);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [addToCart]);

  const filteredCatalog = useMemo(() => {
    return allNavCategories
      .filter(category => activeFilter === 'Todos' || activeFilter === category)
      .map((category) => {
        const categoryProducts = products.filter(p => 
          (p.category === category) && 
          !p.isHidden && 
          (p.stock === undefined || p.stock > 0) &&
          (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return { category, products: categoryProducts };
      })
      .filter(item => item.products.length > 0);
  }, [allNavCategories, activeFilter, products, searchQuery]);

  return (
    <div className={`pb-16 relative ${theme.bg} dark:bg-dark-bg transition-colors duration-300`}>
      {/* Hero Section */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-pattern dark:opacity-[0.05]"></div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center px-6 md:px-20 py-20 relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className={`h-px w-8 ${theme.secondary}`}></div>
            <p className={`text-[11px] tracking-[0.3em] uppercase ${theme.primary} font-bold`}>
              {theme.emoji} Desayunos Reales · Córdoba
            </p>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display text-texto dark:text-dark-text font-bold leading-[0.9] mb-10 uppercase tracking-tighter">
            Regalá momentos que<br />
            <span className="relative inline-block h-[1.1em] overflow-hidden align-top">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className={`block ${theme.primary}`}
                >
                  {rotatingWords[wordIndex]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          
          <p className="text-lg text-texto/60 dark:text-dark-text-muted leading-relaxed max-w-md mb-12 font-medium">
            Desayunos artesanales que sorprenden y conectan corazones en toda Córdoba.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => scrollToCategory('catalog')}
              className={`${theme.secondary} text-white px-12 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-brand-200 hover:opacity-90 transition-all transform hover:-translate-y-1`}
              aria-label="Sorprender ahora con un desayuno"
            >
              Sorprender ahora
            </button>
            <button 
              onClick={() => scrollToCategory('how-it-works')}
              className={`flex items-center gap-3 px-6 py-5 text-texto/60 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest hover:${theme.primary} transition-colors`}
            >
              Ver cómo funciona <span className="text-lg">↓</span>
            </button>
          </div>

          <div className="mt-20 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-crema dark:border-dark-bg bg-rosa-suave dark:bg-dark-surface flex items-center justify-center text-lg shadow-sm">
                  {['😊', '🙋', '👩', '🧑'][i-1]}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-texto/60 dark:text-dark-text-muted leading-tight uppercase tracking-widest">
              <strong className="block text-texto dark:text-dark-text font-bold mb-1 text-xs">+2.400 sorpresas reales</strong>
              Entregadas con amor en Córdoba
            </div>
          </div>
        </motion.div>

        <div className={`relative flex items-center justify-center ${theme.heroBg} dark:bg-dark-surface/30 overflow-hidden min-h-[500px]`}>
          {/* Geometric Background Elements from Brandbook */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.03 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute w-[500px] h-[500px] ${theme.secondary} rounded-full -top-20 -right-20`}
          ></motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute w-[300px] h-[300px] bg-dorado rotate-45 -bottom-10 left-10"
          ></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10"
          >
            {/* Floating reaction cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -left-16 bottom-24 bg-white dark:bg-dark-surface p-5 rounded-[24px] shadow-2xl flex items-center gap-4 z-20 whitespace-nowrap border border-brand-100/5 dark:border-white/5`}
            >
              <div className="w-10 h-10 rounded-full bg-crema dark:bg-dark-bg flex items-center justify-center text-xl">😭</div>
              <div className="text-[11px] leading-tight uppercase tracking-wider">
                <strong className="block text-texto dark:text-dark-text font-bold mb-0.5">Juli M.</strong>
                "¡No lo puedo creer!"
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -right-12 top-24 bg-white dark:bg-dark-surface p-5 rounded-[24px] shadow-2xl flex items-center gap-4 z-20 whitespace-nowrap border border-brand-100/5 dark:border-white/5`}
            >
              <div className="w-10 h-10 rounded-full bg-crema dark:bg-dark-bg flex items-center justify-center text-xl">🤩</div>
              <div className="text-[11px] leading-tight uppercase tracking-wider">
                <strong className="block text-texto dark:text-dark-text font-bold mb-0.5">Romi A.</strong>
                "El mejor regalo"
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ rotate: -1, scale: 1.02 }}
              className={`w-[360px] bg-white dark:bg-dark-surface rounded-[48px] p-10 shadow-2xl relative border ${theme.accent} dark:border-white/5`}
            >
              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 ${theme.secondary} text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-2.5 rounded-full whitespace-nowrap shadow-xl shadow-brand-200`}>
                {theme.emoji} Sorpresa Real
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { e: '🥐', l: 'Artesanal' },
                  { e: '☕', l: 'Premium' },
                  { e: '🍓', l: 'Fresco' },
                  { e: '🧀', l: 'Gourmet' },
                  { e: '🍯', l: 'Casero' },
                  { e: '💌', l: 'Personal' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.1, backgroundColor: "#FCF3EA" }}
                    className="bg-crema dark:bg-dark-bg rounded-2xl p-5 text-center transition-all"
                  >
                    <span className="text-3xl block mb-2">{item.e}</span>
                    <span className="text-[10px] uppercase tracking-widest text-texto/60 dark:text-dark-text-muted font-bold">{item.l}</span>
                  </motion.div>
                ))}
              </div>

              <div className={`pt-8 border-t border-brand-100/10 dark:border-white/5 text-center`}>
                <p className="text-[11px] text-texto/50 dark:text-dark-text-muted mb-2 uppercase tracking-widest font-bold">De parte de alguien que lo pensó</p>
                <p className="font-display text-texto dark:text-dark-text font-bold text-lg leading-tight uppercase tracking-tighter">"Se nota que lo pensaste." 🥹</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<LoadingFallback />}>
        <MoodBanner />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <PainBanner />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <Moments />
      </Suspense>

      <div id="how-it-works">
        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <Testimonials />
      </Suspense>

      {/* Catalog Section */}
      <div id="catalog" className="max-w-7xl mx-auto px-6 md:px-20 py-32 scroll-mt-20">
        <div className="flex flex-col items-center text-center mb-20">
          <p className={`text-[11px] tracking-[0.3em] uppercase ${theme.primary} font-bold mb-6`}>Elegí tu sorpresa</p>
          <h2 className="text-5xl md:text-7xl font-display text-texto dark:text-dark-text font-bold leading-[0.9] mb-8 uppercase tracking-tighter">
            Cada momento<br />tiene su <span className={theme.primary}>desayuno.</span>
          </h2>
          <p className="text-lg text-texto/50 dark:text-dark-text-muted leading-relaxed max-w-lg font-medium">
            Desde el mimo sencillo hasta la experiencia completa. Todos artesanales. Todos reales.
          </p>
        </div>

        {/* Search and Categories Navigation */}
        <div className="flex flex-col gap-8 mb-16 items-center">
          {/* Search Bar */}
          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar desayuno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-6 py-3 rounded-full border border-stone-200 dark:border-white/10 bg-white dark:bg-dark-surface text-texto dark:text-dark-text focus:ring-2 ${theme.primary} outline-none`}
            />
          </div>

          {/* Categories Navigation */}
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar w-full justify-start md:justify-center">
            <button
              onClick={() => navigate('/catalogo')}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                !categorySlug 
                  ? `${theme.secondary} text-white shadow-xl shadow-brand-200 scale-105` 
                  : `bg-white dark:bg-dark-surface text-texto/50 dark:text-dark-text-muted hover:bg-crema dark:hover:bg-white/5 hover:${theme.primary}`
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/catalogo/${category.slug}`)}
                className={`whitespace-nowrap px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  categorySlug === category.slug
                    ? `${theme.secondary} text-white shadow-xl shadow-brand-200 scale-105` 
                    : category.id === shippingSettings.specialCategoryId
                      ? 'bg-dorado/10 text-dorado border border-dorado/20 hover:bg-dorado/20'
                      : `bg-white dark:bg-dark-surface text-texto/50 dark:text-dark-text-muted hover:bg-crema dark:hover:bg-white/5 hover:${theme.primary}`
                }`}
              >
                {category.id === shippingSettings.specialCategoryId && (
                  <Star className={`h-3 w-3 ${categorySlug === category.slug ? 'fill-white' : 'fill-dorado text-dorado'}`} />
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Categories */}
        <div className="space-y-40">
          {filteredCatalog.map((item, itemIndex) => (
            <div 
              key={item.category} 
              id={item.category} 
              className="scroll-mt-32" 
            >
              <div className="flex items-center gap-8 mb-16">
                <h3 className="text-4xl font-display text-texto dark:text-dark-text font-bold uppercase tracking-tighter">{item.category}</h3>
                <div className={`h-px ${theme.heroBg} opacity-10 dark:bg-white/5 flex-1`}></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {item.products.map((product, prodIndex) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={prodIndex}
                    onProductClick={handleProductClick}
                    priority={itemIndex === 0 && prodIndex < 3}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <Urgency />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <FAQ />
      </Suspense>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 ${theme.secondary} text-white px-6 py-3 rounded-full shadow-2xl shadow-brand-500/30 font-bold text-sm tracking-wider flex items-center gap-2`}
          >
            <Check size={16} />
            ¡Pedido añadido al carrito!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
