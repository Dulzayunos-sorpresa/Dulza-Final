import React, { memo } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

interface ProductCardProps {
  product: Product;
  index: number;
  onProductClick: (product: Product) => void;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  index, 
  onProductClick,
  priority = false
}) => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const isLowStock = product.stock !== undefined && product.stock < 5 && product.stock > 0;
  
  return (
    <div 
      onClick={() => onProductClick(product)}
      className={`group bg-white dark:bg-dark-surface border border-brand-100/10 dark:border-white/5 rounded-[40px] p-8 flex flex-col transition-all duration-500 hover:border-brand-500/30 dark:hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5 hover:-translate-y-2 cursor-pointer`}
    >
      <div className={`relative aspect-square rounded-[32px] overflow-hidden mb-8 ${theme.heroBg} dark:bg-dark-bg`}>
        <img 
          src={product.image} 
          alt={`Imagen de ${product.name}`} 
          loading={priority ? "eager" : "lazy"}
          width="400"
          height="400"
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        {product.tags?.includes('NUEVO') && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`absolute top-6 left-6 ${theme.secondary} text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg`}
          >
            Nuevo
          </motion.div>
        )}
      </div>
      
      <div className="px-2">
        <h3 className="font-display text-2xl text-texto dark:text-dark-text font-bold mb-2 uppercase tracking-tight">{product.name}</h3>
        <p className="text-xs text-texto/50 dark:text-dark-text-muted mb-8 line-clamp-2 font-medium leading-relaxed">{product.description}</p>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-texto/30 dark:text-dark-text-muted/50">Desde</span>
            <span className={`text-3xl font-display ${theme.primary} font-bold tracking-tighter`}>${(product.price || 0).toLocaleString()}</span>
          </div>
          
          {isLowStock && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full w-fit uppercase tracking-wider"
            >
              <AlertCircle size={14} />
              ¡Últimas {product.stock} unidades!
            </motion.div>
          )}
          
          <button className={`w-full py-4 rounded-full ${theme.heroBg} dark:bg-dark-bg ${theme.primary} text-[10px] font-bold uppercase tracking-[0.2em] transition-all group-hover:${theme.secondary} group-hover:text-white shadow-sm group-hover:shadow-lg group-hover:shadow-brand-500/20`}>
            Pedir este desayuno
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
