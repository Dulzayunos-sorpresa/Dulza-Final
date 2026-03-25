import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Info } from 'lucide-react';
import { useStore } from '@/context/store';
import { SpecialLayout } from '@/types';
import { THEMES } from '@/utils/themes';

const SpecialLayoutsManager: React.FC = () => {
  const { uiContent, updateUIContent } = useStore();
  const [loading, setLoading] = React.useState(false);

  const handleLayoutChange = async (layout: SpecialLayout) => {
    setLoading(true);
    try {
      await updateUIContent({
        ...uiContent,
        activeLayout: layout
      });
    } catch (error) {
      console.error('Error updating layout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-stone-900 font-bold uppercase tracking-tighter">Fechas Especiales</h1>
          <p className="text-stone-500 text-sm mt-1">Personalizá la apariencia de la tienda para eventos especiales.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold">¿Cómo funciona?</p>
          <p>Al seleccionar una fecha especial, los colores, emojis y decoraciones de toda la tienda cambiarán automáticamente para adaptarse al evento seleccionado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(THEMES) as SpecialLayout[]).map((layoutKey) => {
          const theme = THEMES[layoutKey];
          const isActive = uiContent.activeLayout === layoutKey;

          return (
            <motion.button
              key={layoutKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLayoutChange(layoutKey)}
              disabled={loading}
              className={`relative p-6 rounded-3xl border-2 transition-all text-left ${
                isActive 
                  ? 'border-brand-500 bg-white shadow-lg ring-4 ring-brand-50' 
                  : 'border-stone-100 bg-white hover:border-brand-200 hover:shadow-md'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-brand-500 text-white p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="text-4xl mb-4">{theme.emoji}</div>
              <h3 className={`text-lg font-bold mb-2 ${isActive ? 'text-brand-600' : 'text-stone-800'}`}>
                {theme.name}
              </h3>
              
              <div className="flex gap-2 mt-4">
                <div className={`w-6 h-6 rounded-full ${theme.secondary}`} title="Color Principal" />
                <div className={`w-6 h-6 rounded-full ${theme.bg} border border-stone-200`} title="Color de Fondo" />
                <div className={`w-6 h-6 rounded-full ${theme.heroBg}`} title="Color de Hero" />
              </div>

              {isActive && (
                <div className="mt-4 flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Activo actualmente
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialLayoutsManager;
