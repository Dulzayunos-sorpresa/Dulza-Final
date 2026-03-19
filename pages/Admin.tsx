import React, { useState, useEffect } from 'react';
import { useStore } from '../context/store';
import { OrderStatus, Product, Order, ProductOption, PaymentStatus, PaymentMethod, ShippingSettings } from '../types';
import { PrinterService } from '../services/PrinterService';
import { auth, loginWithGoogle, logout } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Printer, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Search,
  Save,
  Bluetooth,
  Usb,
  Settings2,
  Trash2,
  Edit,
  Camera,
  Video,
  Image as ImageIcon,
  LogOut,
  TrendingUp,
  DollarSign,
  Truck,
  Info,
  Users,
  Calendar as CalendarIcon,
  Tag,
  Gift,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MessageSquare,
  User as UserIcon,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Coupon } from '../types';
import { formatOrderToWhatsApp } from '../src/utils/orderUtils';
import { trackEvent, AnalyticsEvents } from '../src/utils/analytics';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === adminPassword) {
      setIsPasswordCorrect(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert("¡Rajá de acá! Clave incorrecta. 💅");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { 
    products, 
    orders, 
    updateStock, 
    updateOrderStatus, 
    updateOrderPaymentStatus, 
    updateOrderShipping,
    addOrder, 
    options, 
    addOption, 
    updateOption, 
    deleteOption, 
    updateProductOptions, 
    updateProduct, 
    subobjects,
    addSubobject,
    updateSubobject,
    deleteSubobject,
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon,
    shippingSettings,
    updateShippingSettings
  } = useStore();

  const SHIPPING_ZONES = [
    { name: 'Zona 1 (Cerca)', cost: 2000 },
    { name: 'Zona 2 (Media)', cost: 4000 },
    { name: 'Zona 3 (Lejos)', cost: 6000 },
    { name: 'Zona 4 (Muy Lejos)', cost: 8000 },
    { name: 'Envío Gratis', cost: 0 }
  ];

  const hasFreeDelivery = (order: Order) => {
    return order.items.some(item => {
      const p = products.find(prod => prod.id === item.id);
      return p?.tags?.includes('ENVÍO GRATIS') || p?.freeDelivery;
    });
  };

  const getGoogleMapsLink = (order: Order) => {
    const origin = encodeURIComponent("Nicolas Avellaneda 327");
    let destination = "";
    if (order.isPrivateNeighborhood) {
      destination = encodeURIComponent(`${order.neighborhood}, Manzana ${order.blockLot}, Casa ${order.houseNumber}`);
    } else {
      destination = encodeURIComponent(order.deliveryAddress || "");
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  };
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'stock' | 'new-order' | 'options' | 'subobjects' | 'coupons' | 'shipping'>('dashboard');
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [tempShipping, setTempShipping] = useState<ShippingSettings | null>(null);

  const handleSaveShipping = async () => {
    if (tempShipping) {
      await updateShippingSettings(tempShipping);
      setIsEditingShipping(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'TODOS'>('TODOS');
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  // Coupons State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState<Omit<Coupon, 'id'>>({
    code: '',
    discount: 0,
    type: 'percentage',
    isActive: true,
    minPurchase: 0
  });

  // Stats calculation
  const stats = {
    totalRevenue: orders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((sum, o) => sum + o.total, 0),
    orderCount: orders.length,
    pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
    preparingOrders: orders.filter(o => o.status === OrderStatus.PREPARING).length,
    deliveredOrders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelledOrders: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
    revenueByDay: orders
      .filter(o => o.paymentStatus === PaymentStatus.PAID)
      .reduce((acc: any[], order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.revenue += order.total;
          existing.orders += 1;
        } else {
          acc.push({ date, revenue: order.total, orders: 1 });
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7),
    topProducts: products
      .map(p => ({
        name: p.name,
        count: orders.reduce((sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((iSum, i) => iSum + i.quantity, 0), 0)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    paymentMethods: orders.reduce((acc: any[], order) => {
      const existing = acc.find(item => item.name === order.paymentMethod);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: order.paymentMethod, value: 1 });
      }
      return acc;
    }, [])
  };

  const COLORS = ['#D4A373', '#A98467', '#6B705C', '#B7B7A4', '#FFE8D6'];

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Options Management State
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionForm, setNewOptionForm] = useState<ProductOption>({
    id: '',
    name: '',
    type: 'select',
    values: [],
    description: ''
  });
  const [newValue, setNewValue] = useState({ id: '', name: '', price: 0 });
  const [subobjectSearch, setSubobjectSearch] = useState('');

  // Subobjects Management State
  const [editingSubobject, setEditingSubobject] = useState<ProductOptionValue | null>(null);
  const [isAddingSubobject, setIsAddingSubobject] = useState(false);
  const [newSubobjectForm, setNewSubobjectForm] = useState<ProductOptionValue>({
    id: '',
    name: '',
    price: 0,
    category: ''
  });

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
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
    paymentMethod: 'TRANSFERENCIA',
    notes: '',
    items: [] as { productId: string; quantity: number; selectedOptions?: { optionId: string; values: string[] }[] }[]
  });

  const [selectedProductOptions, setSelectedProductOptions] = useState<Record<string, string[]>>({});
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = async (order: Order, method: 'bluetooth' | 'usb') => {
    setPrintingOrderId(order.id);
    const content = PrinterService.formatOrder(order, products);
    
    try {
      if (method === 'bluetooth') {
        await PrinterService.printViaBluetooth(content);
      } else {
        await PrinterService.printViaUSB(content);
      }
      alert('Impresión enviada con éxito');
    } catch (error) {
      alert(`Error al imprimir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setPrintingOrderId(null);
    }
  };

  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  const validateOrderForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newOrderForm.customerName.trim()) newErrors.customerName = 'Nombre obligatorio';
    
    const phoneRegex = /^\d{10,15}$/;
    if (!newOrderForm.customerPhone.trim()) {
      newErrors.customerPhone = 'Teléfono obligatorio';
    } else if (!phoneRegex.test(newOrderForm.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Teléfono inválido (10-15 dígitos)';
    }

    if (newOrderForm.deliveryType === 'DELIVERY') {
      if (newOrderForm.isPrivateNeighborhood) {
        if (!newOrderForm.neighborhood.trim()) newErrors.neighborhood = 'Barrio obligatorio';
        if (!newOrderForm.familyName.trim()) newErrors.familyName = 'Familia obligatoria';
        if (!newOrderForm.blockLot.trim()) newErrors.blockLot = 'Manzana/Lote obligatorio';
        if (!newOrderForm.houseNumber.trim()) newErrors.houseNumber = 'Casa N⁰ obligatorio';
      } else {
        if (!newOrderForm.deliveryAddress.trim()) newErrors.deliveryAddress = 'Dirección obligatoria';
      }
    }

    if (!newOrderForm.deliveryDate.trim()) {
      newErrors.deliveryDate = 'Fecha obligatoria';
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDate = new Date(newOrderForm.deliveryDate + 'T00:00:00');
      
      if (selectedDate < today) {
        newErrors.deliveryDate = 'La fecha no puede ser anterior a hoy';
      }
    }
    
    if (!newOrderForm.deliveryTime.trim()) newErrors.deliveryTime = 'Horario obligatorio';

    setOrderErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderForm.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!validateOrderForm()) {
      return;
    }

    const subtotal = newOrderForm.items.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return sum;
      
      let optionsPrice = 0;
      if (item.selectedOptions && p.options) {
        item.selectedOptions.forEach(selectedOpt => {
          const option = p.options?.find(o => o.id === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valName => {
              const val = option.values.find(v => v.name === valName);
              if (val?.price) optionsPrice += val.price;
            });
          }
        });
      }
      return sum + (p.price + optionsPrice) * item.quantity;
    }, 0);

    const surcharge = newOrderForm.paymentMethod === PaymentMethod.TARJETA_UALA ? subtotal * 0.15 : 0;
    const total = subtotal + surcharge;

    addOrder({
      customerName: newOrderForm.customerName,
      customerPhone: newOrderForm.customerPhone,
      deliveryType: newOrderForm.deliveryType,
      deliveryAddress: newOrderForm.deliveryType === 'PICKUP' ? 'Nicolas Avellaneda 327' : (newOrderForm.isPrivateNeighborhood ? newOrderForm.neighborhood : newOrderForm.deliveryAddress),
      deliveryDate: newOrderForm.deliveryDate,
      deliveryTime: newOrderForm.deliveryTime,
      recipientName: newOrderForm.deliveryType === 'PICKUP' ? '' : newOrderForm.recipientName,
      recipientPhone: newOrderForm.deliveryType === 'PICKUP' ? '' : newOrderForm.recipientPhone,
      neighborhood: newOrderForm.deliveryType === 'PICKUP' ? '' : newOrderForm.neighborhood,
      reference: newOrderForm.deliveryType === 'PICKUP' ? '' : newOrderForm.reference,
      isPrivateNeighborhood: newOrderForm.isPrivateNeighborhood,
      familyName: newOrderForm.familyName,
      blockLot: newOrderForm.blockLot,
      houseNumber: newOrderForm.houseNumber,
      paymentMethod: newOrderForm.paymentMethod as PaymentMethod,
      notes: newOrderForm.notes,
      items: newOrderForm.items.map(i => ({ id: Math.random().toString(36).substr(2, 9), ...i })),
      total
    });

    setNewOrderForm({
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
      notes: '',
      items: []
    });
    setSelectedProductOptions({});
    setCurrentSelectedProductId('');
    setActiveTab('orders');
    alert('Pedido creado con éxito');
  };

  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});

  const validateOptionForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newOptionForm.id.trim()) newErrors.id = 'ID obligatorio';
    if (!newOptionForm.name.trim()) newErrors.name = 'Nombre obligatorio';
    if (newOptionForm.values.length === 0) newErrors.values = 'Debe agregar al menos una opción';
    
    setOptionErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveOption = () => {
    if (validateOptionForm()) {
      if (editingOption) {
        updateOption(newOptionForm);
      } else {
        addOption(newOptionForm);
      }
      setIsAddingOption(false);
      setEditingOption(null);
      setOptionErrors({});
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (editingProduct) {
          if (isGallery) {
            setEditingProduct({
              ...editingProduct,
              galleryImages: [...(editingProduct.galleryImages || []), base64String]
            });
          } else {
            setEditingProduct({
              ...editingProduct,
              image: base64String
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
      alert('Producto actualizado con éxito');
    }
  };

  const currentProduct = products.find(p => p.id === currentSelectedProductId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tostado"></div>
      </div>
    );
  }

  if (!isPasswordCorrect) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <LayoutDashboard className="w-16 h-16 text-tostado mx-auto mb-6" />
          <h1 className="text-2xl font-display text-cafe mb-2">Acceso Restringido</h1>
          <p className="text-stone-600 mb-8">Ingresá la clave de administrador para continuar.</p>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-tostado"
            />
            <button
              type="submit"
              className="w-full bg-tostado text-white py-3 px-6 rounded-xl font-medium hover:bg-cafe transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <LayoutDashboard className="w-16 h-16 text-tostado mx-auto mb-6" />
          <h1 className="text-2xl font-display text-cafe mb-2">Acceso Restringido</h1>
          <p className="text-stone-600 mb-8">Por favor, inicia sesión para acceder al panel de administración.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full bg-tostado text-white py-3 px-6 rounded-xl font-medium hover:bg-cafe transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  const ADMIN_EMAILS = [
    'audisiofausto@gmail.com',
    ...(import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',') : [])
  ];
  const isUserAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display text-cafe mb-2">Acceso Denegado</h1>
          <p className="text-stone-600 mb-8">
            Tu cuenta ({user.email}) no tiene permisos de administrador para ver esta página.
          </p>
          <button
            onClick={logout}
            className="w-full bg-stone-200 text-stone-800 py-3 px-6 rounded-xl font-medium hover:bg-stone-300 transition-colors"
          >
            Cerrar sesión y volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-display text-brand-600 flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Panel de Administración
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-stone-200 overflow-x-auto max-w-[calc(100vw-120px)] md:max-w-none">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Pedidos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'stock' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stock y Productos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('options')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'options' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Complementos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('subobjects')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'subobjects' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Subobjetos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'coupons' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Cupones
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('shipping')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'shipping' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Envíos
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('new-order')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'new-order' ? 'bg-brand-500 text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Pedido
              </div>
            </button>
            </div>
            <button
              onClick={logout}
              className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'shipping' && (
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
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4"
                >
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Ventas Totales</p>
                    <p className="text-2xl font-bold text-stone-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4"
                >
                  <div className="p-3 bg-brand-50 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Pedidos Totales</p>
                    <p className="text-2xl font-bold text-stone-900">{stats.orderCount}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4"
                >
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-bold text-stone-900">{stats.pendingOrders}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4"
                >
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Conversión</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {stats.orderCount > 0 ? ((stats.deliveredOrders / stats.orderCount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Charts Row 1: Revenue & Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    Ingresos (Últimos 7 días)
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueByDay}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A373" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#D4A373" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#D4A373" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-500" />
                    Top 5 Productos
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 11, fill: '#78716c' }} />
                        <Tooltip 
                          cursor={{ fill: '#fafaf9' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#D4A373" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Payment Methods & Order Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-500" />
                    Métodos de Pago
                  </h2>
                  <div className="h-[300px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.paymentMethods}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-1/3 space-y-2">
                      {stats.paymentMethods.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-xs text-stone-600 font-medium">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-500" />
                    Estado de Pedidos
                  </h2>
                  <div className="space-y-6">
                    {[
                      { label: 'Pendientes', count: stats.pendingOrders, color: 'bg-amber-500', total: stats.orderCount },
                      { label: 'En Preparación', count: stats.preparingOrders, color: 'bg-brand-500', total: stats.orderCount },
                      { label: 'Entregados', count: stats.deliveredOrders, color: 'bg-emerald-500', total: stats.orderCount },
                      { label: 'Cancelados', count: stats.cancelledOrders, color: 'bg-red-500', total: stats.orderCount }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-stone-600 font-medium">{item.label}</span>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / (item.total || 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`${item.color} h-full`}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'coupons' && (
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
                          onClick={() => {
                            if (editingCoupon) {
                              updateCoupon(editingCoupon);
                              setEditingCoupon(null);
                            } else {
                              if (!newCouponForm.code) return alert('El código es obligatorio');
                              addCoupon({ ...newCouponForm, id: Math.random().toString(36).substr(2, 9) });
                              setIsAddingCoupon(false);
                              setNewCouponForm({ code: '', discount: 0, type: 'percentage', isActive: true, minPurchase: 0 });
                            }
                          }}
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
          )}

          {activeTab === 'orders' && (
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
                      onClick={() => setFilterStatus(status)}
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {orders
                    .filter(o => {
                      const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = filterStatus === 'TODOS' || o.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((order, idx) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-tighter bg-stone-50 px-1.5 py-0.5 rounded">#{order.id.slice(-6)}</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-stone-800">{order.customerName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <a href={`tel:${order.customerPhone}`} className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
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
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                              order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                              order.status === OrderStatus.PREPARING ? 'bg-blue-100 text-blue-700' :
                              order.status === OrderStatus.DELIVERED ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                order.status === OrderStatus.PENDING ? 'bg-amber-500' :
                                order.status === OrderStatus.PREPARING ? 'bg-blue-500 animate-pulse' :
                                order.status === OrderStatus.DELIVERED ? 'bg-emerald-500' :
                                'bg-red-500'
                              }`} />
                              {order.status}
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              order.paymentStatus === PaymentStatus.PENDING ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {order.paymentStatus}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-xs">
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
                            <div className="flex items-center gap-2 text-xs">
                              <CalendarIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="text-stone-700 font-medium">{order.deliveryDate} a las {order.deliveryTime}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="text-stone-700 font-medium">{order.paymentMethod}</span>
                            </div>
                            {order.recipientName && (
                              <div className="flex items-start gap-2 text-xs">
                                <UserIcon className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                <div className="text-stone-700">
                                  <p className="font-bold text-stone-900">Recibe:</p>
                                  <p>{order.recipientName} ({order.recipientPhone})</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {order.notes && (
                            <div className="col-span-full flex items-start gap-2 text-xs pt-2 border-t border-stone-200">
                              <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <p className="text-stone-600 italic">"{order.notes}"</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-6">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Detalle del Pedido</p>
                          {order.items.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return (
                              <div key={idx} className="flex flex-col py-2 border-b border-stone-50 last:border-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-bold text-stone-800">{item.quantity}x {p?.name || 'Producto'}</span>
                                  <span className="text-sm font-bold text-stone-900">${((p?.price || 0) * item.quantity).toLocaleString()}</span>
                                </div>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedOptions.map((opt, optIdx) => (
                                      <span key={optIdx} className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                        {opt.values.join(', ')}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          {order.couponCode && (
                            <div className="flex justify-between items-center py-2 text-emerald-600">
                              <div className="flex items-center gap-1 text-xs font-bold">
                                <Tag className="w-3 h-3" />
                                Cupón: {order.couponCode}
                              </div>
                              <span className="text-sm font-bold">-${order.discountAmount?.toLocaleString()}</span>
                            </div>
                          )}

                          {order.deliveryType === 'DELIVERY' && (
                            <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Calculadora de Envío</span>
                                <div className="flex gap-2">
                                  {hasFreeDelivery(order) && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                      ¡TIENE ENVÍO GRATIS!
                                    </span>
                                  )}
                                  <a 
                                    href={getGoogleMapsLink(order)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors"
                                  >
                                    <MapPin className="w-2.5 h-2.5" /> Ver Distancia
                                  </a>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {SHIPPING_ZONES.map(zone => (
                                  <button
                                    key={zone.name}
                                    onClick={() => updateOrderShipping(order.id, zone.cost, zone.name)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
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
                                <div className="flex justify-between items-center text-stone-600 text-sm font-medium">
                                  <span>Costo de Envío ({order.shippingZone})</span>
                                  <span>${order.shippingCost.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-stone-50 p-6 border-t border-stone-100">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total a Cobrar</span>
                          <span className="text-2xl font-bold text-brand-600">${order.total.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="flex-1 min-w-[200px] flex gap-2">
                            <select 
                              value={order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as OrderStatus;
                                updateOrderStatus(order.id, newStatus);
                                if (newStatus === OrderStatus.CANCELLED) {
                                  trackEvent(AnalyticsEvents.ORDER_CANCELLED, {
                                    order_id: order.id,
                                    reason: 'Admin cancelled'
                                  });
                                }
                                trackEvent('order_status_update', {
                                  order_id: order.id,
                                  new_status: newStatus
                                });
                              }}
                              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-700 focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                            >
                              {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <select 
                              value={order.paymentStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value as PaymentStatus;
                                updateOrderPaymentStatus(order.id, newStatus);
                                trackEvent('payment_status_update', {
                                  order_id: order.id,
                                  new_status: newStatus
                                });
                              }}
                              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-700 focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                            >
                              {Object.values(PaymentStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handlePrint(order, 'bluetooth')}
                              disabled={printingOrderId === order.id}
                              className="p-3 bg-white text-stone-600 border border-stone-200 rounded-xl hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all disabled:opacity-50 shadow-sm"
                              title="Imprimir Bluetooth"
                            >
                              <Bluetooth className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handlePrint(order, 'usb')}
                              disabled={printingOrderId === order.id}
                              className="p-3 bg-white text-stone-600 border border-stone-200 rounded-xl hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all disabled:opacity-50 shadow-sm"
                              title="Imprimir USB"
                            >
                              <Usb className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                const text = formatOrderToWhatsApp(order, products);
                                window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${text}`, '_blank');
                              }}
                              className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                              title="Enviar por WhatsApp"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        {activeTab === 'stock' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4">Stock Actual</th>
                    <th className="px-6 py-4">Opciones Vinculadas</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-stone-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-700">${product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={product.stock ?? 0}
                          onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 border rounded-lg text-center font-bold ${
                            (product.stock ?? 0) < 10 ? 'border-red-200 bg-red-50 text-red-600' : 'border-stone-200 text-stone-700'
                          }`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {product.options?.map(opt => (
                            <span key={opt.id} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100">
                              {opt.name}
                            </span>
                          )) || <span className="text-[10px] text-stone-400">Sin opciones</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="text-stone-400 hover:text-brand-500 p-1 transition-colors"
                            title="Editar detalles"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const currentOptionIds = product.options?.map(o => o.id) || [];
                              const newOptionIds = prompt('Ingrese los IDs de las opciones separados por coma (ej: presentacion,tazas):', currentOptionIds.join(','));
                              if (newOptionIds !== null) {
                                updateProductOptions(product.id, newOptionIds.split(',').map(id => id.trim()).filter(id => id));
                              }
                            }}
                            className="text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1"
                          >
                            <Settings2 className="w-3 h-3" />
                            Vincular
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h2 className="text-2xl font-display text-stone-800">Editar Producto: {editingProduct.name}</h2>
                <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-600">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Nombre del Producto</label>
                      <input 
                        type="text" 
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Subtítulo (opcional)</label>
                      <input 
                        type="text" 
                        value={editingProduct.subtitle || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, subtitle: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Precio ($)</label>
                        <input 
                          type="number" 
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Precio Anterior (opcional)</label>
                        <input 
                          type="number" 
                          value={editingProduct.oldPrice || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, oldPrice: parseInt(e.target.value) || undefined})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Video URL (YouTube/Vimeo/Directo)</label>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <input 
                          type="text" 
                          value={editingProduct.videoUrl || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, videoUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Imagen Principal</label>
                      <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
                        {editingProduct.image ? (
                          <>
                            <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer bg-white text-stone-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Cambiar
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-stone-400 hover:text-brand-500">
                            <ImageIcon className="w-12 h-12" />
                            <span className="text-xs font-bold">Subir Imagen</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Descripción</label>
                  <textarea 
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-stone-600">Galería de Imágenes</label>
                    <label className="cursor-pointer text-brand-500 hover:text-brand-600 font-bold text-xs flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      Añadir a Galería
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                    </label>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {editingProduct.galleryImages?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-100 group">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => {
                            const updated = editingProduct.galleryImages?.filter((_, i) => i !== idx);
                            setEditingProduct({...editingProduct, galleryImages: updated});
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex gap-4">
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-4 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProduct}
                  className="flex-[2] bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display text-stone-800">Gestionar Categorías de Opciones</h2>
              <button 
                onClick={() => {
                  setIsAddingOption(true);
                  setEditingOption(null);
                  setNewOptionForm({ id: '', name: '', type: 'select', values: [], description: '' });
                }}
                className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nueva Categoría
              </button>
            </div>

            {(isAddingOption || editingOption) && (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-display text-stone-800">
                    {editingOption ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <button onClick={() => { setIsAddingOption(false); setEditingOption(null); }} className="text-stone-400 hover:text-stone-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">ID de la Categoría (único, sin espacios)</label>
                    <input 
                      type="text" 
                      value={newOptionForm.id}
                      onChange={(e) => {
                        setNewOptionForm({...newOptionForm, id: e.target.value});
                        if (optionErrors.id) setOptionErrors({...optionErrors, id: ''});
                      }}
                      disabled={!!editingOption}
                      className={`w-full px-4 py-3 bg-stone-50 border ${optionErrors.id ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50`}
                      placeholder="ej: tortas-extra"
                    />
                    {optionErrors.id && <p className="text-[10px] text-red-500 mt-1">{optionErrors.id}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Nombre de la Categoría</label>
                    <input 
                      type="text" 
                      value={newOptionForm.name}
                      onChange={(e) => {
                        setNewOptionForm({...newOptionForm, name: e.target.value});
                        if (optionErrors.name) setOptionErrors({...optionErrors, name: ''});
                      }}
                      className={`w-full px-4 py-3 bg-stone-50 border ${optionErrors.name ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                      placeholder="ej: ¡Elegí tu torta!"
                    />
                    {optionErrors.name && <p className="text-[10px] text-red-500 mt-1">{optionErrors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Tipo de Selección</label>
                    <select 
                      value={newOptionForm.type}
                      onChange={(e) => setNewOptionForm({...newOptionForm, type: e.target.value as 'select' | 'multi-select'})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="select">Selección Única (Radio)</option>
                      <option value="multi-select">Selección Múltiple (Checkbox)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input 
                      type="checkbox"
                      id="isRequired"
                      checked={newOptionForm.isRequired || false}
                      onChange={(e) => setNewOptionForm({...newOptionForm, isRequired: e.target.checked})}
                      className="w-4 h-4 text-brand-500 border-stone-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="isRequired" className="text-sm font-bold text-stone-600 cursor-pointer">
                      ¿Es obligatorio?
                    </label>
                  </div>
                  {newOptionForm.type === 'multi-select' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-600">Máximo de Selecciones (opcional)</label>
                      <input 
                        type="number" 
                        value={newOptionForm.maxSelections || ''}
                        onChange={(e) => setNewOptionForm({...newOptionForm, maxSelections: parseInt(e.target.value) || undefined})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="ej: 2"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-stone-600 block">Vincular Subobjetos</label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar subobjetos existentes..."
                      value={subobjectSearch}
                      onChange={(e) => setSubobjectSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    
                    {subobjectSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {subobjects
                          .filter(s => s.name.toLowerCase().includes(subobjectSearch.toLowerCase()))
                          .map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                if (!newOptionForm.values.find(v => v.id === sub.id)) {
                                  setNewOptionForm({
                                    ...newOptionForm,
                                    values: [...newOptionForm.values, sub]
                                  });
                                }
                                setSubobjectSearch('');
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-stone-50 flex justify-between items-center border-b border-stone-50 last:border-0"
                            >
                              <div>
                                <p className="text-sm font-bold text-stone-800">{sub.name}</p>
                                <p className="text-xs text-stone-500">{sub.category}</p>
                              </div>
                              <span className="text-xs font-bold text-brand-600">+${sub.price?.toLocaleString()}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nuevo subobjeto (ej: Chocotorta)"
                      value={newValue.name}
                      onChange={(e) => setNewValue({...newValue, name: e.target.value})}
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="Precio"
                      value={newValue.price || ''}
                      onChange={(e) => setNewValue({...newValue, price: parseInt(e.target.value) || 0})}
                      className="w-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newValue.name) {
                          const subId = Math.random().toString(36).substr(2, 9);
                          const newSub = { ...newValue, id: subId, category: newOptionForm.name };
                          setNewOptionForm({
                            ...newOptionForm,
                            values: [...newOptionForm.values, newSub]
                          });
                          // Also add to global subobjects
                          addSubobject(newSub);
                          setNewValue({ id: '', name: '', price: 0 });
                        }
                      }}
                      className="bg-stone-800 text-white px-4 py-3 rounded-xl hover:bg-stone-900 transition-all font-bold"
                    >
                      Crear y Añadir
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {newOptionForm.values.map((val, idx) => (
                      <div key={val.id || idx} className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-stone-800">{val.name}</span>
                          <span className="text-xs text-stone-500">${val.price?.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const updatedValues = newOptionForm.values.filter((_, i) => i !== idx);
                            setNewOptionForm({
                              ...newOptionForm,
                              values: updatedValues
                            });
                            if (updatedValues.length > 0 && optionErrors.values) setOptionErrors({...optionErrors, values: ''});
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {optionErrors.values && <p className="text-[10px] text-red-500 mt-1">{optionErrors.values}</p>}
                </div>

                <button 
                  onClick={handleSaveOption}
                  className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg"
                >
                  {editingOption ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {options.map(option => (
                <div key={option.id} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display text-lg text-stone-800">{option.name}</h3>
                      <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">{option.id}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingOption(option);
                          setNewOptionForm(option);
                          setIsAddingOption(false);
                        }}
                        className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta categoría? Se desvinculará de todos los productos.')) {
                            deleteOption(option.id);
                          }
                        }}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase">
                      <span>{option.values.length} Opciones</span>
                      <span>{option.type === 'select' ? 'Única' : 'Múltiple'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {option.values.slice(0, 5).map((v, i) => (
                        <span key={i} className="text-[10px] bg-stone-50 text-stone-600 px-2 py-1 rounded border border-stone-100">
                          {v.name}
                        </span>
                      ))}
                      {option.values.length > 5 && (
                        <span className="text-[10px] text-stone-400 px-2 py-1">+{option.values.length - 5} más</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subobjects' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-display text-stone-800">Gestionar Subobjetos (Valores)</h2>
              <button 
                onClick={() => {
                  setIsAddingSubobject(true);
                  setEditingSubobject(null);
                  setNewSubobjectForm({ id: Math.random().toString(36).substr(2, 9), name: '', price: 0, category: '' });
                }}
                className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-600 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nuevo Subobjeto
              </button>
            </div>

            {(isAddingSubobject || editingSubobject) && (
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-display text-stone-800">
                    {editingSubobject ? 'Editar Subobjeto' : 'Nuevo Subobjeto'}
                  </h3>
                  <button onClick={() => { setIsAddingSubobject(false); setEditingSubobject(null); }} className="text-stone-400 hover:text-stone-600">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Nombre</label>
                    <input 
                      type="text" 
                      value={newSubobjectForm.name}
                      onChange={(e) => setNewSubobjectForm({...newSubobjectForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="ej: Chocotorta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Precio Extra</label>
                    <input 
                      type="number" 
                      value={newSubobjectForm.price || ''}
                      onChange={(e) => setNewSubobjectForm({...newSubobjectForm, price: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="ej: 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Categoría (opcional)</label>
                    <input 
                      type="text" 
                      value={newSubobjectForm.category || ''}
                      onChange={(e) => setNewSubobjectForm({...newSubobjectForm, category: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="ej: Tortas"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (editingSubobject) {
                      updateSubobject(newSubobjectForm);
                    } else {
                      addSubobject(newSubobjectForm);
                    }
                    setIsAddingSubobject(false);
                    setEditingSubobject(null);
                  }}
                  className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg"
                >
                  {editingSubobject ? 'Guardar Cambios' : 'Crear Subobjeto'}
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Nombre</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Categoría</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase">Precio</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {subobjects.map(sub => (
                    <tr key={sub.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-800">{sub.name}</td>
                      <td className="px-6 py-4 text-stone-500 text-sm">{sub.category || '-'}</td>
                      <td className="px-6 py-4 font-bold text-stone-900">${sub.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingSubobject(sub);
                              setNewSubobjectForm(sub);
                              setIsAddingSubobject(false);
                            }}
                            className="p-2 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este subobjeto? Se quitará de todos los complementos.')) {
                                deleteSubobject(sub.id);
                              }
                            }}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'new-order' && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleCreateOrder} className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Tipo de Entrega</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewOrderForm({...newOrderForm, deliveryType: 'DELIVERY'})}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${newOrderForm.deliveryType === 'DELIVERY' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200'}`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrderForm({...newOrderForm, deliveryType: 'PICKUP'})}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${newOrderForm.deliveryType === 'PICKUP' ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200'}`}
                  >
                    Retiro Local
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Nombre del Cliente</label>
                  <input 
                    required
                    type="text" 
                    value={newOrderForm.customerName}
                    onChange={(e) => {
                      setNewOrderForm({...newOrderForm, customerName: e.target.value});
                      if (orderErrors.customerName) setOrderErrors({...orderErrors, customerName: ''});
                    }}
                    className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.customerName ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                    placeholder="Ej: Juan Pérez"
                  />
                  {orderErrors.customerName && <p className="text-[10px] text-red-500 mt-1">{orderErrors.customerName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Teléfono</label>
                  <input 
                    required
                    type="tel" 
                    value={newOrderForm.customerPhone}
                    onChange={(e) => {
                      setNewOrderForm({...newOrderForm, customerPhone: e.target.value});
                      if (orderErrors.customerPhone) setOrderErrors({...orderErrors, customerPhone: ''});
                    }}
                    className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.customerPhone ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                    placeholder="Ej: 351 1234567"
                  />
                  {orderErrors.customerPhone && <p className="text-[10px] text-red-500 mt-1">{orderErrors.customerPhone}</p>}
                </div>
              </div>

              {newOrderForm.deliveryType === 'DELIVERY' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <input 
                      type="checkbox" 
                      id="adminIsPrivateNeighborhood"
                      checked={newOrderForm.isPrivateNeighborhood}
                      onChange={(e) => setNewOrderForm({...newOrderForm, isPrivateNeighborhood: e.target.checked})}
                      className="w-4 h-4 text-brand-500 rounded border-stone-300 focus:ring-brand-500"
                    />
                    <label htmlFor="adminIsPrivateNeighborhood" className="text-sm font-bold text-stone-700 cursor-pointer">
                      Es un barrio privado
                    </label>
                  </div>

                  {!newOrderForm.isPrivateNeighborhood ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Dirección de Entrega</label>
                        <input 
                          required
                          type="text" 
                          value={newOrderForm.deliveryAddress}
                          onChange={(e) => {
                            setNewOrderForm({...newOrderForm, deliveryAddress: e.target.value});
                            if (orderErrors.deliveryAddress) setOrderErrors({...orderErrors, deliveryAddress: ''});
                          }}
                          className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.deliveryAddress ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                          placeholder="Calle, Número"
                        />
                        {orderErrors.deliveryAddress && <p className="text-[10px] text-red-500 mt-1">{orderErrors.deliveryAddress}</p>}
                        
                        {newOrderForm.deliveryAddress && newOrderForm.deliveryAddress.length > 5 && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-stone-200 h-40 w-full shadow-inner bg-stone-100 relative animate-fade-in">
                            <iframe
                              title="Map Preview Admin"
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              scrolling="no"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(newOrderForm.deliveryAddress + ', Córdoba, Argentina')}&output=embed`}
                              className="grayscale hover:grayscale-0 transition-all duration-500"
                            ></iframe>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Barrio</label>
                        <input 
                          type="text" 
                          value={newOrderForm.neighborhood}
                          onChange={(e) => setNewOrderForm({...newOrderForm, neighborhood: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="Ej: Nueva Córdoba"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-stone-600">Referencia</label>
                        <input 
                          type="text" 
                          value={newOrderForm.reference}
                          onChange={(e) => setNewOrderForm({...newOrderForm, reference: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                          placeholder="Piso, Dpto, etc."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Nombre del Barrio</label>
                        <input 
                          required
                          type="text" 
                          value={newOrderForm.neighborhood}
                          onChange={(e) => {
                            setNewOrderForm({...newOrderForm, neighborhood: e.target.value});
                            if (orderErrors.neighborhood) setOrderErrors({...orderErrors, neighborhood: ''});
                          }}
                          className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.neighborhood ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                          placeholder="Ej: Valle Escondido"
                        />
                        {orderErrors.neighborhood && <p className="text-[10px] text-red-500 mt-1">{orderErrors.neighborhood}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Nombre de la Familia</label>
                        <input 
                          required
                          type="text" 
                          value={newOrderForm.familyName}
                          onChange={(e) => {
                            setNewOrderForm({...newOrderForm, familyName: e.target.value});
                            if (orderErrors.familyName) setOrderErrors({...orderErrors, familyName: ''});
                          }}
                          className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.familyName ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                          placeholder="Ej: Familia García"
                        />
                        {orderErrors.familyName && <p className="text-[10px] text-red-500 mt-1">{orderErrors.familyName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Manzana y Lote</label>
                        <input 
                          required
                          type="text" 
                          value={newOrderForm.blockLot}
                          onChange={(e) => {
                            setNewOrderForm({...newOrderForm, blockLot: e.target.value});
                            if (orderErrors.blockLot) setOrderErrors({...orderErrors, blockLot: ''});
                          }}
                          className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.blockLot ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                          placeholder="Ej: Mza 10 Lote 5"
                        />
                        {orderErrors.blockLot && <p className="text-[10px] text-red-500 mt-1">{orderErrors.blockLot}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-600">Casa N⁰</label>
                        <input 
                          required
                          type="text" 
                          value={newOrderForm.houseNumber}
                          onChange={(e) => {
                            setNewOrderForm({...newOrderForm, houseNumber: e.target.value});
                            if (orderErrors.houseNumber) setOrderErrors({...orderErrors, houseNumber: ''});
                          }}
                          className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.houseNumber ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                          placeholder="Ej: 123"
                        />
                        {orderErrors.houseNumber && <p className="text-[10px] text-red-500 mt-1">{orderErrors.houseNumber}</p>}
                      </div>
                      
                      {newOrderForm.neighborhood && newOrderForm.neighborhood.length > 3 && (
                        <div className="mt-3 md:col-span-2 rounded-xl overflow-hidden border border-stone-200 h-40 w-full shadow-inner bg-stone-100 relative animate-fade-in">
                          <iframe
                            title="Map Preview Admin Private"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(newOrderForm.neighborhood + ', Córdoba, Argentina')}&output=embed`}
                            className="grayscale hover:grayscale-0 transition-all duration-500"
                          ></iframe>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <p className="text-sm font-bold text-brand-700 uppercase mb-1">Punto de Retiro</p>
                  <p className="text-stone-700 font-medium">Nicolas Avellaneda 327, Córdoba Capital</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Fecha de Entrega</label>
                  <input 
                    required
                    type="date" 
                    value={newOrderForm.deliveryDate}
                    onChange={(e) => {
                      setNewOrderForm({...newOrderForm, deliveryDate: e.target.value});
                      if (orderErrors.deliveryDate) setOrderErrors({...orderErrors, deliveryDate: ''});
                    }}
                    className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.deliveryDate ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none`}
                  />
                  {orderErrors.deliveryDate && <p className="text-[10px] text-red-500 mt-1">{orderErrors.deliveryDate}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600">Horario</label>
                  <select 
                    required
                    value={newOrderForm.deliveryTime}
                    onChange={(e) => {
                      setNewOrderForm({...newOrderForm, deliveryTime: e.target.value});
                      if (orderErrors.deliveryTime) setOrderErrors({...orderErrors, deliveryTime: ''});
                    }}
                    className={`w-full px-4 py-3 bg-stone-50 border ${orderErrors.deliveryTime ? 'border-red-500' : 'border-stone-200'} rounded-xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none`}
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
                  {orderErrors.deliveryTime && <p className="text-[10px] text-red-500 mt-1">{orderErrors.deliveryTime}</p>}
                </div>
              </div>

              {newOrderForm.deliveryType === 'DELIVERY' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Quién Recibe</label>
                    <input 
                      type="text" 
                      value={newOrderForm.recipientName}
                      onChange={(e) => setNewOrderForm({...newOrderForm, recipientName: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-600">Teléfono Recibe</label>
                    <input 
                      type="tel" 
                      value={newOrderForm.recipientPhone}
                      onChange={(e) => setNewOrderForm({...newOrderForm, recipientPhone: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Teléfono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Método de Pago</label>
                <select 
                  value={newOrderForm.paymentMethod}
                  onChange={(e) => setNewOrderForm({...newOrderForm, paymentMethod: e.target.value as PaymentMethod})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value={PaymentMethod.TRANSFERENCIA_MP}>Mercado Pago (Transferencia)</option>
                  <option value={PaymentMethod.TARJETA_UALA}>Ualá (Tarjeta) (+15%)</option>
                  <option value={PaymentMethod.EFECTIVO}>Efectivo</option>
                </select>
                {newOrderForm.paymentMethod === PaymentMethod.TARJETA_UALA && (
                  <p className="text-xs text-brand-600 font-bold">* Se aplicará un recargo del 15%.</p>
                )}
              </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-stone-600 block">Productos</label>
                  <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex gap-2">
                      <select 
                        id="product-select"
                        value={currentSelectedProductId}
                        onChange={(e) => {
                          setCurrentSelectedProductId(e.target.value);
                          setSelectedProductOptions({});
                        }}
                        className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option value="">Seleccionar producto...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.price.toLocaleString()})</option>
                        ))}
                      </select>
                      <input 
                        id="product-qty"
                        type="number" 
                        defaultValue="1" 
                        min="1"
                        className="w-20 px-4 py-3 bg-white border border-stone-200 rounded-xl text-center font-bold"
                      />
                    </div>

                    {currentProduct?.options && (
                      <div className="space-y-4 pt-2">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Opciones del Producto</p>
                        {currentProduct.options.map(option => (
                          <div key={option.id} className="space-y-2">
                            <label className="text-xs font-bold text-stone-600">{option.name}</label>
                            <div className="flex flex-wrap gap-2">
                              {option.values.map(val => {
                                const isSelected = (selectedProductOptions[option.id] || []).includes(val.name);
                                return (
                                  <button
                                    key={val.name}
                                    type="button"
                                    onClick={() => {
                                      const current = selectedProductOptions[option.id] || [];
                                      if (option.type === 'select') {
                                        setSelectedProductOptions({ ...selectedProductOptions, [option.id]: [val.name] });
                                      } else {
                                        if (current.includes(val.name)) {
                                          setSelectedProductOptions({ ...selectedProductOptions, [option.id]: current.filter(v => v !== val.name) });
                                        } else {
                                          if (!option.maxSelections || current.length < option.maxSelections) {
                                            setSelectedProductOptions({ ...selectedProductOptions, [option.id]: [...current, val.name] });
                                          }
                                        }
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'}`}
                                  >
                                    {val.name} {val.price ? `(+$${val.price.toLocaleString()})` : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={() => {
                        const select = document.getElementById('product-select') as HTMLSelectElement;
                        const qtyInput = document.getElementById('product-qty') as HTMLInputElement;
                        if (select.value) {
                          const optionsToSave = (Object.entries(selectedProductOptions) as [string, string[]][])
                            .filter(([_, values]) => values.length > 0)
                            .map(([optionId, values]) => ({ optionId, values }));

                          setNewOrderForm({
                            ...newOrderForm,
                            items: [...newOrderForm.items, { 
                              productId: select.value, 
                              quantity: parseInt(qtyInput.value),
                              selectedOptions: optionsToSave
                            }]
                          });
                          setCurrentSelectedProductId('');
                          setSelectedProductOptions({});
                          qtyInput.value = '1';
                        }
                      }}
                      className="w-full px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all font-bold shadow-sm"
                    >
                      Agregar al Pedido
                    </button>
                  </div>

                <ul className="space-y-2">
                  {newOrderForm.items.map((item, idx) => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                      <li key={idx} className="flex justify-between items-start bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <div className="flex flex-col">
                          <span className="text-stone-700 font-bold">{item.quantity}x {p?.name}</span>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedOptions.flatMap(opt => opt.values).map((val, vIdx) => (
                                <span key={vIdx} className="text-[10px] bg-white text-stone-500 px-1.5 py-0.5 rounded border border-stone-100">
                                  {val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-brand-600">
                            ${(((p?.price || 0) + (item.selectedOptions?.reduce((acc, opt) => {
                              const option = p?.options?.find(o => o.id === opt.optionId);
                              return acc + opt.values.reduce((vAcc, vName) => {
                                const val = option?.values.find(v => v.name === vName);
                                return vAcc + (val?.price || 0);
                              }, 0);
                            }, 0) || 0)) * item.quantity).toLocaleString()}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setNewOrderForm({
                              ...newOrderForm,
                              items: newOrderForm.items.filter((_, i) => i !== idx)
                            })}
                            className="text-red-500 hover:text-red-600"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600">Notas del Pedido</label>
                <textarea 
                  value={newOrderForm.notes}
                  onChange={(e) => setNewOrderForm({...newOrderForm, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                  placeholder="Instrucciones especiales, dedicatoria, etc."
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-stone-100">
                <div>
                  <p className="text-sm text-stone-500">Total del Pedido</p>
                  <p className="text-3xl font-bold text-brand-600">
                    ${(() => {
                      const subtotal = newOrderForm.items.reduce((sum, item) => {
                        const p = products.find(prod => prod.id === item.productId);
                        return sum + (p ? p.price * item.quantity : 0);
                      }, 0);
                      const surcharge = newOrderForm.paymentMethod === 'TARJETA' ? subtotal * 0.15 : 0;
                      return (subtotal + surcharge).toLocaleString();
                    })()}
                  </p>
                </div>
                <button 
                  type="submit"
                  className="px-8 py-4 bg-brand-500 text-white rounded-2xl hover:bg-brand-600 transition-all font-bold shadow-lg shadow-brand-200 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
