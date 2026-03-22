import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Calendar as CalendarIcon, 
  CreditCard, 
  User as UserIcon, 
  Tag, 
  Printer, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Send 
} from 'lucide-react';
import { useStore } from '@/context/store';
import { OrderStatus, PaymentStatus, Order } from '@/types';
import { formatOrderToWhatsApp } from '@/src/utils/orderUtils';
import { trackEvent, AnalyticsEvents } from '@/src/utils/analytics';
import { PrinterService } from '@/services/PrinterService';

const OrdersManager: React.FC = () => {
  const { 
    orders, 
    products, 
    updateOrderStatus, 
    updateOrderPaymentStatus, 
    updateOrderShipping,
    deleteOrder 
  } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'TODOS'>('TODOS');

  const SHIPPING_ZONES = React.useMemo(() => [
    { name: 'Zona 1 (Cerca)', cost: 2000 },
    { name: 'Zona 2 (Media)', cost: 4000 },
    { name: 'Zona 3 (Lejos)', cost: 6000 },
    { name: 'Zona 4 (Muy Lejos)', cost: 8000 },
    { name: 'Envío Gratis', cost: 0 }
  ], []);

  const hasFreeDelivery = React.useCallback((order: Order) => {
    return order.items.some(item => {
      const p = products.find(prod => prod.id === item.productId);
      return p?.tags?.includes('ENVÍO GRATIS') || p?.freeDelivery;
    });
  }, [products]);

  const getGoogleMapsLink = React.useCallback((order: Order) => {
    const origin = encodeURIComponent("Nicolas Avellaneda 327");
    let destination = "";
    if (order.isPrivateNeighborhood) {
      destination = encodeURIComponent(`${order.neighborhood}, ${order.familyName}`);
    } else {
      destination = encodeURIComponent(order.deliveryAddress || "");
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }, []);

  const filteredOrders = React.useMemo(() => orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'TODOS' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, filterStatus]);

  const ordersByStatus = React.useMemo(() => {
    const result: Record<string, Order[]> = {};
    Object.values(OrderStatus).forEach(status => {
      result[status] = filteredOrders.filter(o => o.status === status);
    });
    return result;
  }, [filteredOrders]);

  return (
    <motion.div 
      key="orders"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {['TODOS', ...Object.values(OrderStatus)].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as OrderStatus | 'TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm">
          <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">No hay pedidos registrados aún.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
          {Object.values(OrderStatus).map(statusColumn => {
            const columnOrders = ordersByStatus[statusColumn] || [];

            if (filterStatus !== 'TODOS' && filterStatus !== statusColumn) return null;

            return (
              <div key={statusColumn} className="min-w-[350px] flex-1 flex flex-col bg-stone-50 rounded-2xl p-4 border border-stone-200 snap-center">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-stone-700 uppercase tracking-wider text-sm">{statusColumn}</h3>
                  <span className="bg-white text-stone-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-stone-100">{columnOrders.length}</span>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                  {columnOrders.map((order, idx) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col shrink-0"
                    >
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-tighter bg-stone-50 px-1.5 py-0.5 rounded">#{order.id.slice(-6)}</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-stone-800 leading-tight">{order.customerName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <a href={`tel:${order.customerPhone}`} className="text-[10px] text-brand-600 font-medium flex items-center gap-1 hover:underline">
                                <Phone className="w-3 h-3" />
                                {order.customerPhone}
                              </a>
                              <a 
                                href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              order.paymentStatus === PaymentStatus.PENDING ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {order.paymentStatus}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2 text-[11px]">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <div className="text-stone-700">
                                <p className="font-bold text-stone-900 mb-0.5">{order.deliveryType === 'PICKUP' ? 'Retiro en Local' : 'Envío a Domicilio'}</p>
                                {order.deliveryType === 'DELIVERY' && (
                                  <p className="leading-relaxed">
                                    {order.isPrivateNeighborhood ? (
                                      <>
                                        {order.neighborhood}, Fam. {order.familyName}<br/>
                                        Mza {order.blockLot}, Casa {order.houseNumber}
                                      </>
                                    ) : (
                                      <>{order.deliveryAddress} {order.neighborhood ? `(${order.neighborhood})` : ''}</>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <CalendarIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="text-stone-700 font-medium">{order.deliveryDate} a las {order.deliveryTime}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="text-stone-700 font-medium">{order.paymentMethod}</span>
                            </div>
                            {order.recipientName && (
                              <div className="flex items-start gap-2 text-[11px]">
                                <UserIcon className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                <div className="text-stone-700">
                                  <p className="font-bold text-stone-900">Recibe:</p>
                                  <p>{order.recipientName} ({order.recipientPhone})</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {order.notes && (
                            <div className="col-span-full flex items-start gap-2 text-[11px] pt-2 border-t border-stone-200">
                              <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <p className="text-stone-600 italic">"{order.notes}"</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Detalle del Pedido</p>
                          {order.items.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return (
                              <div key={idx} className="flex flex-col py-1.5 border-b border-stone-50 last:border-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-stone-800">{item.quantity}x {p?.name || 'Producto'}</span>
                                  <span className="text-xs font-bold text-stone-900">${((p?.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                                </div>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedOptions.map((opt, optIdx) => (
                                      <span key={optIdx} className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                        {opt.values.join(', ')}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {order.couponCode && (
                            <div className="flex justify-between items-center py-1.5 text-emerald-600">
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                <Tag className="w-3 h-3" />
                                Cupón: {order.couponCode}
                              </div>
                              <span className="text-xs font-bold">-${order.discountAmount?.toLocaleString()}</span>
                            </div>
                          )}

                          {order.deliveryType === 'DELIVERY' && (
                            <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-stone-50 uppercase tracking-wider">Calculadora de Envío</span>
                                <div className="flex gap-1.5">
                                  {hasFreeDelivery(order) && (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                                      ¡GRATIS!
                                    </span>
                                  )}
                                  <a 
                                    href={getGoogleMapsLink(order)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors"
                                  >
                                    <MapPin className="w-2 h-2" /> Ver Mapa
                                  </a>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-1.5">
                                {SHIPPING_ZONES.map(zone => (
                                  <button
                                    key={zone.name}
                                    onClick={() => updateOrderShipping(order.id, zone.cost, zone.name)}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${
                                      order.shippingZone === zone.name
                                        ? 'bg-brand-600 text-white border-brand-600'
                                        : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'
                                    }`}
                                  >
                                    {zone.name} (${zone.cost})
                                  </button>
                                ))}
                              </div>
                              
                              {order.shippingCost !== undefined && (
                                <div className="flex justify-between items-center text-stone-600 text-[11px] font-medium">
                                  <span>Costo ({order.shippingZone})</span>
                                  <span className="font-bold text-stone-900">${(order.shippingCost || 0).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total</span>
                            <span className="text-xl font-display font-bold text-brand-600">${(order.total || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-2 flex gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-[10px] font-bold px-2 py-1.5 bg-white border border-stone-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {Object.values(OrderStatus).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value as PaymentStatus)}
                            className="text-[10px] font-bold px-2 py-1.5 bg-white border border-stone-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            {Object.values(PaymentStatus).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={async () => {
                              try {
                                await PrinterService.printOrder(order, products);
                                trackEvent(AnalyticsEvents.ORDER_PRINTED, { orderId: order.id });
                              } catch (err) {
                                console.error('Error al imprimir:', err);
                                alert('Error al imprimir. Verifique la conexión con la impresora.');
                              }
                            }}
                            className="p-2 bg-white text-stone-400 hover:text-brand-600 border border-stone-200 rounded-lg transition-all"
                            title="Imprimir Comanda"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const text = formatOrderToWhatsApp(order, products);
                              const url = `https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                              window.open(url, '_blank');
                            }}
                            className="p-2 bg-white text-stone-400 hover:text-emerald-600 border border-stone-200 rounded-lg transition-all"
                            title="Enviar por WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('¿Estás seguro de eliminar este pedido?')) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-2 bg-white text-stone-400 hover:text-red-600 border border-stone-200 rounded-lg transition-all"
                            title="Eliminar Pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default OrdersManager;
