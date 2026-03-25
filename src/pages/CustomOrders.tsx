import React, { useState } from 'react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';
import { ProductCategory, Product } from '@/types';
import { ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import ProductModal from '@/components/product/ProductModal';

const CustomOrders: React.FC = () => {
  const { products, addToCart, uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter only Custom Box products and sort by price
  const customProducts = products
    .filter(p => p.category === ProductCategory.CUSTOM_BOX && !p.isHidden)
    .sort((a, b) => a.price - b.price);

  return (
    <div className={`${theme.bg} min-h-screen pb-32 animate-fade-in`}>
      {/* Header */}
      <div className={`${theme.heroBg} py-24 px-6 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-pattern"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-up">
          <p className={`text-[10px] tracking-[2.5px] uppercase ${theme.primary} font-bold mb-6`}>
            {theme.emoji} Crea tu Regalo Ideal
          </p>
          <h1 className={`text-5xl md:text-6xl font-display ${theme.text} leading-[1.1] mb-8`}>
            Armalo a <span className={`${theme.primary} italic`}>tu gusto.</span>
          </h1>
          <p className={`text-lg ${theme.text} opacity-70 leading-relaxed max-w-2xl mx-auto font-light`}>
            {uiContent.custom_order_text}
          </p>
        </div>
      </div>

      {/* Product Selection */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {customProducts.map((product, idx) => (
            <div 
              key={product.id}
              className={`bg-white dark:bg-dark-surface rounded-[32px] shadow-xl shadow-brand-200/5 overflow-hidden border border-brand-100/5 dark:border-white/5 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col group animate-fade-up`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className={`relative aspect-[4/5] overflow-hidden ${theme.heroBg}`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className={`absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold ${theme.primary} shadow-lg text-xs`}>
                   Desde ${product.price.toLocaleString()}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h3 className={`text-xl font-display ${theme.text} dark:text-dark-text mb-6 group-hover:${theme.primary} transition-colors`}>
                  {product.name}
                </h3>
                
                <div className="space-y-4 mb-10 flex-1">
                  {product.id === 'personalizado-bebe-custom' ? (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>Peluche personalizable</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>Opciones exclusivas para bebés</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>Nombre del recién nacido</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>
                          {product.id === 'petit-balloon' ? 'Caja redonda y dedicatoria' : 'Base personalizable con visor'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>3 Comestibles artesanales</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.text} opacity-70 dark:text-dark-text-muted text-sm font-light`}>Infusión y bebida incluida</span>
                      </div>
                    </>
                  )}
                  {product.name.includes("Grand") && (
                     <div className="flex items-start gap-3">
                        <Sparkles className={`h-4 w-4 ${theme.primary} mt-0.5 flex-shrink-0`} />
                        <span className={`${theme.primary} font-bold text-xs uppercase tracking-widest`}>Detalles premium</span>
                     </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full ${theme.secondary} text-white py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-brand-200/20 flex items-center justify-center gap-2`}
                >
                  <span>Comenzar a Armar</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Handles the Wizard Flow internally based on product category */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(product, quantity, options) => {
          const formattedOptions = Object.entries(options).map(([optionName, values]) => {
            const option = product.options?.find(o => o.name === optionName);
            return {
              optionId: option?.id || optionName,
              values: values
            };
          });
          addToCart(product.id, quantity, formattedOptions);
        }}
      />
    </div>
  );
};

export default CustomOrders;
