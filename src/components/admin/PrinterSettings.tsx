import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Printer, Save, Trash2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { PrinterService, PrinterConfig } from '@/services/PrinterService';

const PrinterSettings: React.FC = () => {
  const [config, setConfig] = useState<PrinterConfig>({
    vendorId: 0,
    productId: 0,
    paperSize: '80mm'
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = PrinterService.getStoredConfig();
    if (stored) {
      setConfig(stored);
    }
  }, []);

  const handleSave = () => {
    PrinterService.setStoredConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('thermal_printer_config');
    setConfig({ vendorId: 0, productId: 0, paperSize: '80mm' });
  };

  const requestPrinter = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      setConfig({
        ...config,
        vendorId: device.vendorId,
        productId: device.productId
      });
    } catch (error) {
      console.error('Error requesting USB device:', error);
    }
  };

  const testPrint = async () => {
    const config = PrinterService.getStoredConfig();
    if (!config) return;
    
    try {
      // Mock order for testing
      const mockOrder = {
        id: 'TEST-123',
        createdAt: new Date().toISOString(),
        customerName: 'Test Impresión',
        customerPhone: '12345678',
        paymentMethod: 'Efectivo',
        deliveryType: 'PICKUP',
        deliveryDate: '2024-03-23',
        total: 1000,
        items: []
      } as any;
      
      await PrinterService.printOrder(mockOrder, []);
    } catch (error: any) {
      toast.error(`Error en la prueba: ${error.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-stone-900">Configuración de Impresora</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-8">
        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-bold">¿Cómo configurar tu impresora USB?</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Conectá la impresora por USB a tu computadora.</li>
              <li>Hacé clic en "Buscar Impresora" y seleccionala de la lista.</li>
              <li>Guardá la configuración.</li>
            </ol>
            <p className="mt-2 text-xs opacity-80 italic">Nota: Esto permite imprimir directamente sin pasar por el diálogo de impresión de Chrome.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 space-y-2">
            <p className="font-bold uppercase">Importante para Windows:</p>
            <p>Si la impresora es reconocida pero no imprime, es probable que Windows esté bloqueando el acceso directo.</p>
            <p>Para solucionarlo:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Descargá la herramienta <a href="https://zadig.akeo.ie/" target="_blank" rel="noreferrer" className="underline font-bold">Zadig</a>.</li>
              <li>En Zadig, seleccioná tu impresora en la lista (Options &gt; List All Devices).</li>
              <li>Cambiá el driver actual a <b>WinUSB</b> y hacé clic en "Replace Driver".</li>
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600">Vendor ID (Hex/Dec)</label>
              <input 
                type="text" 
                value={config.vendorId || ''}
                readOnly
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-500"
                placeholder="Ej: 1155"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600">Product ID (Hex/Dec)</label>
              <input 
                type="text" 
                value={config.productId || ''}
                readOnly
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-500"
                placeholder="Ej: 22339"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Tamaño de Papel</label>
            <div className="flex gap-4">
              {['58mm', '80mm'].map((size) => (
                <button
                  key={size}
                  onClick={() => setConfig({ ...config, paperSize: size as any })}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    config.paperSize === size 
                      ? 'border-brand-500 bg-brand-50 text-brand-600' 
                      : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <button
                onClick={requestPrinter}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Buscar Impresora
              </button>
              <button
                onClick={handleSave}
                disabled={!config.vendorId}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaved ? '¡Guardado!' : 'Guardar Configuración'}
              </button>
            </div>
            
            {config.vendorId > 0 && (
              <button
                onClick={testPrint}
                className="w-full flex items-center justify-center gap-2 py-4 bg-stone-100 text-stone-700 rounded-2xl font-bold hover:bg-stone-200 transition-all"
              >
                <Printer className="w-5 h-5" />
                Probar Impresión USB
              </button>
            )}
          </div>

          {config.vendorId > 0 && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Configuración
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PrinterSettings;
