import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Send, MapPin, Phone, User, Calendar, MessageSquare, CreditCard, Home, Loader2 } from 'lucide-react';
import { useStore } from '../context/store';
import { PaymentMethod, Order, Product, ProductOption } from '../types';

const WHATSAPP_NUMBER = '5493512261245'; // Número real de Dulzayunos

const formatOrderToWhatsApp = (order: Order, products: Product[], options: ProductOption[]) => {
  const date = new Date(order.createdAt).toLocaleDateString('es-AR');
  const time = new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  
  let message = `_¡Hola! Te paso el resumen de mi pedido_\n\n`;
  message += `*Pedido:* \`\`\`#${order.id.split('-')[1]?.slice(-4) || order.id}\`\`\`\n`;
  message += `*Tienda:* dulzayunos-sorpresa\n`;
  message += `*Fecha:* ${date} - ${time}hs\n`;
  message += `*Nombre:* ${order.customerName}\n`;
  message += `*Teléfono:* ${order.customerPhone}\n\n`;
  
  message += `*Forma de pago:* ${order.paymentMethod}\n`;
  message += `*Total:* $${order.total.toLocaleString()}\n\n`;

  if (order.paymentMethod === PaymentMethod.TRANSFERENCIA_MP) {
    message += `► _El cbu se envía una vez recibido el pedido_\n\n`;
  } else if (order.paymentMethod === PaymentMethod.PAGOS_INTERNACIONALES) {
    message += `► _Solicito los datos para el pago internacional_\n\n`;
  }
  
  message += `*Entrega:* ${order.deliveryType === 'PICKUP' ? 'Retiro por el local' : 'Delivery'}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    if (order.isPrivateNeighborhood) {
      message += `*Barrio Privado:* ${order.neighborhood}\n`;
      message += `*Familia:* ${order.familyName}\n`;
      message += `*Manzana y Lote:* ${order.blockLot}\n`;
      message += `*Casa N⁰:* ${order.houseNumber}\n\n`;
    } else {
      message += `*Dirección:* ${order.deliveryAddress}\n`;
      message += `*Referencia:* ${order.reference || 'Sin referencia'}\n`;
      message += `*Barrio:* ${order.neighborhood || 'No especificado'}\n\n`;
    }
  } else {
    message += `*Dirección:* Nicolas Avellaneda 327\n\n`;
  }
  
  const formattedDeliveryDate = order.deliveryDate.includes('-') 
    ? order.deliveryDate.split('-').reverse().join('/') 
    : order.deliveryDate;

  message += `*📅Fecha de entrega:* ${formattedDeliveryDate}\n`;
  message += `*🕤Horario (aproximados):* ${order.deliveryTime}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    message += `*🏷️Nombre y apellido de quién recibe:* ${order.recipientName}\n`;
    message += `*📱Teléfono de quién recibe:* ${order.recipientPhone}\n`;
  }

  message += `*📩Tarjeta dedicatoria:* ${order.notes || 'Sin dedicatoria'}\n\n`;
  
  message += `_Mi pedido es_\n\n`;
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      message += `*${product.category}*\n`;
      
      // Calculate item options details
      const itemOptionsDetails: string[] = [];
      if (item.selectedOptions && product.options) {
        item.selectedOptions.forEach(selectedOpt => {
          const option = product.options?.find(o => o.id === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valName => {
              const val = option.values.find(v => v.name === valName);
              if (val) {
                itemOptionsDetails.push(`${option.name}: ${val.name}${val.price ? ` (+$${val.price.toLocaleString()})` : ''}`);
              }
            });
          }
        });
      }

      message += `${item.quantity}x ${product.name}\n`;
      if (itemOptionsDetails.length > 0) {
        itemOptionsDetails.forEach(opt => {
          message += `  - ${opt}\n`;
        });
      }
    }
  });
  
  message += `\n*TOTAL:* *$${order.total.toLocaleString()}*\n\n`;
  message += `_Espero tu respuesta para confirmar mi pedido_`;
  
  return encodeURIComponent(message);
};

const Cart: React.FC = () => {
  const { cart, products, removeFromCart, clearCart, addOrder, orders, options } = useStore();
  const navigate = useNavigate();
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectType, setRedirectType] = useState<'success' | 'processing' | 'failure' | 'pending'>('processing');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryType: 'DELIVERY',
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
    paymentMethod: PaymentMethod.TRANSFERENCIA_MP,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate cart items with details
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;
    
    // Calculate price per item including options
    let optionsPrice = 0;
    const itemOptionsDetails: string[] = [];

    if (item.selectedOptions && product.options) {
      item.selectedOptions.forEach(selectedOpt => {
        const option = product.options?.find(o => o.id === selectedOpt.optionId);
        if (option) {
          selectedOpt.values.forEach(valName => {
            const val = option.values.find(v => v.name === valName);
            if (val) {
              if (val.price) optionsPrice += val.price;
              itemOptionsDetails.push(`${option.name}: ${val.name}${val.price ? ` (+$${val.price.toLocaleString()})` : ''}`);
            }
          });
        }
      });
    }

    const unitPrice = product.price + optionsPrice;
    const totalPrice = unitPrice * item.quantity;

    return { 
      ...product, 
      cartItemId: item.id,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      itemOptionsDetails,
      selectedOptions: item.selectedOptions
    };
  }).filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0);
  const surcharge = formData.paymentMethod === PaymentMethod.TARJETA_UALA ? subtotal * 0.15 : 0;
  const total = subtotal + surcharge;

  const [returnedOrder, setReturnedOrder] = useState<Order | null>(null);
  const { cart: currentCart, clearCart: clearStoreCart, addToCart } = useStore();

  // Handle return from payment gateway
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const orderId = params.get('orderId');

    if (orderId) {
      let order = orders.find(o => o.id === orderId);
      
      // If order is not found in state, try localStorage
      if (!order) {
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            if (parsed.id === orderId) {
              order = parsed;
            }
          } catch (e) {
            console.error('Error parsing saved order:', e);
          }
        }
      }

      if (order) {
        setReturnedOrder(order);
        
        if (status === 'success') {
          setRedirectType('success');
          setShowRedirectModal(true);
          localStorage.removeItem('lastOrder');
          localStorage.removeItem('pendingCart');
        } else if (status === 'failure' || status === 'pending') {
          setRedirectType(status as 'failure' | 'pending');
          setShowRedirectModal(true);
          
          // Restore cart if it was cleared
          const pendingCart = localStorage.getItem('pendingCart');
          if (pendingCart && currentCart.length === 0) {
            try {
              const items = JSON.parse(pendingCart);
              items.forEach((item: any) => {
                addToCart(item.productId, item.quantity, item.selectedOptions);
              });
            } catch (e) {
              console.error('Error restoring cart:', e);
            }
          }
        }
        
        // Clear query params
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [orders]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'El nombre es obligatorio';
    
    const phoneRegex = /^\d{10,15}$/;
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'El teléfono debe tener entre 10 y 15 dígitos';
    }

    if (formData.deliveryType === 'DELIVERY') {
      if (formData.isPrivateNeighborhood) {
        if (!formData.neighborhood.trim()) newErrors.neighborhood = 'El nombre del barrio es obligatorio';
        if (!formData.familyName.trim()) newErrors.familyName = 'El nombre de la familia es obligatorio';
        if (!formData.blockLot.trim()) newErrors.blockLot = 'Manzana y lote son obligatorios';
        if (!formData.houseNumber.trim()) newErrors.houseNumber = 'El número de casa es obligatorio';
      } else {
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'La dirección es obligatoria';
      }
      
      if (!formData.recipientName.trim()) newErrors.recipientName = 'El nombre de quien recibe es obligatorio';
      if (!formData.recipientPhone.trim()) {
        newErrors.recipientPhone = 'El teléfono de quien recibe es obligatorio';
      } else if (!phoneRegex.test(formData.recipientPhone.replace(/\D/g, ''))) {
        newErrors.recipientPhone = 'El teléfono debe tener entre 10 y 15 dígitos';
      }
    }

    // Date and Time Validation
    if (!formData.deliveryDate.trim()) {
      newErrors.deliveryDate = 'La fecha es obligatoria';
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDate = new Date(formData.deliveryDate + 'T00:00:00');
      
      if (selectedDate < today) {
        newErrors.deliveryDate = 'La fecha no puede ser anterior a hoy';
      } else if (selectedDate.getTime() === today.getTime()) {
        // If it's today, check the time
        if (formData.deliveryTime) {
          const [hours, minutes] = formData.deliveryTime.split(':').map(Number);
          const selectedTime = new Date();
          selectedTime.setHours(hours, minutes, 0, 0);
          
          // Add 1 hour buffer for preparation
          const minTime = new Date();
          minTime.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);
          
          if (selectedTime < minTime) {
            newErrors.deliveryTime = 'El horario debe ser al menos 1 hora después de la hora actual';
          }
        }
      }
    }

    if (!formData.deliveryTime.trim()) newErrors.deliveryTime = 'El horario es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) alert(firstError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { order, paymentUrl } = await addOrder({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryType === 'PICKUP' ? 'Nicolas Avellaneda 327' : (formData.isPrivateNeighborhood ? formData.neighborhood : formData.deliveryAddress),
        deliveryType: formData.deliveryType as 'DELIVERY' | 'PICKUP',
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        recipientName: formData.deliveryType === 'PICKUP' ? '' : formData.recipientName,
        recipientPhone: formData.deliveryType === 'PICKUP' ? '' : formData.recipientPhone,
        neighborhood: formData.deliveryType === 'PICKUP' ? '' : formData.neighborhood,
        reference: formData.deliveryType === 'PICKUP' ? '' : formData.reference,
        isPrivateNeighborhood: formData.isPrivateNeighborhood,
        familyName: formData.familyName,
        blockLot: formData.blockLot,
        houseNumber: formData.houseNumber,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        notes: formData.notes,
        items: cart,
        total
      });

      setRedirectType('processing');
      setShowRedirectModal(true);

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${formatOrderToWhatsApp(order, products, options)}`;
      
      if (paymentUrl) {
        console.log('Redirecting to payment gateway:', paymentUrl);
        // Save order to localStorage for when they return
        localStorage.setItem('lastOrder', JSON.stringify(order));
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      } else if (formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP || formData.paymentMethod === PaymentMethod.TARJETA_UALA) {
        console.warn('Payment link expected but not received, falling back to WhatsApp');
        alert('No pudimos generar el link de pago automáticamente, pero tu pedido fue registrado. Serás redirigido a WhatsApp para coordinar el pago.');
        window.location.href = whatsappUrl;
      } else {
        console.log('Manual payment method, redirecting to WhatsApp');
        // Redirect directly to WhatsApp
        window.location.href = whatsappUrl;
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert(error.message || 'Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up">
        <div className="bg-brand-100 p-6 rounded-full mb-6 animate-pulse">
          <ShoppingBag className="h-12 w-12 text-brand-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-stone-500 mb-8 max-w-md">
          Parece que aún no has agregado ninguna caja de desayuno. ¡Elige tu regalo perfecto!
        </p>
        <Link 
          to="/personalizados"
          className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Ver Personalizados
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-display font-bold text-stone-900 mb-8">Tu Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden mb-8 animate-fade-in-up">
            <ul className="divide-y divide-brand-100">
              {cartItems.map((item, index) => (
                <li key={item?.cartItemId} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <img src={item?.image} alt={item?.name} loading="lazy" className="w-20 h-20 rounded-lg object-cover bg-stone-100 shadow-sm" />
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-stone-900 text-lg">{item?.name}</h3>
                          <p className="text-stone-500 text-sm mb-1">{item?.category}</p>
                          {item?.itemOptionsDetails && item.itemOptionsDetails.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.itemOptionsDetails.map((opt, i) => (
                                <p key={i} className="text-[10px] text-stone-400 font-medium leading-tight">• {opt}</p>
                              ))}
                            </div>
                          )}
                       </div>
                       <div className="text-right sm:hidden">
                          <p className="font-bold text-lg text-stone-900">${item?.totalPrice.toLocaleString()}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 sm:hidden">
                       <div className="text-brand-600 font-bold">${item?.unitPrice.toLocaleString()} x {item?.quantity}</div>
                       <button 
                          onClick={() => item && removeFromCart(item.cartItemId)}
                          className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </button>
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block min-w-[120px]">
                    <p className="font-bold text-lg text-stone-900 mb-1">${item?.totalPrice.toLocaleString()}</p>
                    <div className="text-stone-500 text-sm mb-2">{item?.quantity} unidad{item?.quantity !== 1 ? 'es' : ''}</div>
                    <button 
                      onClick={() => item && removeFromCart(item.cartItemId)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors inline-flex"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-brand-50 p-6 flex justify-between items-center border-t border-brand-100">
              <span className="text-stone-600 font-medium">Total a pagar:</span>
              <span className="text-3xl font-bold text-brand-700 font-display animate-pulse">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-start gap-4 animate-fade-in-up delay-200">
            <button 
              onClick={clearCart}
              className="px-6 py-3 text-stone-500 font-medium hover:text-stone-700 hover:underline transition-colors"
            >
              Vaciar Carrito
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-display font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-500" />
              Datos de Entrega
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tipo de Entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, deliveryType: 'DELIVERY'})}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.deliveryType === 'DELIVERY' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-100'}`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, deliveryType: 'PICKUP'})}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.deliveryType === 'PICKUP' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-100'}`}
                  >
                    Retiro Local
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tus Datos</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    required
                    type="text" 
                    placeholder="Tu nombre completo"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({...formData, customerName: e.target.value});
                      if (errors.customerName) setErrors({...errors, customerName: ''});
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.customerName ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                  />
                  {errors.customerName && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.customerName}</p>}
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    required
                    type="tel" 
                    placeholder="Tu teléfono (cod. área + número)"
                    value={formData.customerPhone}
                    onChange={(e) => {
                      setFormData({...formData, customerPhone: e.target.value});
                      if (errors.customerPhone) setErrors({...errors, customerPhone: ''});
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.customerPhone ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                  />
                  {errors.customerPhone && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.customerPhone}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Datos de {formData.deliveryType === 'PICKUP' ? 'Retiro' : 'Entrega'}</label>
                
                {formData.deliveryType === 'DELIVERY' && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-stone-50 rounded-lg border border-stone-100">
                    <input 
                      type="checkbox" 
                      id="isPrivateNeighborhood"
                      checked={formData.isPrivateNeighborhood}
                      onChange={(e) => setFormData({...formData, isPrivateNeighborhood: e.target.checked})}
                      className="w-4 h-4 text-brand-500 rounded border-stone-300 focus:ring-brand-500"
                    />
                    <label htmlFor="isPrivateNeighborhood" className="text-xs font-bold text-stone-700 cursor-pointer">
                      Es un barrio privado
                    </label>
                  </div>
                )}

                {formData.deliveryType === 'DELIVERY' ? (
                  <>
                    {!formData.isPrivateNeighborhood ? (
                      <>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="Dirección de entrega"
                            value={formData.deliveryAddress}
                            onChange={(e) => {
                              setFormData({...formData, deliveryAddress: e.target.value});
                              if (errors.deliveryAddress) setErrors({...errors, deliveryAddress: ''});
                            }}
                            className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.deliveryAddress ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                          />
                          {errors.deliveryAddress && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.deliveryAddress}</p>}
                          
                          {formData.deliveryAddress && formData.deliveryAddress.length > 5 && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 h-40 w-full shadow-inner bg-stone-100 relative animate-fade-in">
                              <iframe
                                title="Map Preview"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.deliveryAddress + ', Córdoba, Argentina')}&output=embed`}
                                className="grayscale hover:grayscale-0 transition-all duration-500"
                              ></iframe>
                              <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-stone-500 pointer-events-none">
                                Vista de referencia
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            type="text" 
                            placeholder="Referencia (Piso, Dpto, etc)"
                            value={formData.reference}
                            onChange={(e) => setFormData({...formData, reference: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          />
                        </div>

                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            type="text" 
                            placeholder="Barrio"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 animate-fade-in">
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="Nombre del Barrio"
                            value={formData.neighborhood}
                            onChange={(e) => {
                              setFormData({...formData, neighborhood: e.target.value});
                              if (errors.neighborhood) setErrors({...errors, neighborhood: ''});
                            }}
                            className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.neighborhood ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                          />
                          {errors.neighborhood && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.neighborhood}</p>}
                        </div>

                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="Nombre de la familia"
                            value={formData.familyName}
                            onChange={(e) => {
                              setFormData({...formData, familyName: e.target.value});
                              if (errors.familyName) setErrors({...errors, familyName: ''});
                            }}
                            className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.familyName ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                          />
                          {errors.familyName && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.familyName}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                              required
                              type="text" 
                              placeholder="Manzana y lote"
                              value={formData.blockLot}
                              onChange={(e) => {
                                setFormData({...formData, blockLot: e.target.value});
                                if (errors.blockLot) setErrors({...errors, blockLot: ''});
                              }}
                              className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.blockLot ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                            />
                            {errors.blockLot && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.blockLot}</p>}
                          </div>
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                              required
                              type="text" 
                              placeholder="Casa N⁰"
                              value={formData.houseNumber}
                              onChange={(e) => {
                                setFormData({...formData, houseNumber: e.target.value});
                                if (errors.houseNumber) setErrors({...errors, houseNumber: ''});
                              }}
                              className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.houseNumber ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                            />
                            {errors.houseNumber && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.houseNumber}</p>}
                          </div>
                        </div>

                        {formData.neighborhood && formData.neighborhood.length > 3 && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 h-40 w-full shadow-inner bg-stone-100 relative animate-fade-in">
                            <iframe
                              title="Map Preview"
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              scrolling="no"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.neighborhood + ', Córdoba, Argentina')}&output=embed`}
                              className="grayscale hover:grayscale-0 transition-all duration-500"
                            ></iframe>
                            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-stone-500 pointer-events-none">
                              Vista de referencia
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-100 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-brand-700 uppercase mb-1">Punto de Retiro</p>
                      <p className="text-sm text-stone-700 font-medium">Nicolas Avellaneda 327</p>
                      <p className="text-[10px] text-stone-500 mt-1">Córdoba Capital, Argentina</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input 
                      required
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.deliveryDate}
                      onChange={(e) => {
                        setFormData({...formData, deliveryDate: e.target.value});
                        if (errors.deliveryDate) setErrors({...errors, deliveryDate: ''});
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.deliveryDate ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input 
                      required
                      type="time" 
                      value={formData.deliveryTime}
                      onChange={(e) => {
                        setFormData({...formData, deliveryTime: e.target.value});
                        if (errors.deliveryTime) setErrors({...errors, deliveryTime: ''});
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.deliveryTime ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                    />
                  </div>
                </div>
                {(errors.deliveryDate || errors.deliveryTime) && (
                  <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.deliveryDate || errors.deliveryTime}</p>
                )}
              </div>

              {formData.deliveryType === 'DELIVERY' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Quién Recibe</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Nombre de quién recibe"
                      value={formData.recipientName}
                      onChange={(e) => {
                        setFormData({...formData, recipientName: e.target.value});
                        if (errors.recipientName) setErrors({...errors, recipientName: ''});
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.recipientName ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                    />
                    {errors.recipientName && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.recipientName}</p>}
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      required
                      type="tel" 
                      placeholder="Teléfono de quién recibe"
                      value={formData.recipientPhone}
                      onChange={(e) => {
                        setFormData({...formData, recipientPhone: e.target.value});
                        if (errors.recipientPhone) setErrors({...errors, recipientPhone: ''});
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50 border ${errors.recipientPhone ? 'border-red-500' : 'border-stone-100'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm`}
                    />
                    {errors.recipientPhone && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.recipientPhone}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pago y Notas</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm appearance-none"
                  >
                    <option value={PaymentMethod.TRANSFERENCIA_MP}>Mercado Pago (Transferencia)</option>
                    <option value={PaymentMethod.TARJETA_UALA}>Ualá (Tarjeta) (+15%)</option>
                    <option value={PaymentMethod.EFECTIVO}>Efectivo (en el local)</option>
                    <option value={PaymentMethod.PAGOS_INTERNACIONALES}>Pagos Internacionales (PayPal o Western Union)</option>
                  </select>
                </div>
                {formData.paymentMethod === PaymentMethod.TARJETA_UALA && (
                  <p className="text-[10px] text-brand-600 font-bold px-1">
                    * Se aplicará un recargo del 15% por pago con tarjeta.
                  </p>
                )}
                {formData.paymentMethod === PaymentMethod.PAGOS_INTERNACIONALES && (
                  <p className="text-[10px] text-brand-600 font-bold px-1">
                    * Los datos para el pago internacional se enviarán por WhatsApp.
                  </p>
                )}

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <textarea 
                    placeholder="Tarjeta dedicatoria..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm h-24 resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar y enviar WhatsApp'
                )}
              </button>
              
              <p className="text-[10px] text-stone-400 text-center mt-4">
                Al confirmar, serás redirigido a WhatsApp para enviar el resumen de tu pedido.
              </p>
            </div>
          </form>
        </div>
      </div>

      {showRedirectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              redirectType === 'success' ? 'bg-green-100' : 
              (redirectType === 'failure' || redirectType === 'pending') ? 'bg-amber-100' : 'bg-brand-100'
            }`}>
              {redirectType === 'success' ? (
                <Send className="w-10 h-10 text-green-600 animate-bounce" />
              ) : (redirectType === 'failure' || redirectType === 'pending') ? (
                <CreditCard className="w-10 h-10 text-amber-600" />
              ) : (
                <ShoppingBag className="w-10 h-10 text-brand-600 animate-pulse" />
              )}
            </div>
            
            <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">
              {redirectType === 'success' ? '¡Pago Exitoso!' : 
               redirectType === 'failure' ? 'Pago no realizado' :
               redirectType === 'pending' ? 'Pago pendiente' : '¡Pedido Realizado!'}
            </h2>
            
            <p className="text-stone-600 mb-6">
              {redirectType === 'success' 
                ? 'Tu pago ha sido procesado. Por favor, envíanos el detalle por WhatsApp para coordinar la entrega.'
                : redirectType === 'failure' || redirectType === 'pending'
                ? 'Parece que no se completó el pago. ¿Qué te gustaría hacer?'
                : 'Estamos redirigiéndote para completar tu pedido...'}
            </p>

            {redirectType === 'success' && returnedOrder ? (
              <button
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${formatOrderToWhatsApp(returnedOrder, products, options)}`;
                  window.location.href = whatsappUrl;
                }}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Enviar WhatsApp
              </button>
            ) : (redirectType === 'failure' || redirectType === 'pending') && returnedOrder ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Retry payment - we need to call the backend again or use the saved paymentUrl if we had it
                    // For simplicity, we'll re-trigger the submit logic or just redirect to the saved order
                    // Actually, the easiest is to let them re-submit
                    setShowRedirectModal(false);
                  }}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors"
                >
                  Reintentar pago
                </button>
                <button
                  onClick={() => {
                    // Change payment method - just close modal and let them change it
                    setShowRedirectModal(false);
                  }}
                  className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                >
                  Cambiar forma de pago
                </button>
                <button
                  onClick={() => {
                    // Cancel - clear order and close
                    localStorage.removeItem('lastOrder');
                    setShowRedirectModal(false);
                  }}
                  className="w-full text-stone-400 py-2 text-sm hover:text-stone-600 transition-colors"
                >
                  Cancelar pedido
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-brand-600 font-bold">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
