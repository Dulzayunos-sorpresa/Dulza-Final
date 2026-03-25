import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight, 
  ChevronLeft, 
  Save 
} from 'lucide-react';
import { useStore } from '@/context/store';
import { Category } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface CategoryItemProps {
  category: Category;
  index: number;
  totalCategories: number;
  moveCategory: (index: number, direction: 'up' | 'down') => void;
  setEditingCategory: (category: Category) => void;
  onDeleteRequest: (id: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = React.memo(({ 
  category, 
  index, 
  totalCategories, 
  moveCategory, 
  setEditingCategory, 
  onDeleteRequest 
}) => {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => moveCategory(index, 'up')}
            disabled={index === 0}
            className="p-1 text-stone-400 hover:text-brand-500 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 rotate-90" />
          </button>
          <button 
            onClick={() => moveCategory(index, 'down')}
            disabled={index === totalCategories - 1}
            className="p-1 text-stone-400 hover:text-brand-500 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 rotate-90" />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-stone-800">{category.name}</h3>
          <p className="text-xs text-stone-500">Posición: {index + 1}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setEditingCategory(category)}
          className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDeleteRequest(category.id)}
          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

const CategoriesManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useStore();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('');

  const handleSave = React.useCallback(() => {
    if (editingCategory) {
      updateCategory(editingCategory);
      setEditingCategory(null);
    } else {
      if (!newCategoryName) return;
      addCategory({
        id: Math.random().toString(36).substr(2, 9),
        name: newCategoryName,
        order: categories.length,
        parentId: newCategoryParentId || undefined
      });
      setNewCategoryName('');
      setNewCategoryParentId('');
      setIsAddingCategory(false);
    }
  }, [editingCategory, updateCategory, newCategoryName, addCategory, categories.length, newCategoryParentId]);

  const moveCategory = React.useCallback((index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);
    
    // Update order property for all categories
    const orderedCategories = newCategories.map((cat, i) => ({
      ...cat,
      order: i
    }));
    
    reorderCategories(orderedCategories);
  }, [categories, reorderCategories]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-500" />
            Categorías
          </h2>
          <p className="text-stone-500 text-sm">Organiza tus productos en categorías y define su orden de aparición.</p>
        </div>
        <button 
          onClick={() => setIsAddingCategory(true)}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {(isAddingCategory || editingCategory) && (
        <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-stone-600">Nombre de la Categoría</label>
            <input 
              type="text"
              value={editingCategory ? editingCategory.name : newCategoryName}
              onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategoryName(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Ej: Desayunos"
              autoFocus
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-stone-600">Categoría Padre (opcional)</label>
            <select
              value={editingCategory ? (editingCategory.parentId || '') : newCategoryParentId}
              onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, parentId: e.target.value || undefined}) : setNewCategoryParentId(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">Ninguna (Categoría Principal)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleSave}
            className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {editingCategory ? 'Guardar' : 'Crear'}
          </button>
          <button 
            onClick={() => {
              setEditingCategory(null);
              setIsAddingCategory(false);
            }}
            className="bg-stone-100 text-stone-600 px-6 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-stone-100">
          {categories.map((category, index) => (
            <CategoryItem 
              key={category.id}
              category={category}
              index={index}
              totalCategories={categories.length}
              moveCategory={moveCategory}
              setEditingCategory={setEditingCategory}
              onDeleteRequest={setCategoryToDelete}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!categoryToDelete}
        title="¿Eliminar categoría?"
        description="¿Estás seguro de eliminar esta categoría? Los productos no se eliminarán pero quedarán sin categoría."
        confirmText="Eliminar"
        onConfirm={() => categoryToDelete && deleteCategory(categoryToDelete)}
        onCancel={() => setCategoryToDelete(null)}
      />
    </motion.div>
  );
};

export default CategoriesManager;
