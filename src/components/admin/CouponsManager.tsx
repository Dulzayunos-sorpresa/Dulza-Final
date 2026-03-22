import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Plus, 
  Tag, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useStore } from '@/context/store';
import { Coupon } from '@/types';

const CouponsManager: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCouponForm, setNewCouponForm] = useState<Omit<Coupon, 'id'>>({
    code: '',
    discount: 0,
    type: 'percentage',
    isActive: true,
    minPurchase: 0
  });

  const handleSave = () => {
    if (editingCoupon) {
      updateCoupon(editingCoupon);
      setEditingCoupon(null);
    } else {
      if (!newCouponForm.code) return alert('El código es obligatorio');
      addCoupon({ 
        ...newCouponForm, 
        id: Math.random().toString(36).substr(2, 9) 
      });
      setIsAddingCoupon(false);
      setNewCouponForm({ 
        code: '', 
        discount: 0, 
        type: 'percentage', 
        isActive: true, 
        minPurchase: 0 
      });
    }
  };

  return (
    <motion.div 
      key="coupons"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-brand-500" />
            Gestión de Cupones
          </h2>
          <p className="text-stone-500 text-sm">Crea y administra códigos de descuento para tus clientes.</p>
        </div>
        <button 
          onClick={() => setIsAddingCoupon(true)}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center gap-2 shadow-lg shadow-brand-200"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cupón
        </button>
      </div>

      <AnimatePresence>
        {(isAddingCoupon || editingCoupon) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-brand-100 mb-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editingCoupon ? <Edit className="w-5 h-5 text-brand-500" /> : <Plus className="w-5 h-5 text-brand-500" />}
                {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Código</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="text"
                      value={editingCoupon ? editingCoupon.code : newCouponForm.code}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/\s/g, '');
                        editingCoupon ? setEditingCoupon({...editingCoupon, code: val}) : setNewCouponForm({...newCouponForm, code: val})
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                      placeholder="EJ: DULCE10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Tipo</label>
                  <select 
                    value={editingCoupon ? editingCoupon.type : newCouponForm.type}
                    onChange={(e) => editingCoupon ? setEditingCoupon({...editingCoupon, type: e.target.value as 'percentage' | 'fixed'}) : setNewCouponForm({...newCouponForm, type: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Valor</label>
                  <input 
                    type="number"
                    value={editingCoupon ? editingCoupon.discount : newCouponForm.discount}
                    onChange={(e) => editingCoupon ? setEditingCoupon({...editingCoupon, discount: parseFloat(e.target.value)}) : setNewCouponForm({...newCouponForm, discount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Compra Mínima ($)</label>
                  <input 
                    type="number"
                    value={editingCoupon ? editingCoupon.minPurchase : newCouponForm.minPurchase}
                    onChange={(e) => editingCoupon ? setEditingCoupon({...editingCoupon, minPurchase: parseFloat(e.target.value)}) : setNewCouponForm({...newCouponForm, minPurchase: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <button 
                  onClick={handleSave}
                  className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all flex-1 shadow-lg shadow-brand-100"
                >
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
                <button 
                  onClick={() => {
                    setEditingCoupon(null);
                    setIsAddingCoupon(false);
                  }}
                  className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon, idx) => (
          <motion.div 
            key={coupon.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white p-6 rounded-2xl shadow-sm border ${coupon.isActive ? 'border-stone-100' : 'border-red-100 bg-red-50/10'} flex flex-col justify-between relative overflow-hidden`}
          >
            {!coupon.isActive && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                INACTIVO
              </div>
            )}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${coupon.isActive ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-400'}`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-bold text-stone-900 tracking-wider">
                    {coupon.code}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingCoupon(coupon)} className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('¿Estás seguro de eliminar este cupón?')) {
                        deleteCoupon(coupon.id);
                      }
                    }} 
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-stone-900">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                </span>
                <span className="text-stone-500 text-sm font-medium">OFF</span>
              </div>
              
              <p className="text-xs text-stone-500 font-medium">
                {coupon.minPurchase > 0 ? `Válido desde $${coupon.minPurchase.toLocaleString()}` : 'Sin compra mínima'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${coupon.isActive ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {coupon.isActive ? 'Activo' : 'Pausado'}
                </span>
              </div>
              <button 
                onClick={() => updateCoupon({...coupon, isActive: !coupon.isActive})}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  coupon.isActive 
                    ? 'text-stone-600 bg-stone-100 hover:bg-stone-200' 
                    : 'text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-100'
                }`}
              >
                {coupon.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </motion.div>
        ))}
        
        {coupons.length === 0 && (
          <div className="col-span-full py-12 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
            <Gift className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 font-medium">No hay cupones creados aún.</p>
            <button 
              onClick={() => setIsAddingCoupon(true)}
              className="mt-4 text-brand-600 font-bold hover:underline"
            >
              Crear el primero
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CouponsManager;
