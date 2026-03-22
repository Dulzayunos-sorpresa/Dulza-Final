import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, ChevronRight, ChevronLeft, Check, AlertCircle, Clock, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductOption } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedOptions: Record<string, string[]>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [step, setStep] = useState<number>(-1);

  const productImages = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.galleryImages || [])];
  }, [product]);

  const isNew = product?.tags?.includes('NUEVO');
  const isPopular = product?.tags?.includes('PREMIUM') || product?.tags?.includes('MÁS VENDIDO');

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.price;
    product.options?.forEach(option => {
      const selectedIds = selectedOptions[option.name] || [];
      selectedIds.forEach(valId => {
        const choice = option.values.find(v => v.id === valId || v.name === valId);
        if (choice?.price) price += choice.price;
      });
    });
    return price;
  }, [product, selectedOptions]);

  const isMissingRequired = useMemo(() => {
    if (!product) return false;
    return product.options?.some(option => 
      option.isRequired && (!selectedOptions[option.name] || selectedOptions[option.name].length === 0)
    );
  }, [product, selectedOptions]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions({});
      setCurrentImageIndex(0);
      setStep(-1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!product) return null;

  const handleOptionToggle = (optionName: string, valueId: string, multi: boolean) => {
    setSelectedOptions(prev => {
      const current = prev[optionName] || [];
      if (multi) {
        return {
          ...prev,
          [optionName]: current.includes(valueId)
            ? current.filter(v => v !== valueId)
            : [...current, valueId]
        };
      }
      return {
        ...prev,
        [optionName]: [valueId]
      };
    });
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedOptions);
    onClose();
  };

  const hasOptions = product.options && product.options.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-texto/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-crema rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full text-texto hover:bg-white transition-all shadow-lg active:scale-90"
            >
              <X size={20} />
            </button>

            {/* Left Side: Image Gallery */}
            <div className="w-full md:w-1/2 h-[300px] md:h-auto relative bg-white">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-black/20 backdrop-blur-md rounded-full">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {isNew && (
                  <span className="bg-dorado text-texto text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Nuevo
                  </span>
                )}
                {isPopular && (
                  <span className="bg-naranja text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Más Vendido
                  </span>
                )}
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 flex flex-col bg-crema min-h-0">
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar max-h-full">
                <AnimatePresence mode="wait">
                  {step === -1 ? (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        {product.subtitle && (
                          <div className="flex items-center gap-2 text-dorado">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs font-bold uppercase tracking-widest">{product.subtitle}</span>
                          </div>
                        )}
                        <h2 className="text-3xl sm:text-4xl font-bold text-texto leading-tight">{product.name}</h2>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-naranja">${(product.price || 0).toLocaleString()}</span>
                          {product.oldPrice && (
                            <span className="text-lg text-texto/40 line-through">${product.oldPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 bg-white/50 rounded-2xl border border-naranja/10 space-y-4">
                        <p className="text-texto/70 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-2 text-texto/60 text-xs font-medium">
                            <Clock size={14} className="text-naranja" />
                            <span>Entrega en 24hs</span>
                          </div>
                          <div className="flex items-center gap-2 text-texto/60 text-xs font-medium">
                            <Info size={14} className="text-naranja" />
                            <span>Personalizable</span>
                          </div>
                        </div>
                      </div>

                      {/* Features section removed as it's not in the data model */}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`option-${step}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <button 
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 text-texto/60 hover:text-naranja transition-colors text-xs font-bold uppercase tracking-widest group"
                      >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {step === 0 ? 'Volver a detalles' : 'Anterior'}
                      </button>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-texto">Personalizá tu pedido</h2>
                        <p className="text-texto/60 text-sm">Paso {step + 1} de {product.options?.length || 0}</p>
                      </div>

                      <div className="space-y-10">
                        {product.options && product.options[step] && (
                          <div key={product.options[step].name} className="space-y-5">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-bold text-texto flex items-center gap-2">
                                  {product.options[step].name}
                                  {product.options[step].isRequired && <span className="text-naranja text-[10px] uppercase tracking-widest bg-naranja/10 px-2 py-0.5 rounded-full">Obligatorio</span>}
                                </h3>
                                <p className="text-xs text-texto/50">
                                  {product.options[step].type === 'multi-select' ? 'Podés elegir varios' : 'Elegí una opción'}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {product.options[step].values.map((val) => {
                                const valId = val.id || val.name;
                                const isSelected = selectedOptions[product.options![step].name]?.includes(valId);
                                return (
                                  <button
                                    key={valId}
                                    onClick={() => handleOptionToggle(product.options![step].name, valId, product.options![step].type === 'multi-select')}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group ${
                                      isSelected 
                                        ? 'border-naranja bg-naranja/5 shadow-lg shadow-naranja/5' 
                                        : 'border-naranja/10 bg-white hover:border-naranja/30 hover:bg-naranja/[0.02]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected ? 'bg-naranja border-naranja' : 'border-naranja/20 group-hover:border-naranja/40'
                                      }`}>
                                        {isSelected && <Check size={14} className="text-white" />}
                                      </div>
                                      <span className={`font-medium transition-colors ${isSelected ? 'text-texto' : 'text-texto/70 group-hover:text-texto'}`}>
                                        {val.name}
                                      </span>
                                    </div>
                                    {val.price && (
                                      <span className={`text-sm font-bold ${isSelected ? 'text-naranja' : 'text-texto/40'}`}>
                                        +${val.price.toLocaleString()}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-10 bg-white border-t border-naranja/5 sticky bottom-0 flex flex-col gap-4 z-40">
                {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg w-full justify-center uppercase tracking-wider">
                    <AlertCircle size={14} />
                    ¡Apurate! Solo quedan {product.stock} unidades disponibles.
                  </div>
                )}
                <div className="flex items-center gap-4 w-full">
                  {step === -1 ? (
                    <>
                      <div className="flex items-center bg-crema rounded-full overflow-hidden h-14 shrink-0">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-6 h-full hover:bg-naranja/10 transition-colors text-texto font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-texto text-sm">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-6 h-full hover:bg-naranja/10 transition-colors text-texto font-bold"
                        >
                          +
                        </button>
                      </div>
                      {hasOptions ? (
                        <button 
                          onClick={() => setStep(0)}
                          className="flex-1 bg-texto text-crema h-14 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-texto/90 transition-all shadow-2xl shadow-texto/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                          <span>Elegir adicionales</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={handleAddToCart}
                          className="flex-1 h-14 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 bg-naranja text-white hover:bg-naranja/90 shadow-naranja/30"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Agregar al Carrito · ${((product.price || 0) * quantity).toLocaleString()}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        const currentOption = product.options![step];
                        const isCurrentMissing = currentOption.isRequired && (!selectedOptions[currentOption.name] || selectedOptions[currentOption.name].length === 0);
                        
                        if (isCurrentMissing) {
                          alert('Por favor, completá esta opción obligatoria para continuar.');
                          return;
                        }

                        if (step < product.options!.length - 1) {
                          setStep(step + 1);
                        } else {
                          handleAddToCart();
                        }
                      }}
                      className={`flex-1 h-14 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 bg-naranja text-white hover:bg-naranja/90 shadow-naranja/30`}
                    >
                      {step < product.options!.length - 1 ? (
                        <>
                          <span>Siguiente paso</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Confirmar y Agregar · ${((currentPrice || 0) * quantity).toLocaleString()}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
