import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ChevronRight, Eye, Share2, Sparkles, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/context/store';
import { ProductCategory, Product } from '@/types';
import ProductModal from '@/components/product/ProductModal';
import ProductCard from '@/components/product/ProductCard';
import PainBanner from '@/components/home/PainBanner';
import Moments from '@/components/home/Moments';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Urgency from '@/components/home/Urgency';
import FAQ from '@/components/home/FAQ';

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
  const { products, addToCart, categories } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const location = useLocation();

  const rotatingWords = ["Enamoran", "Sorprenden", "Permanecen", "Emocionan", "Conectan"];

  const valentineCategory = ProductCategory.VALENTINE;

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
          const headerOffset = 160;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
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
        if (entry.isIntersecting) {
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
  }, [allNavCategories, products]);

  const scrollToCategory = useCallback((category: string) => {
    const element = document.getElementById(category);
    if (element) {
      const headerOffset = 160;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
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
    <div className="pb-16 relative bg-crema dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-pattern dark:opacity-[0.05]"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center px-6 md:px-20 py-20 relative z-10"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-naranja"></div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-naranja font-bold">
              Desayunos Reales · Córdoba
            </p>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-display text-texto dark:text-dark-text font-bold leading-[0.9] mb-10 uppercase tracking-tighter">
            Se nota<br />que lo<br /><span className="text-naranja">pensaste.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-texto/60 dark:text-dark-text-muted leading-relaxed max-w-md mb-12 font-medium">
            El desayuno sorpresa que convierte un martes cualquiera en el momento que no se olvida. Experiencias diseñadas para emocionar.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
            <button 
              onClick={() => scrollToCategory('catalog')}
              className="bg-naranja text-white px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-naranja/30 hover:bg-naranja/90 transition-all transform hover:-translate-y-1"
            >
              Sorprender ahora
            </button>
            <button 
              onClick={() => scrollToCategory('how-it-works')}
              className="flex items-center gap-3 px-6 py-5 text-texto/60 dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-naranja transition-colors"
            >
              Ver cómo funciona <span className="text-lg">↓</span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-20 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-crema dark:border-dark-bg bg-rosa-suave dark:bg-dark-surface flex items-center justify-center text-lg shadow-sm">
                  {['😊', '🙋', '👩', '🧑'][i-1]}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-texto/40 dark:text-dark-text-muted/40 leading-tight uppercase tracking-widest">
              <strong className="block text-texto dark:text-dark-text font-bold mb-1 text-xs">+2.400 sorpresas reales</strong>
              Entregadas con amor en Córdoba
            </div>
          </motion.div>
        </motion.div>

        <div className="relative flex items-center justify-center bg-rosa-suave/30 dark:bg-dark-surface/30 overflow-hidden min-h-[500px]">
          {/* Geometric Background Elements from Brandbook */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.03 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] bg-naranja rounded-full -top-20 -right-20"
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
              className="absolute -left-16 bottom-24 bg-white dark:bg-dark-surface p-5 rounded-[24px] shadow-2xl flex items-center gap-4 z-20 whitespace-nowrap border border-naranja/5 dark:border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-crema dark:bg-dark-bg flex items-center justify-center text-xl">😭</div>
              <div className="text-[10px] leading-tight uppercase tracking-wider">
                <strong className="block text-texto dark:text-dark-text font-bold mb-0.5">Juli M.</strong>
                "¡No lo puedo creer!"
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-12 top-24 bg-white dark:bg-dark-surface p-5 rounded-[24px] shadow-2xl flex items-center gap-4 z-20 whitespace-nowrap border border-naranja/5 dark:border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-crema dark:bg-dark-bg flex items-center justify-center text-xl">🤩</div>
              <div className="text-[10px] leading-tight uppercase tracking-wider">
                <strong className="block text-texto dark:text-dark-text font-bold mb-0.5">Romi A.</strong>
                "El mejor regalo"
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ rotate: -1, scale: 1.02 }}
              className="w-[360px] bg-white dark:bg-dark-surface rounded-[48px] p-10 shadow-2xl relative border border-naranja/5 dark:border-white/5"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-naranja text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-2.5 rounded-full whitespace-nowrap shadow-xl shadow-naranja/20">
                ✨ Sorpresa Real
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
                    <span className="text-[8px] uppercase tracking-widest text-texto/40 dark:text-dark-text-muted/40 font-bold">{item.l}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 border-t border-naranja/10 dark:border-white/5 text-center">
                <p className="text-[10px] text-texto/30 dark:text-dark-text-muted/30 mb-2 uppercase tracking-widest font-bold">De parte de alguien que lo pensó</p>
                <p className="font-display text-texto dark:text-dark-text font-bold text-lg leading-tight uppercase tracking-tighter">"Se nota que lo pensaste." 🥹</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PainBanner />

      <Moments />

      <div id="how-it-works">
        <HowItWorks />
      </div>

      <Testimonials />

      {/* Catalog Section */}
      <div id="catalog" className="max-w-7xl mx-auto px-6 md:px-20 py-32 scroll-mt-20">
        <div className="flex flex-col items-center text-center mb-20">
          <p className="text-[10px] tracking-[0.3em] uppercase text-naranja font-bold mb-6">Elegí tu sorpresa</p>
          <h2 className="text-5xl md:text-7xl font-display text-texto dark:text-dark-text font-bold leading-[0.9] mb-8 uppercase tracking-tighter">
            Cada momento<br />tiene su <span className="text-naranja">desayuno.</span>
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
              className="w-full px-6 py-3 rounded-full border border-stone-200 dark:border-white/10 bg-white dark:bg-dark-surface text-texto dark:text-dark-text focus:ring-2 focus:ring-naranja outline-none"
            />
          </div>

          {/* Categories Navigation */}
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar w-full justify-start md:justify-center">
            <button
              onClick={() => setActiveFilter('Todos')}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeFilter === 'Todos' 
                  ? 'bg-naranja text-white shadow-xl shadow-naranja/20 scale-105' 
                  : 'bg-white dark:bg-dark-surface text-texto/50 dark:text-dark-text-muted hover:bg-crema dark:hover:bg-white/5 hover:text-naranja'
              }`}
            >
              Todos
            </button>
            {allNavCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeFilter === category 
                    ? 'bg-naranja text-white shadow-xl shadow-naranja/20 scale-105' 
                    : 'bg-white dark:bg-dark-surface text-texto/50 dark:text-dark-text-muted hover:bg-crema dark:hover:bg-white/5 hover:text-naranja'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Categories */}
        <div className="space-y-40">
          {filteredCatalog.map((item) => (
            <div 
              key={item.category} 
              id={item.category} 
              className="scroll-mt-32" 
            >
              <div className="flex items-center gap-8 mb-16">
                <h3 className="text-4xl font-display text-texto dark:text-dark-text font-bold uppercase tracking-tighter">{item.category}</h3>
                <div className="h-px bg-naranja/10 dark:bg-white/5 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {item.products.map((product, prodIndex) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={prodIndex}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Urgency />

      <FAQ />

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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-naranja text-white px-6 py-3 rounded-full shadow-2xl shadow-naranja/30 font-bold text-sm tracking-wider flex items-center gap-2"
          >
            <Check size={16} />
            ¡Pedido añadido al carrito!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
