import React from 'react';
import { 
  XCircle, 
  Video, 
  EyeOff, 
  Eye, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  Save,
  Plus
} from 'lucide-react';
import { Product, Category } from '@/types';

interface ProductModalProps {
  product: Product;
  categories: Category[];
  allProducts: Product[];
  isAdding: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (product: Product) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, isGallery?: boolean) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  allProducts,
  isAdding,
  onClose,
  onSave,
  onChange,
  onImageUpload
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-2xl font-display text-stone-800">
            {isAdding ? 'Nuevo Producto' : `Editar Producto: ${product.name}`}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <XCircle className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={product.name}
                  onChange={(e) => onChange({...product, name: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Categoría</label>
                <input 
                  type="text" 
                  value={product.category}
                  onChange={(e) => onChange({...product, category: e.target.value})}
                  placeholder="Ej: Desayunos Artesanales"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {Array.from(new Set([...allProducts.map(p => p.category), ...categories.map(c => c.name)])).map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Subtítulo (opcional)</label>
                <input 
                  type="text" 
                  value={product.subtitle || ''}
                  onChange={(e) => onChange({...product, subtitle: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Precio ($)</label>
                  <input 
                    type="number" 
                    value={product.price}
                    onChange={(e) => onChange({...product, price: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Precio Anterior (opcional)</label>
                  <input 
                    type="number" 
                    value={product.oldPrice || ''}
                    onChange={(e) => onChange({...product, oldPrice: parseInt(e.target.value) || undefined})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Video URL (YouTube/Vimeo/Directo)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={product.videoUrl || ''}
                    onChange={(e) => onChange({...product, videoUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => onChange({...product, isHidden: !product.isHidden})}
                  className={`p-2 rounded-lg transition-colors ${
                    product.isHidden 
                      ? 'bg-stone-200 text-stone-600' 
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {product.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    {product.isHidden ? 'Producto Oculto' : 'Producto Visible'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {product.isHidden 
                      ? 'Este producto no se mostrará en la tienda.' 
                      : 'Este producto es visible para todos los clientes.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Imagen Principal</label>
                <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
                  {product.image ? (
                    <>
                      <img src={product.image} alt="Vista previa del producto" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-stone-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Cambiar
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-stone-400 hover:text-brand-500">
                      <ImageIcon className="w-12 h-12" />
                      <span className="text-xs font-bold">Subir Imagen</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e)} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Descripción</label>
            <textarea 
              value={product.description}
              onChange={(e) => onChange({...product, description: e.target.value})}
              rows={6}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-stone-600">Galería de Imágenes</label>
              <label className="cursor-pointer text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Añadir a Galería
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e, true)} />
              </label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {product.galleryImages?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-100 group">
                  <img src={img} alt={`Imagen de galería ${idx + 1} para ${product.name}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      const updated = product.galleryImages?.filter((_, i) => i !== idx);
                      onChange({...product, galleryImages: updated});
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave}
            className="flex-[2] bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
