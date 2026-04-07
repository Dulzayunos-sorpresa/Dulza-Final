import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trash2, 
  AlertTriangle, 
  RefreshCw,
  Database,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '@/context/store';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const SettingsManager: React.FC = () => {
  const { 
    products, 
    categories, 
    options, 
    subobjects, 
    coupons, 
    orders, 
    transferAccounts 
  } = useStore();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    collection: string;
  } | null>(null);

  const handleDeleteAll = async (collectionName: string) => {
    setIsDeleting(true);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
      await Promise.all(deletePromises);
      toast.success(`Todos los elementos de ${collectionName} han sido eliminados.`);
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      toast.error(`Error al eliminar datos de ${collectionName}`);
    } finally {
      setIsDeleting(false);
      setConfirmAction(null);
    }
  };

  const sections = [
    { id: 'products', label: 'Productos', count: products.length, collection: 'products' },
    { id: 'categories', label: 'Categorías', count: categories.length, collection: 'categories' },
    { id: 'options', label: 'Opciones', count: options.length, collection: 'options' },
    { id: 'subobjects', label: 'Subobjetos', count: subobjects.length, collection: 'subobjects' },
    { id: 'coupons', label: 'Cupones', count: coupons.length, collection: 'coupons' },
    { id: 'orders', label: 'Pedidos', count: orders.length, collection: 'orders' },
    { id: 'transfer', label: 'Cuentas', count: transferAccounts.length, collection: 'transferAccounts' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-display text-stone-800">Zona de Peligro</h2>
            <p className="text-stone-500 font-medium">Acciones irreversibles sobre la base de datos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <div 
              key={section.id}
              className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-red-200 transition-all"
            >
              <div>
                <h3 className="font-bold text-stone-800">{section.label}</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  {section.count} elementos registrados
                </p>
              </div>
              <button
                onClick={() => setConfirmAction({
                  title: `¿Eliminar todos los ${section.label}?`,
                  description: `Esta acción eliminará permanentemente los ${section.count} registros de ${section.label}. No se puede deshacer.`,
                  collection: section.collection
                })}
                disabled={section.count === 0 || isDeleting}
                className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-amber-800 mb-1">Atención</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Eliminar datos aquí los borrará permanentemente de Firestore. Asegúrate de haber exportado tus datos si deseas conservarlos.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmText={isDeleting ? 'Eliminando...' : 'Eliminar Todo'}
        onConfirm={() => confirmAction && handleDeleteAll(confirmAction.collection)}
        onCancel={() => setConfirmAction(null)}
        variant="danger"
      />
    </motion.div>
  );
};

export default SettingsManager;
