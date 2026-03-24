import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard, 
  FileText,
  Truck,
  Home
} from 'lucide-react';
import { useStore } from '@/context/store';
import { Product, PaymentMethod, CartItem } from '@/types';
import { PrinterService } from '@/services/PrinterService';

interface NewOrderManagerProps {
  onOrderCreated: () => void;
}

interface ProductItemProps {
  product: Product;
  addItem: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = React.memo(({ product, addItem }) => {
  return (
    <button 
      type="button"
      onClick={() => addItem(product)}
      className="w-full flex items-center justify-between p-3 hover:bg-brand-50 rounded-xl transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100">
          <img src={product.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold text-stone-800 group-hover:text-brand-600">{product.name}</p>
          <p className="text-[10px] text-stone-500">${(product.price || 0).toLocaleString()}</p>
        </div>
      </div>
      <Plus className="w-4 h-4 text-stone-300 group-hover:text-brand-500" />
    </button>
  );
});

interface CartItemRowProps {
  item: any;
  removeItem: (productId: string) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = React.memo(({ item, removeItem }) => {
  return (
    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
      <div className="flex-1">
        <p className="text-sm font-bold text-stone-800">{item.name}</p>
        <p className="text-xs text-stone-500">Cant: {item.quantity} x ${(item.price || 0).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-stone-900">${((item.price || 0) * item.quantity).toLocaleString()}</span>
        <button 
          type="button"
          onClick={() => removeItem(item.productId)}
          className="text-stone-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

const NewOrderManager: React.FC<NewOrderManagerProps> = ({ onOrderCreated }) => {
  const { products, addOrder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryType: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: '',
    recipientName: '',
    recipientPhone: '',
    neighborhood: '',
    reference: '',
    isPrivateNeighborhood: false,
    familyName: '',
    blockLot: '',
    houseNumber: '',
    paymentMethod: 'TRANSFERENCIA' as PaymentMethod,
    notes: '',
    items: [] as any[]
  });

  const filteredProducts = React.useMemo(() => products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  const validateForm = React.useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Nombre obligatorio';
    
    const phoneRegex = /^\d{10,15}$/;
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = 'Teléfono obligatorio';
    } else if (!phoneRegex.test(form.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Teléfono inválido (10-15 dígitos)';
    }

    if (form.deliveryType === 'DELIVERY') {
      if (form.isPrivateNeighborhood) {
        if (!form.neighborhood.trim()) newErrors.neighborhood = 'Barrio obligatorio';
        if (!form.familyName.trim()) newErrors.familyName = 'Familia obligatoria';
        if (!form.blockLot.trim()) newErrors.blockLot = 'Manzana/Lote obligatorio';
        if (!form.houseNumber.trim()) newErrors.houseNumber = 'Casa N⁰ obligatorio';
      } else {
        if (!form.deliveryAddress.trim()) newErrors.deliveryAddress = 'Dirección obligatoria';
      }
    }

    if (!form.deliveryDate.trim()) {
      newErrors.deliveryDate = 'Fecha obligatoria';
    }
    
    if (!form.deliveryTime.trim()) newErrors.deliveryTime = 'Horario obligatorio';

    setOrderErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const subtotal = form.items.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return sum;
      return sum + p.price * item.quantity;
    }, 0);

    // Simple total calculation for manual order
    const total = subtotal;

    const newOrder = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'NUEVO',
      paymentStatus: 'PENDIENTE',
      total,
      items: form.items.map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) }))
    } as any;

    addOrder(newOrder);

    if (confirm('Pedido creado con éxito. ¿Deseas imprimir la comanda ahora?')) {
      PrinterService.printOrder(newOrder, products);
    }
    
    onOrderCreated();
  }, [form, validateForm, products, addOrder, onOrderCreated]);

  const addItem = React.useCallback((product: Product) => {
    const existing = form.items.find(i => i.productId === product.id);
    if (existing) {
      setForm(prev => ({
        ...prev,
        items: prev.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, { productId: product.id, quantity: 1, name: product.name, price: product.price }]
      }));
    }
  }, [form.items]);

  const removeItem = React.useCallback((productId: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId)
    }));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-stone-900">Crear Nuevo Pedido Manual</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer & Delivery Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-brand-500" />
              Datos del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={form.customerName}
                  onChange={(e) => setForm({...form, customerName: e.target.value})}
                  className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.customerName ? 'border-red-500' : 'border-stone-200'} rounded-xl outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="Ej: Juan Pérez"
                />
                {orderErrors.customerName && <p className="text-red-500 text-xs font-bold">{orderErrors.customerName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Teléfono</label>
                <input 
                  type="tel" 
                  value={form.customerPhone}
                  onChange={(e) => setForm({...form, customerPhone: e.target.value})}
                  className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.customerPhone ? 'border-red-500' : 'border-stone-200'} rounded-xl outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="Ej: 2615555555"
                />
                {orderErrors.customerPhone && <p className="text-red-500 text-xs font-bold">{orderErrors.customerPhone}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" />
              Entrega y Horario
            </h3>

            <div className="flex gap-4 p-1 bg-stone-100 rounded-2xl w-fit">
              <button 
                type="button"
                onClick={() => setForm({...form, deliveryType: 'DELIVERY'})}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${form.deliveryType === 'DELIVERY' ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Envío a Domicilio
              </button>
              <button 
                type="button"
                onClick={() => setForm({...form, deliveryType: 'PICKUP'})}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${form.deliveryType === 'PICKUP' ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Retiro en Local
              </button>
            </div>

            {form.deliveryType === 'DELIVERY' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <input 
                    type="checkbox" 
                    id="isPrivate"
                    checked={form.isPrivateNeighborhood}
                    onChange={(e) => setForm({...form, isPrivateNeighborhood: e.target.checked})}
                    className="w-5 h-5 text-brand-500 rounded border-stone-300 focus:ring-brand-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-bold text-stone-700 cursor-pointer">
                    Es un Barrio Privado
                  </label>
                </div>

                {form.isPrivateNeighborhood ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Nombre del Barrio</label>
                      <input 
                        type="text" 
                        value={form.neighborhood}
                        onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Apellido de la Familia</label>
                      <input 
                        type="text" 
                        value={form.familyName}
                        onChange={(e) => setForm({...form, familyName: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Manzana/Lote</label>
                      <input 
                        type="text" 
                        value={form.blockLot}
                        onChange={(e) => setForm({...form, blockLot: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Casa N⁰</label>
                      <input 
                        type="text" 
                        value={form.houseNumber}
                        onChange={(e) => setForm({...form, houseNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Dirección de Entrega</label>
                    <input 
                      type="text" 
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({...form, deliveryAddress: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Calle, Número, Localidad"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Fecha de Entrega</label>
                <input 
                  type="date" 
                  value={form.deliveryDate}
                  onChange={(e) => setForm({...form, deliveryDate: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Rango Horario</label>
                <input 
                  type="text" 
                  value={form.deliveryTime}
                  onChange={(e) => setForm({...form, deliveryTime: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ej: 09:00 a 11:00"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-500" />
              Pago y Notas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Método de Pago</label>
                <select 
                  value={form.paymentMethod}
                  onChange={(e) => setForm({...form, paymentMethod: e.target.value as PaymentMethod})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="TARJETA">Tarjeta (Ualá/MP)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600">Notas Adicionales</label>
              <textarea 
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Instrucciones especiales..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Product Selection */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
            <h3 className="text-xl font-bold text-stone-800">Resumen del Pedido</h3>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {form.items.map((item, idx) => (
                <CartItemRow 
                  key={idx}
                  item={item}
                  removeItem={removeItem}
                />
              ))}
              {form.items.length === 0 && (
                <p className="text-center text-stone-400 py-8 italic">No hay productos seleccionados</p>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-2">
              <div className="flex justify-between items-center text-lg font-bold text-stone-900">
                <span>Total</span>
                <span>${form.items.reduce((sum, i) => sum + ((i.price || 0) * i.quantity), 0).toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Crear Pedido
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {filteredProducts.map(product => (
                <ProductItem 
                  key={product.id}
                  product={product}
                  addItem={addItem}
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default NewOrderManager;
