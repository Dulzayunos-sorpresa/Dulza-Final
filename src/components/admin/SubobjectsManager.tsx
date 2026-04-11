import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  XCircle, 
  Save, 
  Image as ImageIcon, 
  Camera,
  Download,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useStore } from '@/context/store';
import { ProductOptionValue } from '@/types';
import { trackEvent, AnalyticsEvents } from '@/utils/analytics';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface SubobjectCardProps {
  subobject: ProductOptionValue;
  idx: number;
  setEditingSubobject: (subobject: ProductOptionValue) => void;
  onDeleteRequest: (id: string) => void;
}

const SubobjectCard: React.FC<SubobjectCardProps> = React.memo(({ 
  subobject, 
  idx, 
  setEditingSubobject, 
  onDeleteRequest 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-100">
              {subobject.image ? (
                <img src={subobject.image} alt={subobject.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-stone-900">{subobject.name}</h3>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setEditingSubobject(subobject)} className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all">
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDeleteRequest(subobject.id)} 
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-xs text-stone-500 mb-4">{subobject.description || 'Sin descripción'}</p>
        <p className="text-lg font-bold text-stone-900">${(subobject.price || 0).toLocaleString()}</p>
      </div>
    </motion.div>
  );
});

const SubobjectsManager: React.FC = () => {
  const { subobjects, addSubobject, updateSubobject, deleteSubobject } = useStore();
  const [isAddingSubobject, setIsAddingSubobject] = useState(false);
  const [editingSubobject, setEditingSubobject] = useState<ProductOptionValue | null>(null);
  const [subobjectToDelete, setSubobjectToDelete] = useState<string | null>(null);

  const handleExportSubobjects = React.useCallback(() => {
    const data = subobjects.map(s => ({
      ID: s.id,
      Nombre: s.name,
      Descripción: s.description || '',
      Precio: s.price,
      Imagen: s.image || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subobjetos");
    XLSX.writeFile(wb, "subobjetos.xlsx");
    trackEvent(AnalyticsEvents.EXPORT_EXCEL, { type: 'subobjects', count: subobjects.length });
  }, [subobjects]);

  const handleImportSubobjects = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        
        const parsePrice = (val: any) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          const cleaned = val.toString().replace(/[$.]/g, '').replace(',', '.');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        };

        for (const row of data) {
          const subobjectData: ProductOptionValue = {
            id: row.ID || Math.random().toString(36).substr(2, 9),
            name: row.Nombre,
            description: row.Descripción || '',
            price: parsePrice(row.Precio),
            image: row.Imagen || ''
          };
          await addSubobject(subobjectData);
        }
        trackEvent(AnalyticsEvents.IMPORT_EXCEL, { type: 'subobjects', count: data.length });
        toast.success(`${data.length} subobjetos importados/actualizados`);
      } catch (error) {
        console.error('Error importing subobjects:', error);
        toast.error('Error al importar subobjetos');
      }
    };
    reader.readAsBinaryString(file);
  }, [addSubobject]);

  const handleSave = React.useCallback(() => {
    if (editingSubobject) {
      updateSubobject(editingSubobject);
      setEditingSubobject(null);
    } else {
      setIsAddingSubobject(false);
    }
  }, [editingSubobject, updateSubobject]);

  const handleAddSubobject = React.useCallback(() => {
    const newSubobject: ProductOptionValue = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nuevo Subobjeto',
      description: '',
      image: '',
      price: 0
    };
    addSubobject(newSubobject);
    setEditingSubobject(newSubobject);
  }, [addSubobject]);

  const handleImageUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingSubobject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingSubobject({
          ...editingSubobject,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }, [editingSubobject]);

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
            <Users className="w-6 h-6 text-brand-500" />
            Subobjetos
          </h2>
          <p className="text-stone-500 text-sm">Administra los subobjetos que pueden ser añadidos a los productos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportSubobjects}
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
              onChange={handleImportSubobjects} 
              className="hidden" 
            />
          </label>
          <button 
            onClick={handleAddSubobject}
            className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nuevo Subobjeto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subobjects.map((subobject, idx) => (
          <SubobjectCard 
            key={subobject.id}
            subobject={subobject}
            idx={idx}
            setEditingSubobject={setEditingSubobject}
            onDeleteRequest={setSubobjectToDelete}
          />
        ))}
      </div>

      {/* Subobject Edit Modal */}
      <AnimatePresence>
        {editingSubobject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" 
              onClick={() => setEditingSubobject(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h2 className="text-2xl font-display text-stone-800">
                  Editar Subobjeto
                </h2>
                <button onClick={() => setEditingSubobject(null)} className="text-stone-400 hover:text-stone-600">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Nombre del Subobjeto</label>
                      <input 
                        type="text" 
                        value={editingSubobject.name}
                        onChange={(e) => setEditingSubobject({...editingSubobject, name: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Precio ($)</label>
                      <input 
                        type="number" 
                        value={editingSubobject.price}
                        onChange={(e) => setEditingSubobject({...editingSubobject, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Imagen</label>
                    <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
                      {editingSubobject.image ? (
                        <>
                          <img src={editingSubobject.image} alt="Vista previa" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-stone-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              Cambiar
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2 text-stone-400 hover:text-brand-500">
                          <ImageIcon className="w-12 h-12" />
                          <span className="text-xs font-bold">Subir Imagen</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Descripción</label>
                  <textarea 
                    value={editingSubobject.description}
                    onChange={(e) => setEditingSubobject({...editingSubobject, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-4">
                <button 
                  onClick={() => setEditingSubobject(null)}
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

      <ConfirmDialog 
        isOpen={!!subobjectToDelete}
        title="¿Eliminar subobjeto?"
        description="¿Estás seguro de eliminar este subobjeto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={() => subobjectToDelete && deleteSubobject(subobjectToDelete)}
        onCancel={() => setSubobjectToDelete(null)}
      />
    </motion.div>
  );
};

export default SubobjectsManager;
