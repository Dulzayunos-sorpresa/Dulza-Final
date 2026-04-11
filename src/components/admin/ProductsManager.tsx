import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Download, 
  Upload, 
  Plus, 
  EyeOff, 
  Eye, 
  Edit, 
  Settings2,
  XCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useStore } from '@/context/store';
import { Product, ProductOption } from '@/types';
import { trackEvent, AnalyticsEvents } from '@/utils/analytics';
import ProductModal from './ProductModal';

interface ProductRowProps {
  product: Product;
  updateStock: (id: string, stock: number) => void;
  updateProduct: (product: Product) => void;
  setEditingProduct: (product: Product) => void;
  setLinkingProductOptions: (product: Product) => void;
}

const ProductRow: React.FC<ProductRowProps> = React.memo(({ 
  product, 
  updateStock, 
  updateProduct, 
  setEditingProduct, 
  setLinkingProductOptions 
}) => {
  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
          <span className="font-medium text-stone-800">{product.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">{product.category}</span>
      </td>
      <td className="px-6 py-4 font-medium text-stone-700">${product.price.toLocaleString()}</td>
      <td className="px-6 py-4">
        <input 
          type="number" 
          value={product.stock ?? 0}
          onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
          className={`w-20 px-2 py-1 border rounded-lg text-center font-bold ${
            (product.stock ?? 0) < 10 ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-700'
          }`}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateProduct({ ...product, isHidden: !product.isHidden })}
            className={`p-2 rounded-lg transition-colors ${
              product.isHidden 
                ? 'bg-stone-100 text-stone-400 hover:bg-stone-200' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={product.isHidden ? 'Mostrar al cliente' : 'Ocultar al cliente'}
          >
            {product.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            product.isHidden ? 'text-stone-400' : 'text-emerald-600'
          }`}>
            {product.isHidden ? '(OCULTO)' : '(ACTIVO)'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {product.options?.map(opt => (
            <span key={opt.id} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100">
              {opt.name}
            </span>
          )) || <span className="text-[10px] text-stone-400">Sin opciones</span>}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => setEditingProduct(product)}
            className="text-stone-400 hover:text-brand-500 p-1 transition-colors"
            title="Editar detalles"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setLinkingProductOptions(product)}
            className="text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" />
            Vincular
          </button>
        </div>
      </td>
    </tr>
  );
});

const ProductsManager: React.FC = () => {
  const { 
    products, 
    categories, 
    options,
    updateStock, 
    updateProduct, 
    addProduct,
    updateProductOptions 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [linkingProductOptions, setLinkingProductOptions] = useState<Product | null>(null);

  const filteredProducts = React.useMemo(() => products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  const handleExportProducts = React.useCallback(() => {
    const data = products.map(p => ({
      ID: p.id,
      Nombre: p.name,
      Subtítulo: p.subtitle || '',
      Categoría: p.category,
      Precio: p.price,
      Precio_Anterior: p.oldPrice || '',
      Stock: p.stock || 0,
      Visible: !p.isHidden ? 'SÍ' : 'NO',
      Descripción: p.description,
      Imagen: p.image,
      Envío_Gratis: p.freeDelivery ? 'SÍ' : 'NO'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "productos_completo.xlsx");
    trackEvent(AnalyticsEvents.EXPORT_EXCEL, { type: 'products', count: products.length });
  }, [products]);

  const handleImportProducts = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        for (const row of data) {
          const productData: Product = {
            id: row.ID || Math.random().toString(36).substr(2, 9),
            name: row.Nombre,
            subtitle: row.Subtítulo || '',
            category: row.Categoría,
            price: parseFloat(row.Precio) || 0,
            oldPrice: row.Precio_Anterior ? parseFloat(row.Precio_Anterior) : undefined,
            stock: parseInt(row.Stock) || 0,
            isHidden: row.Visible === 'NO',
            description: row.Descripción || '',
            image: row.Imagen || '',
            freeDelivery: row.Envío_Gratis === 'SÍ'
          };
          
          await addProduct(productData);
        }
        trackEvent(AnalyticsEvents.IMPORT_EXCEL, { type: 'products', count: data.length });
        toast.success(`${data.length} productos importados/actualizados correctamente`);
      } catch (error) {
        console.error('Error importing products:', error);
        toast.error('Error al importar el archivo Excel');
      }
    };
    reader.readAsBinaryString(file);
  }, [addProduct]);

  const handleImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isGallery) {
          const currentGallery = editingProduct.galleryImages || [];
          setEditingProduct({
            ...editingProduct,
            galleryImages: [...currentGallery, base64String]
          });
        } else {
          setEditingProduct({
            ...editingProduct,
            image: base64String
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }, [editingProduct]);

  const handleSaveProduct = React.useCallback(async () => {
    if (editingProduct) {
      if (isAddingProduct) {
        await addProduct(editingProduct);
      } else {
        await updateProduct(editingProduct);
      }
      setEditingProduct(null);
      setIsAddingProduct(false);
    }
  }, [editingProduct, isAddingProduct, addProduct, updateProduct]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={handleExportProducts}
              className="bg-white text-stone-600 border border-stone-200 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm"
              title="Exportar a Excel"
            >
              <Download className="w-5 h-5" />
              <span className="hidden md:inline">Exportar</span>
            </button>
            <label className="bg-white text-stone-600 border border-stone-200 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all shadow-sm cursor-pointer" title="Importar desde Excel">
              <Upload className="w-5 h-5" />
              <span className="hidden md:inline">Importar</span>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleImportProducts} 
                className="hidden" 
              />
            </label>
            <button 
              onClick={() => {
                setEditingProduct({
                  id: Math.random().toString(36).substr(2, 9),
                  name: '',
                  description: '',
                  price: 0,
                  category: '',
                  image: '',
                  stock: 0
                });
                setIsAddingProduct(true);
              }}
              className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Nuevo Producto</span>
              <span className="md:hidden">Nuevo</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock Actual</th>
                <th className="px-6 py-4">Visible</th>
                <th className="px-6 py-4">Opciones Vinculadas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => (
                <ProductRow 
                  key={product.id}
                  product={product}
                  updateStock={updateStock}
                  updateProduct={updateProduct}
                  setEditingProduct={setEditingProduct}
                  setLinkingProductOptions={setLinkingProductOptions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <ProductModal 
          product={editingProduct}
          categories={categories}
          allProducts={products}
          isAdding={isAddingProduct}
          onClose={() => {
            setEditingProduct(null);
            setIsAddingProduct(false);
          }}
          onSave={handleSaveProduct}
          onChange={setEditingProduct}
          onImageUpload={handleImageUpload}
        />
      )}

      {linkingProductOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setLinkingProductOptions(null)}></div>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-2xl font-display text-stone-800">
                Vincular Opciones: {linkingProductOptions.name}
              </h2>
              <button onClick={() => setLinkingProductOptions(null)} className="text-stone-400 hover:text-stone-600">
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <p className="text-stone-600">
                Selecciona las categorías de opciones que estarán disponibles para este producto.
              </p>
              <div className="space-y-3">
                {options.map(option => {
                  const isLinked = linkingProductOptions.options?.some(o => o.id === option.id) || false;
                  return (
                    <label 
                      key={option.id} 
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isLinked ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="pt-1">
                        <input 
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => {
                            const currentOptionIds = linkingProductOptions.options?.map(o => o.id) || [];
                            let newOptionIds;
                            if (e.target.checked) {
                              newOptionIds = [...currentOptionIds, option.id];
                            } else {
                              newOptionIds = currentOptionIds.filter(id => id !== option.id);
                            }
                            
                            const updatedProduct = {
                              ...linkingProductOptions,
                              options: newOptionIds.map(id => options.find(o => o.id === id)).filter(Boolean) as ProductOption[]
                            };
                            setLinkingProductOptions(updatedProduct);
                            updateProductOptions(linkingProductOptions.id, newOptionIds);
                          }}
                          className="w-5 h-5 text-brand-500 rounded border-stone-300 focus:ring-brand-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800">{option.name}</h4>
                        <p className="text-xs text-stone-500 mt-1">{option.description || 'Sin descripción'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {option.values.slice(0, 5).map((v, i) => (
                            <span key={i} className="text-[10px] bg-white text-stone-600 px-2 py-1 rounded border border-stone-200">
                              {v.name}
                            </span>
                          ))}
                          {option.values.length > 5 && (
                            <span className="text-[10px] text-stone-400 px-2 py-1">+{option.values.length - 5} más</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsManager;
