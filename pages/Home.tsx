import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ChevronRight, Eye, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../context/store';
import { ProductCategory, Product } from '../types';
import ProductModal from '../components/ProductModal';
import PainBanner from '../components/PainBanner';
import Moments from '../components/Moments';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Urgency from '../components/Urgency';
import FAQ from '../components/FAQ';

interface ProductCardProps {
  product: Product;
  index: number;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  index, 
  onProductClick 
}) => {
  const isLowStock = product.stock !== undefined && product.stock < 5 && product.stock > 0;
  
  return (
    <div 
      onClick={() => onProductClick(product)}
      className="group bg-white border border-tostado/20 rounded-[32px] p-8 flex flex-col transition-all duration-300 hover:border-tostado hover:shadow-2xl hover:shadow-tostado/10 hover:-translate-y-1 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${(index % 4) * 100}ms` }}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-crema">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        {product.tags?.includes('NUEVO') && (
          <div className="absolute top-4 left-4 bg-tostado text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Nuevo
          </div>
        )}
      </div>
      
      <h3 className="font-display text-xl text-cafe mb-1">{product.name}</h3>
      <p className="text-xs text-gris-calido mb-6 line-clamp-2">{product.description}</p>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-sm text-gris-calido">Desde</span>
          <span className="text-3xl font-display text-cafe">${product.price.toLocaleString()}</span>
        </div>
        
        {isLowStock && (
          <div className="mb-4 flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full w-fit">
            <AlertCircle size={14} />
            ¡Últimas {product.stock} unidades!
          </div>
        )}
        
        <button className="w-full py-3.5 rounded-full bg-crema text-cafe text-sm font-bold transition-all group-hover:bg-tostado group-hover:text-white">
          Pedir este desayuno
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const location = useLocation();

  const rotatingWords = ["Enamoran", "Sorprenden", "Permanecen", "Emocionan", "Conectan"];

  const valentineCategory = ProductCategory.VALENTINE;

  const standardCategories = [
    ProductCategory.BREAKFAST,
    ProductCategory.CAKES_AND_SWEETS,
    ProductCategory.BOARD,
    ProductCategory.KIDS,
    ProductCategory.FOOTBALL
  ];

  const allNavCategories = [valentineCategory, ...standardCategories];

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

  const scrollToCategory = (category: string) => {
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
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="pb-16 relative bg-blanco">
      {/* Hero Section */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-pattern"></div>

        <div className="flex flex-col justify-center px-6 md:px-20 py-20 relative z-10">
          <p className="font-slogan text-[10px] tracking-[2.5px] uppercase text-tostado font-bold mb-6 animate-fade-up">
            Desayunos artesanales a domicilio · Córdoba
          </p>
          <h1 className="text-5xl md:text-7xl font-display text-cafe leading-[1.08] mb-8 animate-fade-up delay-100">
            Se nota<br />que lo<br /><span className="font-slogan text-tostado italic">pensaste.</span>
          </h1>
          <p className="text-lg text-cafe-medio leading-relaxed max-w-md mb-12 font-light animate-fade-up delay-200">
            El desayuno sorpresa que convierte un martes cualquiera en el momento que no se olvida. Sin excusas. Sin fechas. Solo porque sí.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
            <button 
              onClick={() => scrollToCategory('catalog')}
              className="bg-tostado text-white px-10 py-4 rounded-full text-sm font-bold shadow-2xl shadow-tostado/40 hover:bg-cafe transition-all transform hover:-translate-y-1"
            >
              Sorprender ahora
            </button>
            <button 
              onClick={() => scrollToCategory('how-it-works')}
              className="flex items-center gap-2 px-6 py-4 text-cafe-medio text-sm font-medium hover:text-tostado transition-colors"
            >
              Ver cómo funciona <span className="text-lg">↓</span>
            </button>
          </div>

          <div className="mt-16 flex items-center gap-4 animate-fade-up delay-400">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-blanco bg-crema flex items-center justify-center text-xs">
                  {['😊', '🙋', '👩', '🧑'][i-1]}
                </div>
              ))}
            </div>
            <div className="text-xs text-gris-calido leading-tight">
              <strong className="block text-cafe-medio font-bold mb-0.5">+2.400 sorpresas entregadas</strong>
              Este mes ya desayunaron felices en Córdoba
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-gradient-to-br from-crema to-[#EDE0C8] overflow-hidden min-h-[500px]">
          <div className="absolute w-[400px] h-[400px] bg-tostado opacity-10 rounded-full -top-20 -right-20"></div>
          <div className="absolute w-[250px] h-[250px] bg-dorado opacity-10 rounded-full -bottom-10 left-10"></div>

          <div className="relative z-10 animate-scale-in delay-200">
            {/* Floating reaction cards */}
            <div className="absolute -left-12 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float z-20 whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-crema flex items-center justify-center text-base">😭</div>
              <div className="text-[10px] leading-tight">
                <strong className="block text-cafe font-bold">Juli M.</strong>
                "¡No lo puedo creer, llorando!"
              </div>
            </div>

            <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float z-20 whitespace-nowrap" style={{ animationDelay: '1.5s' }}>
              <div className="w-8 h-8 rounded-full bg-crema flex items-center justify-center text-base">🤩</div>
              <div className="text-[10px] leading-tight">
                <strong className="block text-cafe font-bold">Romi A.</strong>
                "El mejor regalo del año"
              </div>
            </div>

            <div className="w-[320px] bg-white rounded-[32px] p-8 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tostado text-white text-[10px] font-bold uppercase tracking-wider px-5 py-1.5 rounded-full whitespace-nowrap">
                ✨ Sorpresa de mañana
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { e: '🥐', l: 'Medialunas' },
                  { e: '☕', l: 'Café' },
                  { e: '🍓', l: 'Frutas' },
                  { e: '🧀', l: 'Quesos' },
                  { e: '🍯', l: 'Mermelada' },
                  { e: '💌', l: 'Tarjeta' }
                ].map((item, i) => (
                  <div key={i} className="bg-crema rounded-xl p-4 text-center transition-transform hover:scale-110">
                    <span className="text-2xl block mb-1">{item.e}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gris-calido font-bold">{item.l}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-tostado/10 text-center">
                <p className="text-[10px] text-gris-calido mb-1">De parte de alguien que lo pensó</p>
                <p className="font-display italic text-cafe text-sm leading-tight">"Se nota que lo pensaste." 🥹</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PainBanner />

      <Moments />

      <div id="how-it-works">
        <HowItWorks />
      </div>

      <Testimonials />

      {/* Catalog Section */}
      <div id="catalog" className="max-w-7xl mx-auto px-6 md:px-20 py-24 scroll-mt-20">
        <p className="text-[10px] tracking-[2.5px] uppercase text-tostado font-bold mb-4">Elegí tu sorpresa</p>
        <h2 className="text-4xl md:text-5xl font-display text-cafe leading-[1.15] mb-6">
          Cada momento<br />tiene su <span className="text-tostado italic">desayuno.</span>
        </h2>
        <p className="text-sm md:text-base text-gris-calido leading-relaxed max-w-lg mb-16 font-light">
          Desde el mimo sencillo hasta la experiencia completa. Todos artesanales. Todos con entrega a la mañana.
        </p>

        {/* Categories Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-8 hide-scrollbar mb-12">
          <button
            onClick={() => setActiveFilter('Todos')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === 'Todos' 
                ? 'bg-tostado text-white shadow-lg shadow-tostado/20' 
                : 'bg-crema text-cafe hover:bg-white hover:shadow-md'
            }`}
          >
            Todos
          </button>
          {allNavCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === category 
                  ? 'bg-tostado text-white shadow-lg shadow-tostado/20' 
                  : 'bg-crema text-cafe hover:bg-white hover:shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Standard Categories */}
        <div className="space-y-32">
          {allNavCategories
            .filter(category => activeFilter === 'Todos' || activeFilter === category)
            .map((category, catIndex) => {
            const categoryProducts = products.filter(p => p.category === category);
            if (categoryProducts.length === 0) return null;

            return (
              <div 
                key={category} 
                id={category} 
                className="scroll-mt-32" 
              >
                <div className="flex items-center gap-6 mb-12">
                  <h3 className="text-3xl font-display text-cafe">{category}</h3>
                  <div className="h-px bg-tostado/10 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryProducts.map((product, prodIndex) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={prodIndex}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Urgency />

      <FAQ />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
