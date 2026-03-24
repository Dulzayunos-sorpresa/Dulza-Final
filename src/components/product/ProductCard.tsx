import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Product } from '@/types';

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
  const isLowStock = product.stock !== undefined && product.stock < 5 && product.stock > 0;
  
  return (
    <motion.div 
      layout
      initial={priority ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={priority ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: priority ? 0 : (index % 3) * 0.1 }}
      onClick={() => onProductClick(product)}
      className="group bg-white dark:bg-dark-surface border border-naranja/10 dark:border-white/5 rounded-[40px] p-8 flex flex-col transition-all duration-500 hover:border-naranja/30 dark:hover:border-naranja/30 hover:shadow-2xl hover:shadow-naranja/5 hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative aspect-square rounded-[32px] overflow-hidden mb-8 bg-crema dark:bg-dark-bg">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.8 }}
          src={product.image} 
          alt={`Imagen de ${product.name}`} 
          loading={priority ? "eager" : "lazy"}
          width="400"
          height="400"
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full"
        />
        {product.tags?.includes('NUEVO') && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-6 left-6 bg-naranja text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg"
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
            <span className="text-3xl font-display text-naranja font-bold tracking-tighter">${(product.price || 0).toLocaleString()}</span>
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
          
          <button className="w-full py-4 rounded-full bg-crema dark:bg-dark-bg text-naranja text-[10px] font-bold uppercase tracking-[0.2em] transition-all group-hover:bg-naranja group-hover:text-white shadow-sm group-hover:shadow-lg group-hover:shadow-naranja/20">
            Pedir este desayuno
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
