import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  Settings2, 
  CheckCircle, 
  DollarSign, 
  MapPin, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { useStore } from '@/context/store';
import { ShippingSettings } from '@/types';

const ShippingManager: React.FC = () => {
  const { shippingSettings, updateShippingSettings } = useStore();
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [tempShipping, setTempShipping] = useState<ShippingSettings | null>(null);

  const handleSaveShipping = async () => {
    if (tempShipping) {
      await updateShippingSettings(tempShipping);
      setIsEditingShipping(false);
    }
  };

  return (
    <motion.div
      key="shipping"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display text-stone-800">Configuración de Envíos</h2>
              <p className="text-stone-500 text-sm">Gestiona los costos y el rango de cobertura automática</p>
            </div>
          </div>
          {!isEditingShipping ? (
            <button
              onClick={() => {
                setTempShipping(shippingSettings);
                setIsEditingShipping(true);
              }}
              className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Editar Configuración
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingShipping(false)}
                className="px-6 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveShipping}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Costo Base</span>
            </div>
            {isEditingShipping ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                <input
                  type="number"
                  value={tempShipping?.baseCost}
                  onChange={(e) => setTempShipping(prev => prev ? { ...prev, baseCost: Number(e.target.value) } : null)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <p className="text-3xl font-display font-bold text-stone-800">${shippingSettings.baseCost.toLocaleString()}</p>
            )}
            <p className="text-xs text-stone-500 leading-relaxed">Este monto se cobra siempre como base para cualquier envío a domicilio.</p>
          </div>

          <div className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Precio por KM</span>
            </div>
            {isEditingShipping ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                <input
                  type="number"
                  value={tempShipping?.pricePerKm}
                  onChange={(e) => setTempShipping(prev => prev ? { ...prev, pricePerKm: Number(e.target.value) } : null)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <p className="text-3xl font-display font-bold text-stone-800">${shippingSettings.pricePerKm.toLocaleString()}</p>
            )}
            <p className="text-xs text-stone-500 leading-relaxed">Costo adicional por cada kilómetro de distancia desde el local.</p>
          </div>

          <div className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Límite Auto-Pago (KM)</span>
            </div>
            {isEditingShipping ? (
              <div className="relative">
                <input
                  type="number"
                  value={tempShipping?.maxKmForAutoPayment}
                  onChange={(e) => setTempShipping(prev => prev ? { ...prev, maxKmForAutoPayment: Number(e.target.value) } : null)}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <p className="text-3xl font-display font-bold text-stone-800">{shippingSettings.maxKmForAutoPayment} km</p>
            )}
            <p className="text-xs text-stone-500 leading-relaxed">Distancia máxima para permitir pago automático. Pasado este límite se considera "Zona 10" (A coordinar).</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-brand-50 rounded-2xl border border-brand-100">
          <h3 className="text-sm font-bold text-brand-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Fórmula de Cálculo
          </h3>
          <p className="text-sm text-brand-700 leading-relaxed">
            Costo de Envío = Costo Base + (Distancia en KM × Precio por KM)
            <br />
            <span className="text-xs opacity-75">* El resultado se redondea hacia arriba a la centena más cercana (ej: $2483 → $2500).</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingManager;
