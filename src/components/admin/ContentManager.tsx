import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/store';
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContentManager() {
  const { uiContent, updateUIContent, categories, shippingSettings, updateShippingSettings } = useStore();
  const [localContent, setLocalContent] = useState(uiContent || {});
  const [localSpecialCategoryId, setLocalSpecialCategoryId] = useState(shippingSettings?.specialCategoryId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (uiContent) setLocalContent(uiContent);
  }, [uiContent]);

  useEffect(() => {
    if (shippingSettings?.specialCategoryId) {
      setLocalSpecialCategoryId(shippingSettings.specialCategoryId);
    }
  }, [shippingSettings?.specialCategoryId]);

  if (!uiContent || !shippingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateUIContent(localContent);
      await updateShippingSettings({
        ...shippingSettings,
        specialCategoryId: localSpecialCategoryId
      });
      setMessage({ type: 'success', text: 'Contenido actualizado correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el contenido' });
    } finally {
      setIsSaving(false);
    }
  };

  const contentFields = [
    { key: 'hero_title', label: 'Título Hero', type: 'text' },
    { key: 'hero_subtitle', label: 'Subtítulo Hero', type: 'textarea' },
    { key: 'about_title', label: 'Título Nosotros', type: 'text' },
    { key: 'about_text', label: 'Texto Nosotros', type: 'textarea' },
    { key: 'corporate_title', label: 'Título Empresas', type: 'text' },
    { key: 'corporate_text', label: 'Texto Empresas', type: 'textarea' },
    { key: 'custom_title', label: 'Título Personalizados', type: 'text' },
    { key: 'custom_text', label: 'Texto Personalizados', type: 'textarea' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display text-stone-800">Gestión de Contenido</h2>
          <p className="text-stone-500 text-sm">Personalizá los textos y destaques del sitio web.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-200"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{message.text}</span>
        </motion.div>
      )}

      {/* Layout Selector */}
      <section className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
        <h3 className="text-lg font-display text-stone-800 border-b border-stone-50 pb-4 mb-6 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-brand-500" />
          Diseño de Temporada
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'default', label: 'Predeterminado', color: 'bg-stone-500' },
            { id: 'father', label: 'Día del Padre', color: 'bg-blue-600' },
            { id: 'mother', label: 'Día de la Madre', color: 'bg-pink-500' },
            { id: 'christmas', label: 'Navidad', color: 'bg-red-600' },
            { id: 'women', label: 'Día de la Mujer', color: 'bg-purple-500' },
            { id: 'easter', label: 'Pascuas', color: 'bg-yellow-500' },
            { id: 'children', label: 'Día del Niño', color: 'bg-orange-500' },
            { id: 'friend', label: 'Día del Amigo', color: 'bg-teal-500' },
          ].map((layout) => (
            <button
              key={layout.id}
              onClick={() => setLocalContent({ ...localContent, activeLayout: layout.id as any })}
              className={`p-4 rounded-2xl border-2 transition-all text-left space-y-2 ${
                localContent.activeLayout === layout.id
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-stone-100 hover:border-stone-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${layout.color} shadow-sm`} />
              <p className={`text-sm font-bold ${localContent.activeLayout === layout.id ? 'text-brand-600' : 'text-stone-600'}`}>
                {layout.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text Content */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <h3 className="text-lg font-display text-stone-800 border-b border-stone-50 pb-4">Textos del Sitio</h3>
          <div className="space-y-4">
            {contentFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={localContent[field.key] || ''}
                    onChange={(e) => setLocalContent({ ...localContent, [field.key]: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm text-stone-700"
                  />
                ) : (
                  <input
                    type="text"
                    value={localContent[field.key] || ''}
                    onChange={(e) => setLocalContent({ ...localContent, [field.key]: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm text-stone-700"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Category */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
            <h3 className="text-lg font-display text-stone-800 border-b border-stone-50 pb-4">Categoría Destacada</h3>
            <div className="space-y-4">
              <p className="text-sm text-stone-500">
                Seleccioná una categoría para destacarla en la página principal (ej: San Valentín, Día de la Madre).
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Categoría a Destacar</label>
                <select
                  value={localSpecialCategoryId}
                  onChange={(e) => setLocalSpecialCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm text-stone-700"
                >
                  <option value="">Ninguna</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
