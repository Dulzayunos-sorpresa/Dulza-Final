import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings2, 
  Truck, 
  Users, 
  Tag, 
  Gift, 
  Plus,
  LogOut,
  Printer,
  CreditCard,
  FileText,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Modular Components - Lazy Loaded
import { PrinterService } from '@/services/PrinterService';
import { NotificationService } from '@/services/NotificationService';

const AdminLogin = lazy(() => import('@/components/admin/AdminLogin'));
const Dashboard = lazy(() => import('@/components/admin/Dashboard'));
const OrdersManager = lazy(() => import('@/components/admin/OrdersManager'));
const ProductsManager = lazy(() => import('@/components/admin/ProductsManager'));
const CategoriesManager = lazy(() => import('@/components/admin/CategoriesManager'));
const OptionsManager = lazy(() => import('@/components/admin/OptionsManager'));
const SubobjectsManager = lazy(() => import('@/components/admin/SubobjectsManager'));
const CouponsManager = lazy(() => import('@/components/admin/CouponsManager'));
const ShippingManager = lazy(() => import('@/components/admin/ShippingManager'));
const PrinterSettings = lazy(() => import('@/components/admin/PrinterSettings'));
const TransferAccountsManager = lazy(() => import('@/components/admin/TransferAccountsManager'));
const BillingManager = lazy(() => import('@/components/admin/BillingManager'));
const SettingsManager = lazy(() => import('@/components/admin/SettingsManager'));

const SpecialLayoutsManager = lazy(() => import('@/components/admin/SpecialLayoutsManager'));

const AdminLoading = React.memo(() => (
  <div className="flex items-center justify-center p-20">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"
    />
  </div>
));

const Sidebar = React.memo(({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout 
}: { 
  activeTab: string; 
  setActiveTab: (tab: any) => void; 
  user: User; 
  onLogout: () => void;
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'stock', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'options', label: 'Opciones', icon: Settings2 },
    { id: 'subobjects', label: 'Subobjetos', icon: Users },
    { id: 'coupons', label: 'Cupones', icon: Gift },
    { id: 'shipping', label: 'Envíos', icon: Truck },
    { id: 'special-layouts', label: 'Fechas Especiales', icon: Sparkles },
    { id: 'transfer', label: 'Cuentas', icon: CreditCard },
    { id: 'billing', label: 'Facturación', icon: FileText },
    { id: 'printer', label: 'Impresora', icon: Printer },
    { id: 'settings', label: 'Configuración', icon: Settings2 },
  ] as const;

  return (
    <aside className="w-full lg:w-72 bg-white border-b lg:border-r border-stone-200 lg:h-screen sticky top-0 z-50 flex flex-col">
      <div className="p-8 border-b border-stone-100 flex justify-between items-center lg:block">
        <div>
          <h1 className="text-2xl font-display text-brand-600">Dulzayunos</h1>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Panel de Control</p>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-[10px]">
            {user.email?.[0].toUpperCase()}
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-50 text-brand-600 shadow-sm' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-500' : 'text-stone-400'}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100 hidden lg:block">
        <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-stone-800 truncate">{user.email}</p>
              <p className="text-[8px] text-stone-400 font-bold uppercase">Admin</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-red-500 transition-colors shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
});

const Admin = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [tab]);

  useEffect(() => {
    NotificationService.init();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = React.useCallback(() => {
    sessionStorage.removeItem('adminAuth');
    setIsPasswordCorrect(false);
  }, []);

  const handleTabChange = React.useCallback((tab: string) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  }, [navigate]);

  useEffect(() => {
    NotificationService.setCurrentTab(activeTab);
  }, [activeTab]);

  if (authLoading) {
    return <AdminLoading />;
  }

  if (!isPasswordCorrect || !user) {
    return (
      <Suspense fallback={<AdminLoading />}>
        <AdminLogin onAuthenticated={() => setIsPasswordCorrect(true)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <Suspense fallback={<AdminLoading />}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
            {activeTab === 'orders' && <OrdersManager key="orders" />}
            {activeTab === 'stock' && <ProductsManager key="stock" />}
            {activeTab === 'categories' && <CategoriesManager key="categories" />}
            {activeTab === 'options' && <OptionsManager key="options" />}
            {activeTab === 'subobjects' && <SubobjectsManager key="subobjects" />}
            {activeTab === 'coupons' && <CouponsManager key="coupons" />}
            {activeTab === 'shipping' && <ShippingManager key="shipping" />}
            {activeTab === 'special-layouts' && <SpecialLayoutsManager key="special-layouts" />}
            {activeTab === 'printer' && <PrinterSettings key="printer" />}
            {activeTab === 'transfer' && <TransferAccountsManager key="transfer" />}
            {activeTab === 'billing' && <BillingManager key="billing" />}
            {activeTab === 'settings' && <SettingsManager key="settings" />}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
};

export default Admin;
