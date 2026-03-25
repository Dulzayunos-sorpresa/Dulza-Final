import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Send, MapPin, Phone, User, Calendar, MessageSquare, CreditCard, Home, Loader2, ChevronRight, ChevronLeft, CheckCircle, XCircle, AlertCircle, Gift, Tag, Plus, Minus, Clock, Zap, Copy } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/utils/analytics';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';
import { PaymentMethod, Order, Product, ProductOption, Coupon } from '@/types';
import { formatOrderToWhatsApp } from '@/utils/orderUtils';
import { motion, AnimatePresence } from 'motion/react';

const WHATSAPP_NUMBER = '5493512261245'; // Número real de Dulzayunos

const Cart: React.FC = () => {
  const { cart, products, removeFromCart, addToCart, clearCart, addOrder, orders, validateCoupon, shippingSettings, transferAccounts, uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const navigate = useNavigate();
  
  const activeTransferAccounts = React.useMemo(() => transferAccounts.filter(a => a.isActive), [transferAccounts]);
  const isMPEnabled = shippingSettings.isMercadoPagoEnabled;

  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectType, setRedirectType] = useState<'success' | 'processing' | 'failure' | 'pending'>('processing');
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

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
    paymentMethod: PaymentMethod.TRANSFERENCIA,
    transferAccountId: '',
    notes: '',
    selectedZone: '',
    distanceKm: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Google Places Autocomplete setup
  useEffect(() => {
    if (formData.deliveryType === 'DELIVERY' && !formData.isPrivateNeighborhood) {
      const initAutocomplete = () => {
        if ((window as any).google && addressInputRef.current) {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'ar' },
            fields: ['formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setFormData(prev => ({ ...prev, deliveryAddress: place.formatted_address }));
            }
          });
        } else {
          // Retry if script not loaded yet
          setTimeout(initAutocomplete, 500);
        }
      };
      initAutocomplete();
    }
  }, [formData.deliveryType, formData.isPrivateNeighborhood, step]);

  // Automatic distance calculation with debounce
  useEffect(() => {
    const address = formData.isPrivateNeighborhood 
      ? formData.neighborhood 
      : formData.deliveryAddress;

    if (!address || address.length < 5) {
      if (formData.distanceKm !== 0) {
        setFormData(prev => ({ ...prev, distanceKm: 0 }));
      }
      return;
    }

    const timer = setTimeout(() => {
      calculateDistance(address);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.deliveryAddress, formData.neighborhood, formData.isPrivateNeighborhood]);

  // Update map URL when address changes
  useEffect(() => {
    const address = formData.isPrivateNeighborhood 
      ? `${formData.neighborhood}, Córdoba, Argentina`
      : `${formData.deliveryAddress}, Córdoba, Argentina`;
    
    if (formData.deliveryAddress || formData.neighborhood) {
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
    }
  }, [formData.deliveryAddress, formData.neighborhood, formData.isPrivateNeighborhood]);

  // Real distance calculation using Nominatim + Haversine
  const calculateDistance = React.useCallback(async (address: string) => {
    if (!address) return;
    
    setIsCalculatingDistance(true);
    try {
      // Use Nominatim for geocoding (free, no key required for low volume)
      // We add "Córdoba Capital" to be more specific and avoid results in other provinces
      // We also use a viewbox to restrict results to the Córdoba city area
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Córdoba Capital, Argentina')}&viewbox=-64.3,-31.3,-64.1,-31.5&bounded=1&limit=3`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Find the best match (usually the first one if bounded=1 worked)
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Origin: Nicolas Avellaneda 327, Córdoba, Argentina
        // Precise coordinates for the store
        const originLat = -31.408722;
        const originLon = -64.195311;
        
        // Haversine formula to calculate straight-line distance
        const R = 6371; // Earth's radius in km
        const dLat = (lat - originLat) * Math.PI / 180;
        const dLon = (lon - originLon) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(originLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Road distance is usually ~20-30% longer than straight line
        // We also round up to the nearest integer
        const roadDistance = Math.max(1, Math.ceil(distance * 1.3));
        
        // Safety check: if distance is suspiciously large (> 50km) for a city delivery, 
        // it might be a geocoding error. We'll cap it or handle it.
        // But for now, we'll trust the bounded search.
        setFormData(prev => ({ ...prev, distanceKm: roadDistance }));
      } else {
        // Fallback: if bounded search fails, try a broader search but still in Cordoba
        const broadResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Córdoba, Argentina')}&limit=1`);
        const broadData = await broadResponse.json();
        if (broadData && broadData.length > 0) {
          const lat = parseFloat(broadData[0].lat);
          const lon = parseFloat(broadData[0].lon);
          const originLat = -31.408722;
          const originLon = -64.195311;
          const R = 6371;
          const dLat = (lat - originLat) * Math.PI / 180;
          const dLon = (lon - originLon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(originLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          const roadDistance = Math.max(1, Math.ceil(distance * 1.3));
          
          // If it's still huge, maybe it's really far or a wrong city
          setFormData(prev => ({ ...prev, distanceKm: roadDistance }));
        }
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
    } finally {
      setIsCalculatingDistance(false);
    }
  }, []);

  // Complementos (Upselling) categorized
  const allComplementos = React.useMemo(() => products.filter(p => 
    !p.isHidden && (
      p.category === 'Complementos' || 
      p.tags?.includes('complemento') ||
      ['Globo', 'Peluche', 'Vino', 'Bombones', 'Taza', 'Mate', 'Champaña', 'Cerveza', 'Whisky'].some(keyword => p.name.includes(keyword))
    )
  ), [products]);

  const complementosCategories = React.useMemo(() => [
    { name: 'Globos', keywords: ['Globo'] },
    { name: 'Peluches', keywords: ['Peluche'] },
    { name: 'Bebidas', keywords: ['Vino', 'Champaña', 'Cerveza', 'Whisky'] },
    { name: 'Dulces', keywords: ['Bombones', 'Chocolate', 'Alfajor'] },
    { name: 'Tazas y Mates', keywords: ['Taza', 'Mate'] }
  ], []);

  const groupedComplementos = React.useMemo(() => complementosCategories.map(cat => ({
    ...cat,
    products: allComplementos.filter(p => cat.keywords.some(k => p.name.includes(k)))
  })).filter(cat => cat.products.length > 0), [allComplementos, complementosCategories]);

  const [activeComplementCategory, setActiveComplementCategory] = useState(groupedComplementos[0]?.name || '');

  useEffect(() => {
    if (!activeComplementCategory && groupedComplementos.length > 0) {
      setActiveComplementCategory(groupedComplementos[0].name);
    }
  }, [groupedComplementos]);

  // Calculate cart items with details
  const cartItems = React.useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      
      let optionsPrice = 0;
      const itemOptionsDetails: string[] = [];

      if (item.selectedOptions && product.options) {
        item.selectedOptions.forEach(selectedOpt => {
          const option = product.options?.find(o => o.id === selectedOpt.optionId || o.name === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valIdOrName => {
              const val = option.values.find(v => v.id === valIdOrName || v.name === valIdOrName);
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
  }, [cart, products]);

  const subtotal = React.useMemo(() => cartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0), [cartItems]);
  
  const isOutOfCoverage = React.useMemo(() => formData.deliveryType === 'DELIVERY' && formData.distanceKm > shippingSettings.maxKmForAutoPayment, [formData.deliveryType, formData.distanceKm, shippingSettings.maxKmForAutoPayment]);

  const calculateShippingCost = React.useCallback(() => {
    if (formData.deliveryType === 'PICKUP') return 0;
    if (isOutOfCoverage) return 0; 
    
    const hasFreeDelivery = cartItems.some(item => {
      const p = products.find(prod => prod.id === item.id);
      return p?.tags?.includes('ENVÍO GRATIS') || p?.freeDelivery;
    });
    
    if (hasFreeDelivery) return 0;

    if (formData.distanceKm <= 0) return 0;

    const cost = shippingSettings.baseCost + (formData.distanceKm * shippingSettings.pricePerKm);
    return Math.ceil(cost / 100) * 100;
  }, [formData.deliveryType, isOutOfCoverage, cartItems, products, formData.distanceKm, shippingSettings]);

  const shippingCost = React.useMemo(() => calculateShippingCost(), [calculateShippingCost]);
  const discountAmount = React.useMemo(() => appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.discount / 100) : appliedCoupon.discount)
    : 0, [appliedCoupon, subtotal]);

  const totalAfterDiscount = React.useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
  const surcharge = React.useMemo(() => formData.paymentMethod === PaymentMethod.TARJETA_UALA ? totalAfterDiscount * 0.15 : 0, [formData.paymentMethod, totalAfterDiscount]);
  const total = React.useMemo(() => totalAfterDiscount + surcharge, [totalAfterDiscount, surcharge]);

  const handleApplyCoupon = React.useCallback(() => {
    setCouponError('');
    const coupon = validateCoupon(couponCode);
    if (coupon) {
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        setCouponError(`Compra mínima para este cupón: $${coupon.minPurchase}`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponCode('');
      
      trackEvent(AnalyticsEvents.APPLY_COUPON, {
        coupon_code: coupon.code,
        discount_type: coupon.type,
        discount_value: coupon.discount
      });
    } else {
      setCouponError('Cupón inválido o expirado');
    }
  }, [couponCode, validateCoupon, subtotal]);

  const removeCoupon = React.useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const [returnedOrder, setReturnedOrder] = useState<Order | null>(null);
  const { cart: currentCart, clearCart: clearStoreCart } = useStore();

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
          
          trackEvent(AnalyticsEvents.PURCHASE, {
            transaction_id: orderId,
            status: 'success'
          });
        } else if (status === 'failure' || status === 'pending') {
          setRedirectType(status as 'failure' | 'pending');
          setShowRedirectModal(true);
          
          trackEvent(AnalyticsEvents.PAYMENT_FAILED, {
            transaction_id: orderId,
            status: status
          });
          
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
  }, [orders, currentCart.length, addToCart]);

  const validateForm = React.useCallback(() => {
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

    if (!formData.deliveryDate.trim()) {
      newErrors.deliveryDate = 'La fecha es obligatoria';
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDate = new Date(formData.deliveryDate + 'T00:00:00');
      
      if (selectedDate < today) {
        newErrors.deliveryDate = 'La fecha no puede ser anterior a hoy';
      } else if (selectedDate.getTime() === today.getTime()) {
        if (formData.deliveryTime) {
          const firstPart = formData.deliveryTime.split(' ')[0];
          let hours = 0;
          let minutes = 0;
          
          if (firstPart.includes('.')) {
            [hours, minutes] = firstPart.split('.').map(Number);
          } else {
            hours = Number(firstPart);
          }

          const selectedTime = new Date();
          selectedTime.setHours(hours, minutes, 0, 0);
          
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
    return newErrors;
  }, [formData]);

  const handleSubmit = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const firstError = Object.values(newErrors)[0];
        if (firstError) {
          setRedirectType('failure');
          setShowRedirectModal(true);
        }
      }
      return;
    }

    if (isOutOfCoverage) {
      trackEvent(AnalyticsEvents.OUT_OF_COVERAGE, {
        distance: formData.distanceKm,
        customer_name: formData.customerName
      });

      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryType: formData.deliveryType as 'DELIVERY' | 'PICKUP',
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        neighborhood: formData.neighborhood,
        reference: formData.reference,
        isPrivateNeighborhood: formData.isPrivateNeighborhood,
        familyName: formData.familyName,
        blockLot: formData.blockLot,
        houseNumber: formData.houseNumber,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        notes: formData.notes,
        items: cart,
        total: subtotal - discountAmount,
        shippingCost: 0,
        shippingZone: 'Zona 10 (Fuera de Rango)',
        distanceKm: formData.distanceKm,
        couponCode: appliedCoupon?.code,
        discountAmount: discountAmount
      };
      
      const paymentMethodNames = {
        [PaymentMethod.TRANSFERENCIA]: 'Transferencia Bancaria',
        [PaymentMethod.TRANSFERENCIA_MP]: 'Mercado Pago / Transferencia',
        [PaymentMethod.TARJETA_UALA]: 'Tarjeta (Ualá)',
        [PaymentMethod.EFECTIVO]: 'Efectivo',
        [PaymentMethod.PAGOS_INTERNACIONALES]: 'Pagos Internacionales'
      };

      const text = formatOrderToWhatsApp(orderData as any, products, transferAccounts);
      const whatsappMsg = `${text}\n\n*Método de Pago Preferido:* ${paymentMethodNames[formData.paymentMethod as PaymentMethod]}\n\n*Nota:* ¡El envío está fuera de nuestro rango! Pero podemos coordinar por Whatsapp.`;
      
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`;
      clearCart();
      navigate('/');
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
        total: total,
        shippingCost: 0,
        shippingZone: formData.selectedZone,
        distanceKm: formData.distanceKm,
        couponCode: appliedCoupon?.code,
        discountAmount,
        transferAccountId: formData.transferAccountId
      });

      setRedirectType('processing');
      setShowRedirectModal(true);

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formatOrderToWhatsApp(order, products, transferAccounts))}`;
      
      if (paymentUrl) {
        localStorage.setItem('lastOrder', JSON.stringify(order));
        window.location.href = paymentUrl;
      } else if (formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP || formData.paymentMethod === PaymentMethod.TARJETA_UALA) {
        setRedirectType('pending');
        setShowRedirectModal(true);
        // We'll let the modal handle the WhatsApp redirect for pending/failure
      } else {
        window.location.href = whatsappUrl;
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      setRedirectType('failure');
      setShowRedirectModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, isOutOfCoverage, formData, cart, subtotal, discountAmount, products, clearCart, navigate, addOrder, total, appliedCoupon, transferAccounts]);

  const nextStep = React.useCallback(() => {
    if (step === 1 && cart.length === 0) return;
    
    trackEvent(AnalyticsEvents.CHECKOUT_PROGRESS, {
      step: step,
      step_name: step === 1 ? 'Cart' : step === 2 ? 'Delivery' : 'Payment'
    });

    if (step === 2) {
      if (isOutOfCoverage) {
        handleSubmit();
        return;
      }
      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementsByName(firstErrorField)[0];
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  }, [step, cart.length, isOutOfCoverage, handleSubmit, validateForm]);

  const prevStep = React.useCallback(() => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  }, [step]);

  if (cartItems.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up ${theme.bg}`}>
        <div className={`${theme.heroBg} p-8 rounded-[40px] mb-8 animate-pulse`}>
          <ShoppingBag className={`h-16 w-16 ${theme.primary}`} />
        </div>
        <h2 className="text-4xl font-display font-bold text-texto dark:text-dark-text mb-4 uppercase tracking-tighter">Tu carrito está vacío</h2>
        <p className="text-texto/60 dark:text-dark-text-muted mb-10 max-w-md font-light">
          Parece que aún no has agregado ninguna caja de desayuno. ¡Elige tu regalo perfecto!
        </p>
        <Link 
          to="/personalizados"
          className={`${theme.secondary} text-white px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1`}
        >
          Ver Personalizados
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in ${theme.bg}`}>
      {/* Stepper */}
      <div className="mb-16">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          {[
            { n: 1, label: 'Carrito' },
            { n: 2, label: 'Envío' },
            { n: 3, label: 'Pago' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${
                  step >= s.n ? `${theme.secondary} text-white shadow-brand-200/40 scale-110` : `${theme.heroBg} text-texto/30 dark:text-dark-text-muted/30`
                }`}>
                  {step > s.n ? <CheckCircle className="w-6 h-6" /> : s.n}
                </div>
                <span className={`absolute -bottom-8 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500 ${
                  step >= s.n ? theme.primary : 'text-texto/30 dark:text-dark-text-muted/30'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-[2px] mx-6 ${theme.heroBg} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${theme.secondary} transition-all duration-700 ease-out`}
                    style={{ width: step > s.n ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white dark:bg-dark-surface rounded-[40px] shadow-sm border border-brand-100/5 dark:border-white/5 overflow-hidden">
                <div className={`p-8 border-b border-brand-100/5 dark:border-white/5 flex justify-between items-center ${theme.heroBg}/20`}>
                  <h2 className="text-2xl font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Tu Carrito</h2>
                  <span className="text-xs text-texto/40 dark:text-dark-text-muted/40 font-bold uppercase tracking-widest">{cartItems.length} producto(s)</span>
                </div>
                <ul className={`divide-y border-brand-100/5 dark:divide-white/5`}>
                  {cartItems.map((item, index) => (
                    <li key={item.cartItemId} className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                      <img src={item.image} alt={item.name} className={`w-28 h-28 rounded-3xl object-cover ${theme.heroBg} shadow-sm`} />
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`font-bold text-texto dark:text-dark-text text-xl uppercase tracking-tight`}>{item.name}</h3>
                            <p className={`${theme.primary} text-xs font-bold uppercase tracking-widest`}>{item.category}</p>
                          </div>
                          <p className="font-bold text-xl text-texto dark:text-dark-text">${(item.totalPrice || 0).toLocaleString()}</p>
                        </div>
                        
                        {item.itemOptionsDetails && item.itemOptionsDetails.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {item.itemOptionsDetails.map((opt, i) => (
                              <span key={i} className={`px-3 py-1 ${theme.heroBg}/50 text-texto/60 dark:text-dark-text-muted text-[10px] rounded-full border border-brand-100/5 dark:border-white/5 font-medium`}>
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
 
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center ${theme.heroBg} rounded-2xl p-1.5 border border-brand-100/5 dark:border-white/5`}>
                            <button 
                              onClick={() => item.quantity > 1 && addToCart(item.id, -1, item.selectedOptions)}
                              className={`p-1.5 hover:bg-white dark:hover:bg-dark-surface rounded-xl transition-all text-texto/40 dark:text-dark-text-muted/40 hover:${theme.primary}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-bold text-sm text-texto dark:text-dark-text">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item.id, 1, item.selectedOptions)}
                              className={`p-1.5 hover:bg-white dark:hover:bg-dark-surface rounded-xl transition-all text-texto/40 dark:text-dark-text-muted/40 hover:${theme.primary}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.cartItemId)}
                            className={`text-texto/30 dark:text-dark-text-muted/30 hover:${theme.primary} text-xs flex items-center gap-2 transition-all font-bold uppercase tracking-widest`}
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
 
              {/* Upselling Section */}
              {groupedComplementos.length > 0 && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <h3 className="text-xl font-display font-bold text-texto dark:text-dark-text flex items-center gap-3 uppercase tracking-tight">
                      <Gift className={`w-6 h-6 ${theme.primary}`} />
                      ¿Querés sumar algo más?
                    </h3>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                      {groupedComplementos.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => setActiveComplementCategory(cat.name)}
                          className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                            activeComplementCategory === cat.name 
                              ? `${theme.secondary} text-white border-brand-500 shadow-lg shadow-brand-200/20` 
                              : `bg-white dark:bg-dark-surface text-texto/40 dark:text-dark-text-muted/40 border-brand-100/5 dark:border-white/5 hover:border-brand-100/20`
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {groupedComplementos.find(c => c.name === activeComplementCategory)?.products.slice(0, 8).map(p => (
                      <div key={p.id} className={`bg-white dark:bg-dark-surface p-4 rounded-[32px] border border-brand-100/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden`}>
                        <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <button 
                            onClick={() => addToCart(p.id, 1)}
                            className={`absolute bottom-3 right-3 ${theme.secondary} text-white p-2.5 rounded-xl shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <h4 className="text-[11px] font-bold text-texto dark:text-dark-text uppercase tracking-tight truncate mb-1">{p.name}</h4>
                        <p className={`${theme.primary} font-bold text-sm`}>${(p.price || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
 
            <div className="lg:col-span-1">
              <div className={`bg-white dark:bg-dark-surface rounded-[40px] p-8 border border-brand-100/5 dark:border-white/5 shadow-sm sticky top-24 space-y-8`}>
                <h3 className="text-xl font-display font-bold text-texto dark:text-dark-text uppercase tracking-tight">Resumen</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-texto/60 dark:text-dark-text-muted text-sm font-medium">
                    <span>Subtotal</span>
                    <span>${(subtotal || 0).toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-verde text-sm font-bold">
                      <span>Descuento ({appliedCoupon?.code})</span>
                      <span>-${(discountAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {/* Shipping line removed as per user request */}
                  <div className={`pt-6 border-t border-brand-100/5 dark:border-white/5 flex justify-between items-center`}>
                    <span className="font-bold text-texto dark:text-dark-text uppercase tracking-widest text-xs">Total</span>
                    <span className={`text-3xl font-bold ${theme.primary} font-display tracking-tighter`}>${(total || 0).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={nextStep}
                  className={`w-full ${theme.secondary} text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-all shadow-xl shadow-brand-200/10 flex items-center justify-center gap-3 group`}
                >
                  {isOutOfCoverage ? 'Consultar por WhatsApp' : 'Continuar'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={clearCart}
                  className={`w-full py-2 text-texto/30 dark:text-dark-text-muted/30 text-[10px] font-bold uppercase tracking-widest hover:${theme.primary} transition-colors`}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className={`bg-white dark:bg-dark-surface rounded-[40px] p-8 border border-brand-100/5 dark:border-white/5 shadow-xl shadow-brand-200/5 space-y-8`}>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold text-texto dark:text-dark-text">Datos de Entrega</h2>
                <button onClick={prevStep} className={`text-texto/40 dark:text-dark-text-muted/40 hover:${theme.primary} flex items-center gap-1 text-sm font-bold transition-colors`}>
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">Tus Datos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                      <input 
                        type="text" 
                        name="customerName"
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.customerName ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                      />
                      {errors.customerName && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.customerName}</p>}
                    </div>
                    <div className="relative">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                      <input 
                        type="tel" 
                        name="customerPhone"
                        placeholder="Tu teléfono"
                        autoComplete="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.customerPhone ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                      />
                      {errors.customerPhone && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.customerPhone}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">Tipo de Entrega</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({...formData, deliveryType: 'DELIVERY'})}
                      className={`p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-3 ${formData.deliveryType === 'DELIVERY' ? `border-brand-500 ${theme.heroBg}/50 dark:bg-brand-500/10` : `border-brand-100/5 dark:border-white/5 ${theme.bg}/10 dark:bg-dark-bg/10 hover:${theme.bg}/20 dark:hover:bg-dark-bg/20`}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.deliveryType === 'DELIVERY' ? `${theme.secondary} text-white` : `bg-white dark:bg-dark-surface ${theme.primary}/40`}`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${formData.deliveryType === 'DELIVERY' ? theme.primary : 'text-texto/60 dark:text-dark-text-muted'}`}>Envío a domicilio</span>
                    </button>
                    <button
                      onClick={() => setFormData({...formData, deliveryType: 'PICKUP'})}
                      className={`p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-3 ${formData.deliveryType === 'PICKUP' ? `border-brand-500 ${theme.heroBg}/50 dark:bg-brand-500/10` : `border-brand-100/5 dark:border-white/5 ${theme.bg}/10 dark:bg-dark-bg/10 hover:${theme.bg}/20 dark:hover:bg-dark-bg/20`}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.deliveryType === 'PICKUP' ? `${theme.secondary} text-white` : `bg-white dark:bg-dark-surface ${theme.primary}/40`}`}>
                        <Home className="w-5 h-5" />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${formData.deliveryType === 'PICKUP' ? theme.primary : 'text-texto/60 dark:text-dark-text-muted'}`}>Retiro por local</span>
                    </button>
                  </div>
                </div>

                {formData.deliveryType === 'DELIVERY' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className={`flex items-center gap-3 p-4 ${theme.heroBg}/30 dark:bg-dark-bg/30 rounded-2xl border border-brand-100/5 dark:border-white/5`}>
                      <input 
                        type="checkbox" 
                        id="isPrivate"
                        checked={formData.isPrivateNeighborhood}
                        onChange={(e) => setFormData({...formData, isPrivateNeighborhood: e.target.checked})}
                        className={`w-5 h-5 ${theme.primary} rounded-lg border-brand-100/20 focus:ring-brand-500/20 cursor-pointer`}
                      />
                      <label htmlFor="isPrivate" className="text-sm font-bold text-texto dark:text-dark-text cursor-pointer">Es un barrio privado / country</label>
                    </div>

                    {formData.isPrivateNeighborhood ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <input 
                            name="neighborhood"
                            placeholder="Nombre del Barrio"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                            className={`w-full px-5 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.neighborhood ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.neighborhood && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.neighborhood}</p>}
                        </div>
                        <div className="space-y-1">
                          <input 
                            name="familyName"
                            placeholder="Nombre de la Familia"
                            value={formData.familyName}
                            onChange={(e) => setFormData({...formData, familyName: e.target.value})}
                            className={`w-full px-5 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.familyName ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.familyName && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.familyName}</p>}
                        </div>
                        <div className="space-y-1">
                          <input 
                            name="blockLot"
                            placeholder="Manzana y Lote"
                            value={formData.blockLot}
                            onChange={(e) => setFormData({...formData, blockLot: e.target.value})}
                            className={`w-full px-5 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.blockLot ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.blockLot && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.blockLot}</p>}
                        </div>
                        <div className="space-y-1">
                          <input 
                            name="houseNumber"
                            placeholder="Nro de Casa"
                            value={formData.houseNumber}
                            onChange={(e) => setFormData({...formData, houseNumber: e.target.value})}
                            className={`w-full px-5 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.houseNumber ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.houseNumber && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.houseNumber}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                          <input 
                            ref={addressInputRef}
                            name="deliveryAddress"
                            placeholder="Dirección exacta"
                            autoComplete="street-address"
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                            className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.deliveryAddress ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.deliveryAddress && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.deliveryAddress}</p>}
                        </div>
                        <input 
                          placeholder="Referencia (Piso, Dpto, timbre, etc)"
                          value={formData.reference}
                          onChange={(e) => setFormData({...formData, reference: e.target.value})}
                          className={`w-full px-5 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border border-brand-100/5 dark:border-white/5 rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                        />
                      </div>
                    )}

                    {mapUrl && (
                      <div className="space-y-4">
                        <div className={`rounded-[32px] overflow-hidden border border-brand-100/5 dark:border-white/5 shadow-inner aspect-video relative ${theme.heroBg}/10 dark:bg-dark-bg/10`}>
                          <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={mapUrl}
                            className="grayscale-[0.2] contrast-[1.1] dark:invert dark:hue-rotate-180"
                          />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {isCalculatingDistance ? (
                            <div className={`flex items-center gap-2 px-5 py-3 ${theme.heroBg}/20 dark:bg-dark-bg/20 rounded-2xl border border-brand-100/5 dark:border-white/5 animate-pulse`}>
                              <Loader2 className={`w-4 h-4 animate-spin ${theme.primary}/40`} />
                              <span className="text-xs font-bold text-texto/40 dark:text-dark-text-muted/40">Calculando distancia...</span>
                            </div>
                          ) : formData.distanceKm > 0 && (
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                              <div className={`flex items-center gap-2 px-5 py-3 ${theme.heroBg}/30 dark:bg-dark-bg/30 rounded-2xl border border-brand-100/5 dark:border-white/5 flex-1 justify-center`}>
                                <span className="text-xs font-bold text-texto dark:text-dark-text">Distancia estimada: <span className={theme.primary}>{formData.distanceKm} km</span></span>
                              </div>
                              {!isOutOfCoverage && (
                                <div className="flex items-center gap-2 px-5 py-3 bg-verde/10 dark:bg-verde/20 rounded-2xl border border-verde/20 flex-1 justify-center">
                                  <span className="text-xs font-bold text-verde">Costo de envío: <span className="text-texto dark:text-dark-text">${(shippingCost || 0).toLocaleString()}</span></span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {isOutOfCoverage && (
                      <div className={`p-5 ${theme.heroBg}/5 dark:bg-brand-500/10 border border-brand-500/20 dark:border-brand-500/30 rounded-[32px] flex items-start gap-4 animate-shake`}>
                        <div className={`w-10 h-10 rounded-full ${theme.heroBg}/10 dark:bg-brand-500/20 flex items-center justify-center shrink-0`}>
                          <AlertCircle className={`w-6 h-6 ${theme.primary}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-texto dark:text-dark-text mb-1">¡El envío está fuera de nuestro rango!</p>
                          <p className="text-xs text-texto/60 dark:text-dark-text-muted leading-relaxed mb-4">
                            Tu ubicación se encuentra en la <strong className={theme.primary}>Zona 10 (Lejos)</strong>. 
                            No podemos procesar el pago automático, pero podemos coordinar por Whatsapp para enviarte tu pedido.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">Datos de quien recibe</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                          <input 
                            type="text" 
                            name="recipientName"
                            placeholder="Nombre de quien recibe"
                            autoComplete="name"
                            value={formData.recipientName}
                            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                            className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.recipientName ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.recipientName && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.recipientName}</p>}
                        </div>
                        <div className="relative">
                          <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                          <input 
                            type="tel" 
                            name="recipientPhone"
                            placeholder="Teléfono de quien recibe"
                            autoComplete="tel"
                            value={formData.recipientPhone}
                            onChange={(e) => setFormData({...formData, recipientPhone: e.target.value})}
                            className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.recipientPhone ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                          />
                          {errors.recipientPhone && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.recipientPhone}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">¿Cuándo entregamos?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="relative">
                        <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                        <input 
                          type="date" 
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                          className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.deliveryDate ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text transition-all`}
                        />
                      </div>
                      {errors.deliveryDate && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.deliveryDate}</p>}
                      {formData.deliveryDate && new Date(formData.deliveryDate + 'T00:00:00') < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) && (
                        <div className={`flex items-center gap-2 mt-2 p-3 ${theme.heroBg}/5 dark:bg-brand-500/10 rounded-xl border border-brand-500/10 dark:border-brand-500/20`}>
                          <AlertCircle className={`w-4 h-4 ${theme.primary}`} />
                          <p className={`text-[10px] font-bold ${theme.primary}`}>¡Tu pedido es para un día anterior, verificalo!</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                        <select 
                          name="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                          className={`w-full pl-12 pr-10 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border ${errors.deliveryTime ? 'border-red-500' : 'border-brand-100/5 dark:border-white/5'} rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text appearance-none transition-all`}
                        >
                          <option value="">Seleccionar rango horario</option>
                          <option value="8 a 9.15hs">8 a 9.15hs</option>
                          <option value="8.30 a 9.45hs">8.30 a 9.45hs</option>
                          <option value="9 a 10.15hs">9 a 10.15hs</option>
                          <option value="9.30 a 10.45hs">9.30 a 10.45hs</option>
                          <option value="10 a 11.15hs">10 a 11.15hs</option>
                          <option value="10.30 a 12hs">10.30 a 12hs</option>
                          <option value="12 a 14hs">12 a 14hs</option>
                          <option value="16.30 a 19hs">16.30 a 19hs</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className={`w-4 h-4 ${theme.primary}/40 rotate-90`} />
                        </div>
                      </div>
                      {errors.deliveryTime && <p className="text-[10px] text-red-500 ml-1 font-bold">{errors.deliveryTime}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">Tarjeta dedicatoria</label>
                  <div className="relative">
                    <MessageSquare className={`absolute left-4 top-4 w-4 h-4 ${theme.primary}/40`} />
                    <textarea 
                      placeholder="Escribí un mensaje especial..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border border-brand-100/5 dark:border-white/5 rounded-2xl outline-none text-sm font-medium text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 h-32 resize-none transition-all`}
                    />
                  </div>
                </div>
              </div>

                <div className={`pt-6 border-t border-brand-100/5 dark:border-white/5 space-y-3`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-texto/40 dark:text-dark-text-muted/40 font-bold uppercase tracking-wider">Subtotal</span>
                    <span className="text-texto dark:text-dark-text font-bold">${(subtotal || 0).toLocaleString()}</span>
                  </div>
                  {formData.deliveryType === 'DELIVERY' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-texto/40 dark:text-dark-text-muted/40 font-bold uppercase tracking-wider">Envío</span>
                      <span className="text-texto dark:text-dark-text font-bold">
                        {isCalculatingDistance ? 'Calculando...' : 
                         isOutOfCoverage ? 'A coordinar' : 
                         shippingCost === 0 ? 'Sin cargo' : `$${(shippingCost || 0).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className={`flex justify-between text-2xl pt-3 border-t border-brand-100/5 dark:border-white/5`}>
                    <span className="font-display font-bold text-texto dark:text-dark-text">Total estimado</span>
                    <span className={`font-display font-bold ${theme.primary}`}>
                      {isCalculatingDistance ? '...' : 
                       isOutOfCoverage ? `$${(totalAfterDiscount || 0).toLocaleString()} + Envío` : 
                       `$${((totalAfterDiscount || 0) + (shippingCost || 0)).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={isOutOfCoverage ? () => handleSubmit() : nextStep}
                  disabled={isCalculatingDistance}
                  className={`w-full py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isCalculatingDistance
                      ? `bg-crema dark:bg-dark-bg text-texto/20 dark:text-dark-text-muted/20 cursor-not-allowed`
                      : isOutOfCoverage 
                        ? 'bg-texto dark:bg-dark-bg text-crema dark:text-dark-text hover:bg-black dark:hover:bg-black shadow-texto/10' 
                        : `${theme.secondary} text-white hover:opacity-90 shadow-brand-500/20`
                  }`}
                >
                  {isCalculatingDistance ? (
                    <>Calculando... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : isOutOfCoverage ? (
                    <>Consultar por WhatsApp <Send className="w-5 h-5" /></>
                  ) : (
                    <>Continuar al Pago <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className={`bg-white dark:bg-dark-surface rounded-[40px] p-8 border border-brand-100/5 dark:border-white/5 shadow-xl shadow-brand-200/5 space-y-8`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-texto dark:text-dark-text">Método de Pago</h2>
                  <button onClick={prevStep} className={`text-texto/40 dark:text-dark-text-muted/40 hover:${theme.primary} flex items-center gap-1 text-sm font-bold transition-colors`}>
                    <ChevronLeft className="w-4 h-4" /> Volver
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: PaymentMethod.TRANSFERENCIA, label: 'Transferencia / Digital', sub: isMPEnabled ? 'Mercado Pago (Automático)' : activeTransferAccounts.length > 0 ? activeTransferAccounts[0].bankName : 'Bancaria / Digital', icon: CreditCard },
                    { id: PaymentMethod.TARJETA_UALA, label: 'Tarjeta (Ualá)', sub: '+15% recargo', icon: CreditCard },
                    { id: PaymentMethod.EFECTIVO, label: 'Efectivo', sub: 'En el local', icon: ShoppingBag },
                    { id: PaymentMethod.PAGOS_INTERNACIONALES, label: 'Internacional', sub: 'PayPal / Western', icon: Send }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (m.id === PaymentMethod.TRANSFERENCIA) {
                          if (isMPEnabled) {
                            setFormData({...formData, paymentMethod: PaymentMethod.TRANSFERENCIA_MP, transferAccountId: ''});
                          } else if (activeTransferAccounts.length > 0) {
                            setFormData({...formData, paymentMethod: PaymentMethod.TRANSFERENCIA, transferAccountId: activeTransferAccounts[0].id});
                          } else {
                            setFormData({...formData, paymentMethod: PaymentMethod.TRANSFERENCIA, transferAccountId: ''});
                          }
                        } else {
                          setFormData({...formData, paymentMethod: m.id});
                        }
                      }}
                      className={`p-6 rounded-[32px] border-2 transition-all text-left flex items-center gap-4 ${formData.paymentMethod === PaymentMethod.TRANSFERENCIA && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === m.id ? `border-brand-500 ${theme.heroBg}/50 dark:bg-brand-500/10` : `border-brand-100/5 dark:border-white/5 ${theme.bg}/10 dark:bg-dark-bg/10 hover:${theme.bg}/20 dark:hover:bg-dark-bg/20`}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.paymentMethod === PaymentMethod.TRANSFERENCIA && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === m.id ? `${theme.secondary} text-white` : `bg-white dark:bg-dark-surface ${theme.primary}/40`}`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm tracking-tight ${formData.paymentMethod === PaymentMethod.TRANSFERENCIA && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP && m.id === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === m.id ? theme.primary : 'text-texto dark:text-dark-text'}`}>{m.label}</p>
                        <p className="text-[10px] text-texto/40 dark:text-dark-text-muted/40 font-bold uppercase tracking-wider">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {(formData.paymentMethod === PaymentMethod.TRANSFERENCIA || formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {formData.paymentMethod === PaymentMethod.TRANSFERENCIA_MP && (
                      <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[32px] border border-blue-200/50 dark:border-blue-800/50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-2xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-blue-900 dark:text-blue-100">Mercado Pago (Automático)</p>
                          <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 font-bold uppercase tracking-wider">Acreditación instantánea</p>
                        </div>
                      </div>
                    )}
                    
                    {formData.paymentMethod === PaymentMethod.TRANSFERENCIA && formData.transferAccountId && (
                      <div className={`p-6 ${theme.heroBg}/30 dark:bg-dark-bg/30 rounded-[32px] border border-brand-500/10 space-y-3`}>
                        <p className={`text-xs font-bold ${theme.primary} uppercase tracking-widest`}>Datos de la cuenta</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-texto/40 uppercase">Banco</span>
                            <span className="text-xs font-bold text-texto">{transferAccounts.find(a => a.id === formData.transferAccountId)?.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-texto/40 uppercase">Titular</span>
                            <span className="text-xs font-bold text-texto">{transferAccounts.find(a => a.id === formData.transferAccountId)?.accountHolder}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-texto/40 uppercase">{transferAccounts.find(a => a.id === formData.transferAccountId)?.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-texto">{transferAccounts.find(a => a.id === formData.transferAccountId)?.cbu}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(transferAccounts.find(a => a.id === formData.transferAccountId)?.cbu || '');
                                }}
                                className={`p-1 hover:${theme.heroBg}/10 rounded-md transition-colors`}
                              >
                                <Copy className={`w-3 h-3 ${theme.primary}`} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-texto/40 uppercase">Alias</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-texto">{transferAccounts.find(a => a.id === formData.transferAccountId)?.alias}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(transferAccounts.find(a => a.id === formData.transferAccountId)?.alias || '');
                                }}
                                className={`p-1 hover:${theme.heroBg}/10 rounded-md transition-colors`}
                              >
                                <Copy className={`w-3 h-3 ${theme.primary}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className={`text-[10px] text-texto/40 italic pt-2 border-t border-brand-500/5`}>
                          * Por favor, envianos el comprobante por WhatsApp al finalizar.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-texto/40 dark:text-dark-text-muted/40 uppercase tracking-[0.2em]">¿Tenés un cupón de descuento?</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.primary}/40`} />
                      <input 
                        placeholder="Ingresá tu código"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className={`w-full pl-12 pr-4 py-4 ${theme.heroBg}/20 dark:bg-dark-bg/20 border border-brand-100/5 dark:border-white/5 rounded-2xl outline-none text-sm font-mono font-bold text-texto dark:text-dark-text placeholder:text-texto/30 dark:placeholder:text-dark-text-muted/30 transition-all`}
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className={`px-8 ${theme.secondary} text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-500/10`}
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-bold ml-1">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between p-4 bg-verde/10 dark:bg-verde/20 border border-verde/20 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-verde/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-verde" />
                        </div>
                        <span className="text-xs font-bold text-texto dark:text-dark-text">Cupón <span className="text-verde">{appliedCoupon.code}</span> aplicado</span>
                      </div>
                      <button onClick={removeCoupon} className="text-texto/40 dark:text-dark-text-muted/40 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className={`bg-white dark:bg-dark-surface rounded-[40px] p-8 border border-brand-100/5 dark:border-white/5 shadow-xl shadow-brand-200/5 sticky top-24 space-y-8`}>
                <h3 className="text-2xl font-display font-bold text-texto dark:text-dark-text">Resumen Final</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-texto/40 dark:text-dark-text-muted/40 text-xs font-bold uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-texto dark:text-dark-text font-bold">${(subtotal || 0).toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-verde text-xs font-bold uppercase tracking-wider">
                      <span>Descuento ({appliedCoupon?.code})</span>
                      <span>-${(discountAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {surcharge > 0 && (
                    <div className={`flex justify-between ${theme.primary} text-xs font-bold uppercase tracking-wider`}>
                      <span>Recargo Tarjeta (15%)</span>
                      <span>+${(surcharge || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {formData.deliveryType === 'DELIVERY' && (
                    <div className="flex justify-between text-texto/40 dark:text-dark-text-muted/40 text-xs font-bold uppercase tracking-wider">
                      <span>Envío {isOutOfCoverage ? '(Zona 10 - Lejos)' : ''}</span>
                      <span className="text-texto dark:text-dark-text">
                        {isOutOfCoverage ? 'A coordinar' : 
                         shippingCost === 0 ? 'Sin cargo' : `$${(shippingCost || 0).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className={`pt-6 border-t border-brand-100/5 dark:border-white/5 flex justify-between items-center`}>
                    <span className="font-display font-bold text-texto dark:text-dark-text text-xl">Total</span>
                    <span className={`text-3xl font-bold ${theme.primary} font-display`}>
                      {isOutOfCoverage ? `$${((totalAfterDiscount || 0) + (surcharge || 0)).toLocaleString()} + Envío` : `$${(total || 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className={`p-5 rounded-[32px] border flex items-start gap-4 ${isOutOfCoverage ? `${theme.heroBg}/5 dark:bg-brand-500/10 border-brand-500/20 dark:border-brand-500/30` : `${theme.heroBg}/30 dark:bg-dark-bg/30 border-brand-100/5 dark:border-white/5`}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOutOfCoverage ? `${theme.heroBg}/10 dark:bg-brand-500/20` : 'bg-white dark:bg-dark-bg'}`}>
                    <AlertCircle className={`w-6 h-6 ${isOutOfCoverage ? theme.primary : `${theme.primary}/40`}`} />
                  </div>
                  <p className={`text-[10px] font-medium leading-relaxed ${isOutOfCoverage ? 'text-texto/60 dark:text-dark-text-muted' : 'text-texto/60 dark:text-dark-text-muted'}`}>
                    {isOutOfCoverage 
                      ? 'Al confirmar, se enviará el pedido directamente a WhatsApp para coordinar el envío y el pago manualmente.'
                      : 'Al confirmar, serás redirigido para completar el pago y luego a WhatsApp para enviarnos el resumen.'}
                  </p>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${
                    isOutOfCoverage 
                      ? 'bg-texto dark:bg-dark-bg text-crema dark:text-dark-text hover:bg-black dark:hover:bg-black shadow-texto/10' 
                      : `${theme.secondary} text-white hover:opacity-90 shadow-brand-500/20`
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isOutOfCoverage ? (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Consultar por WhatsApp
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showRedirectModal && (
        <div className="fixed inset-0 bg-texto/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`bg-white dark:bg-dark-surface rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border border-brand-100/5 dark:border-white/5 animate-scale-in`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
              redirectType === 'success' ? 'bg-verde/10' : 
              (redirectType === 'failure' || redirectType === 'pending') ? `${theme.heroBg}/10` : `${theme.heroBg} dark:bg-dark-bg`
            }`}>
              {redirectType === 'success' ? (
                <CheckCircle className="w-12 h-12 text-verde animate-bounce" />
              ) : (redirectType === 'failure' || redirectType === 'pending') ? (
                <XCircle className={`w-12 h-12 ${theme.primary}`} />
              ) : (
                <Loader2 className={`w-12 h-12 ${theme.primary} animate-spin`} />
              )}
            </div>
            
            <h2 className="text-3xl font-display font-bold text-texto dark:text-dark-text mb-3">
              {redirectType === 'success' ? '¡Pago Exitoso!' : 
               redirectType === 'failure' ? 'Pago no realizado' :
               redirectType === 'pending' ? 'Pago pendiente' : 'Procesando...'}
            </h2>
            
            <p className="text-texto/60 dark:text-dark-text-muted text-sm font-medium mb-8 leading-relaxed">
              {redirectType === 'success' 
                ? 'Tu pago ha sido procesado. Por favor, envíanos el detalle por WhatsApp para coordinar la entrega.'
                : redirectType === 'failure' || redirectType === 'pending'
                ? (returnedOrder ? 'Parece que no se completó el pago. ¿Qué te gustaría hacer?' : 'Por favor, revisá los datos ingresados e intentá nuevamente.')
                : 'Estamos preparando todo para tu pedido...'}
            </p>

            {redirectType === 'success' && returnedOrder ? (
              <button
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formatOrderToWhatsApp(returnedOrder, products))}`;
                  window.location.href = whatsappUrl;
                }}
                className="w-full bg-verde text-white py-4 rounded-2xl font-bold hover:bg-verde/90 transition-all shadow-xl shadow-verde/20 flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-5 h-5" />
                Enviar WhatsApp
              </button>
            ) : (redirectType === 'failure' || redirectType === 'pending') ? (
              <div className="space-y-3">
                {returnedOrder ? (
                  <>
                    <button
                      onClick={() => setShowRedirectModal(false)}
                      className={`w-full ${theme.secondary} text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-brand-500/20`}
                    >
                      Reintentar pago
                    </button>
                    <button
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formatOrderToWhatsApp(returnedOrder, products))}`;
                        window.location.href = whatsappUrl;
                      }}
                      className="w-full bg-verde text-white py-4 rounded-2xl font-bold hover:bg-verde/90 transition-all shadow-xl shadow-verde/20 flex items-center justify-center gap-3"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Coordinar por WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        setStep(3);
                        setShowRedirectModal(false);
                      }}
                      className={`w-full ${theme.heroBg} dark:bg-dark-bg text-texto dark:text-dark-text py-4 rounded-2xl font-bold hover:opacity-80 transition-all`}
                    >
                      Cambiar forma de pago
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowRedirectModal(false)}
                    className={`w-full ${theme.secondary} text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-brand-500/20`}
                  >
                    Volver a revisar
                  </button>
                )}
                
                {returnedOrder && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('lastOrder');
                      setShowRedirectModal(false);
                    }}
                    className="w-full text-texto/40 dark:text-dark-text-muted/40 py-2 text-xs font-bold uppercase tracking-widest hover:text-texto dark:hover:text-dark-text transition-colors mt-4"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
