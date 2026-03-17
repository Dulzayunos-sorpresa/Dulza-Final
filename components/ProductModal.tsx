import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/store';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [step, setStep] = useState<'info' | 'options'>('info');

  // Gallery logic
  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const galleryItems = [
    ...(product.videoUrl ? [{ type: 'video', url: product.videoUrl }] : []),
    ...images.map(img => ({ type: 'image', url: img }))
  ];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const renderVideo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return (
        <iframe 
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return (
        <iframe 
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video src={url} controls className="w-full h-full object-cover" />
    );
  };

  const handleOptionToggle = (optionId: string, valueName: string, type: 'select' | 'multi-select', maxSelections?: number) => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      if (type === 'select') {
        return { ...prev, [optionId]: [valueName] };
      } else {
        if (current.includes(valueName)) {
          return { ...prev, [optionId]: current.filter(v => v !== valueName) };
        } else {
          if (maxSelections && current.length >= maxSelections) {
            return prev;
          }
          return { ...prev, [optionId]: [...current, valueName] };
        }
      }
    });
  };

  const calculateOptionsPrice = () => {
    if (!product.options) return 0;
    let totalAdjustment = 0;
    product.options.forEach(option => {
      const selectedValues = selectedOptions[option.id] || [];
      selectedValues.forEach(valName => {
        const val = option.values.find(v => v.name === valName);
        if (val?.price) totalAdjustment += val.price;
      });
    });
    return totalAdjustment;
  };

  const currentPrice = product.price + calculateOptionsPrice();
  
  const handleAddToCart = () => {
    // Check for required options
    if (product.options) {
      const missingRequired = product.options.filter(opt => opt.isRequired && (!selectedOptions[opt.id] || selectedOptions[opt.id].length === 0));
      if (missingRequired.length > 0) {
        alert(`Por favor, seleccioná las opciones obligatorias: ${missingRequired.map(o => o.name).join(', ')}`);
        return;
      }
    }

    const optionsToSave = (Object.entries(selectedOptions) as [string, string[]][])
      .filter(([_, values]) => values.length > 0)
      .map(([optionId, values]) => ({
        optionId,
        values
      }));

    addToCart(product.id, quantity, optionsToSave);
    onClose();
  };

  const hasOptions = product.options && product.options.length > 0;
  
  const isMissingRequired = product.options?.some(opt => opt.isRequired && (!selectedOptions[opt.id] || selectedOptions[opt.id].length === 0));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-cafe/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-blanco w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-scale-in">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-2 bg-blanco/80 rounded-full hover:bg-crema transition-colors shadow-sm"
        >
          <X className="h-6 w-6 text-cafe" />
        </button>

        {/* Image Section */}
        <div className={`w-full md:w-1/2 bg-crema relative h-[30vh] md:h-auto group overflow-hidden ${step === 'options' ? 'hidden md:block' : 'block'}`}>
            <div 
              className="flex h-full transition-transform duration-500 ease-out" 
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {galleryItems.map((item, idx) => (
                <div key={idx} className="min-w-full h-full relative">
                  {item.type === 'video' ? (
                    renderVideo(item.url)
                  ) : (
                    <img 
                      src={item.url} 
                      alt={`${product.name} - ${idx + 1}`} 
                      loading="lazy"
                      className="relative w-full h-full object-cover z-10"
                    />
                  )}
                </div>
              ))}
            </div>
            
            {galleryItems.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-blanco/40 backdrop-blur-md rounded-full text-cafe hover:bg-blanco transition-all opacity-0 group-hover:opacity-100 shadow-md z-20"><ChevronLeft className="h-6 w-6" /></button>
                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-blanco/40 backdrop-blur-md rounded-full text-cafe hover:bg-blanco transition-all opacity-0 group-hover:opacity-100 shadow-md z-20"><ChevronRight className="h-6 w-6" /></button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {galleryItems.map((_, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all shadow-sm cursor-pointer ${idx === currentImageIndex ? 'bg-tostado w-6' : 'bg-blanco/80 hover:bg-blanco w-1.5'}`} 
                    />
                  ))}
                </div>
              </>
            )}
        </div>

        {/* Content Section */}
        <div className={`w-full ${step === 'options' ? 'md:w-full' : 'md:w-1/2'} flex flex-col overflow-y-auto h-[60vh] md:h-auto bg-blanco transition-all duration-300`}>
          <div className="p-8 sm:p-12 flex-1">
             {step === 'info' ? (
               <div className="animate-fade-in">
                  <div className="mb-8">
                     <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-4">{product.category}</p>
                     <h2 className="text-3xl sm:text-4xl font-display text-cafe leading-tight mb-4">{product.name}</h2>
                     <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-display text-cafe">${product.price.toLocaleString()}</span>
                        {product.oldPrice && <span className="text-cafe-medio/40 line-through text-lg font-light">${product.oldPrice.toLocaleString()}</span>}
                     </div>
                  </div>

                  <p className="text-cafe-medio leading-relaxed mb-10 whitespace-pre-line text-sm font-light">
                     {product.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-crema rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-blanco flex items-center justify-center text-lg">🥐</div>
                      <div className="text-xs text-cafe-medio leading-tight">
                        <strong className="block text-cafe font-bold mb-0.5">Fresco y artesanal</strong>
                        Hecho hoy mismo para entregar mañana.
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-crema rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-blanco flex items-center justify-center text-lg">💌</div>
                      <div className="text-xs text-cafe-medio leading-tight">
                        <strong className="block text-cafe font-bold mb-0.5">Tarjeta personalizada</strong>
                        Incluida en todos los desayunos.
                      </div>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="animate-fade-in">
                  <div className="flex items-center gap-6 mb-12">
                    <button 
                      onClick={() => setStep('info')}
                      className="p-3 hover:bg-crema rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6 text-cafe" />
                    </button>
                    <div>
                      <p className="text-[10px] uppercase tracking-[2.5px] text-tostado font-bold mb-1">Paso 2 de 2</p>
                      <h2 className="text-2xl font-display text-cafe">Personalizá tu regalo</h2>
                    </div>
                  </div>

                  {/* Options Rendering */}
                  {product.options && (
                    <div className="space-y-10 pb-10">
                      {product.options.map(option => (
                        <div key={option.id} className="space-y-4">
                          <div className="border-b border-tostado/10 pb-3">
                            <h3 className="text-lg font-medium text-cafe mb-1 flex items-center gap-2">
                              {option.name}
                              {option.isRequired && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Obligatorio</span>}
                            </h3>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-cafe-medio/70">{option.description || (option.isRequired ? 'Seleccioná al menos una opción' : 'Opcional')}</p>
                              {option.maxSelections && (
                                <span className="text-[10px] uppercase tracking-wider text-tostado font-medium bg-crema px-2 py-0.5 rounded-md">
                                  Máx {option.maxSelections}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {option.values.map(val => {
                              const isSelected = (selectedOptions[option.id] || []).includes(val.name);
                              return (
                                <button
                                  key={val.name}
                                  onClick={() => handleOptionToggle(option.id, val.name, option.type, option.maxSelections)}
                                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left group relative overflow-hidden ${isSelected ? 'bg-cafe border-cafe shadow-md' : 'bg-blanco border-tostado/20 hover:border-tostado hover:shadow-sm'}`}
                                >
                                  <div className="flex flex-col pr-4">
                                    <span className={`text-sm font-medium ${isSelected ? 'text-crema' : 'text-cafe'}`}>{val.name}</span>
                                    {val.stock !== undefined && val.stock <= 5 && (
                                      <span className="text-[10px] text-tostado font-medium mt-0.5">¡Últimos {val.stock}!</span>
                                    )}
                                  </div>
                                  {val.price !== undefined && val.price !== 0 && (
                                    <span className={`text-xs font-medium shrink-0 ${isSelected ? 'text-crema' : 'text-cafe-medio group-hover:text-tostado'}`}>
                                      +${val.price.toLocaleString()}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             )}
          </div>

          <div className="p-6 sm:p-10 bg-blanco border-t border-tostado/5 sticky bottom-0 flex flex-col gap-4 z-40">
             {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
               <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg w-full justify-center">
                 <AlertCircle size={14} />
                 ¡Apurate! Solo quedan {product.stock} unidades disponibles.
               </div>
             )}
             <div className="flex items-center gap-4 w-full">
               {step === 'info' ? (
                 <>
                   <div className="flex items-center bg-crema rounded-full overflow-hidden h-14 shrink-0">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-6 h-full hover:bg-tostado/10 transition-colors text-cafe font-bold"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-cafe text-sm">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-6 h-full hover:bg-tostado/10 transition-colors text-cafe font-bold"
                      >
                        +
                      </button>
                   </div>
                   {hasOptions ? (
                     <button 
                       onClick={() => setStep('options')}
                       className="flex-1 bg-cafe text-crema h-14 rounded-full font-bold text-sm hover:bg-tostado transition-all shadow-2xl shadow-cafe/20 active:scale-95 flex items-center justify-center gap-3"
                     >
                        <span>Elegir adicionales</span>
                        <ChevronRight className="h-4 w-4" />
                     </button>
                   ) : (
                     <button 
                       onClick={handleAddToCart}
                       disabled={isMissingRequired}
                       className={`flex-1 h-14 rounded-full font-bold text-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isMissingRequired ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-tostado text-white hover:bg-cafe shadow-tostado/30'}`}
                     >
                        <ShoppingCart className="h-4 w-4" />
                        <span>{isMissingRequired ? 'Completá las opciones obligatorias' : `Agregar al Carrito · $${(product.price * quantity).toLocaleString()}`}</span>
                     </button>
                   )}
                 </>
               ) : (
                 <button 
                   onClick={handleAddToCart}
                   disabled={isMissingRequired}
                   className={`flex-1 h-14 rounded-full font-bold text-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isMissingRequired ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-tostado text-white hover:bg-cafe shadow-tostado/30'}`}
                 >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{isMissingRequired ? 'Completá las opciones obligatorias' : `Confirmar y Agregar · $${(currentPrice * quantity).toLocaleString()}`}</span>
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
