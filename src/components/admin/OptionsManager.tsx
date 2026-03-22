import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Plus, 
  Trash2, 
  Edit, 
  XCircle, 
  Save, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { useStore } from '@/context/store';
import { ProductOption, ProductOptionValue } from '@/types';

const OptionsManager: React.FC = () => {
  const { options, addOption, updateOption, deleteOption } = useStore();
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);

  const handleSave = () => {
    if (editingOption) {
      updateOption(editingOption);
      setEditingOption(null);
    } else {
      setIsAddingOption(false);
    }
  };

  const handleAddOption = () => {
    const newOption: ProductOption = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nueva Categoría de Opción',
      description: '',
      type: 'select',
      isRequired: false,
      values: []
    };
    addOption(newOption);
    setEditingOption(newOption);
  };

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
            <Settings2 className="w-6 h-6 text-brand-500" />
            Opciones de Productos
          </h2>
          <p className="text-stone-500 text-sm">Crea grupos de opciones (ej: Sabores, Rellenos) para vincular a tus productos.</p>
        </div>
        <button 
          onClick={handleAddOption}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nueva Grupo de Opciones
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, idx) => (
          <motion.div 
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-stone-900">{option.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingOption(option)} className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('¿Estás seguro de eliminar este grupo de opciones?')) {
                        deleteOption(option.id);
                      }
                    }} 
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mb-4">{option.description || 'Sin descripción'}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <span>Valores</span>
                  <span>Extra ($)</span>
                </div>
                {option.values.map((v, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-stone-50 last:border-0">
                    <span className="text-xs text-stone-700">{v.name}</span>
                    <span className="text-xs font-bold text-stone-900">${(v.price || 0).toLocaleString()}</span>
                  </div>
                ))}
                {option.values.length === 0 && (
                  <p className="text-xs text-stone-400 italic py-2">Sin valores definidos</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                option.type === 'select' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}>
                {option.type === 'select' ? 'Selección Única' : 'Selección Múltiple'}
              </span>
              {option.isRequired && (
                <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-full">
                  Obligatorio
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Option Edit Modal */}
      <AnimatePresence>
        {editingOption && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" 
              onClick={() => setEditingOption(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h2 className="text-2xl font-display text-stone-800">
                  Editar Grupo de Opciones
                </h2>
                <button onClick={() => setEditingOption(null)} className="text-stone-400 hover:text-stone-600">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Nombre del Grupo</label>
                    <input 
                      type="text" 
                      value={editingOption.name}
                      onChange={(e) => setEditingOption({...editingOption, name: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Tipo de Selección</label>
                    <select 
                      value={editingOption.type}
                      onChange={(e) => setEditingOption({...editingOption, type: e.target.value as 'select' | 'multi-select'})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="select">Selección Única (Radio)</option>
                      <option value="multi-select">Selección Múltiple (Checkbox)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <input 
                    type="checkbox" 
                    id="isRequired"
                    checked={editingOption.isRequired}
                    onChange={(e) => setEditingOption({...editingOption, isRequired: e.target.checked})}
                    className="w-5 h-5 text-brand-500 rounded border-stone-300 focus:ring-brand-500"
                  />
                  <label htmlFor="isRequired" className="text-sm font-bold text-stone-700 cursor-pointer">
                    Es obligatorio seleccionar al menos una opción
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-stone-600">Valores de Opción</label>
                    <button 
                      onClick={() => {
                        const newValues = [...editingOption.values, { id: Math.random().toString(36).substr(2, 9), name: '', price: 0 }];
                        setEditingOption({...editingOption, values: newValues});
                      }}
                      className="text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir Valor
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editingOption.values.map((v, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input 
                          type="text" 
                          value={v.name}
                          onChange={(e) => {
                            const newValues = [...editingOption.values];
                            newValues[i].name = e.target.value;
                            setEditingOption({...editingOption, values: newValues});
                          }}
                          placeholder="Nombre del valor (ej: Chocolate)"
                          className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                          <input 
                            type="number" 
                            value={v.price}
                            onChange={(e) => {
                              const newValues = [...editingOption.values];
                              newValues[i].price = parseFloat(e.target.value) || 0;
                              setEditingOption({...editingOption, values: newValues});
                            }}
                            className="w-full pl-6 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const newValues = editingOption.values.filter((_, idx) => idx !== i);
                            setEditingOption({...editingOption, values: newValues});
                          }}
                          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-4">
                <button 
                  onClick={() => setEditingOption(null)}
                  className="flex-1 py-4 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OptionsManager;
