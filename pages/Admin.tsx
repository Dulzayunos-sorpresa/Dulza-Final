import React, { useState, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Modular Components
import AdminLogin from '@/src/components/admin/AdminLogin';
import Dashboard from '@/src/components/admin/Dashboard';
import OrdersManager from '@/src/components/admin/OrdersManager';
import ProductsManager from '@/src/components/admin/ProductsManager';
import CategoriesManager from '@/src/components/admin/CategoriesManager';
import OptionsManager from '@/src/components/admin/OptionsManager';
import SubobjectsManager from '@/src/components/admin/SubobjectsManager';
import CouponsManager from '@/src/components/admin/CouponsManager';
import ShippingManager from '@/src/components/admin/ShippingManager';
import NewOrderManager from '@/src/components/admin/NewOrderManager';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'stock' | 'new-order' | 'options' | 'subobjects' | 'coupons' | 'shipping' | 'categories'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isPasswordCorrect || !user) {
    return <AdminLogin onAuthenticated={() => setIsPasswordCorrect(true)} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'new-order', label: 'Nuevo Pedido', icon: Plus },
    { id: 'stock', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'options', label: 'Opciones', icon: Settings2 },
    { id: 'subobjects', label: 'Subobjetos', icon: Users },
    { id: 'coupons', label: 'Cupones', icon: Gift },
    { id: 'shipping', label: 'Envíos', icon: Truck },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-r border-stone-200 lg:h-screen sticky top-0 z-50 flex flex-col">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center lg:block">
          <div>
            <h1 className="text-2xl font-display text-brand-600">Dulzayunos</h1>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Panel de Control</p>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('adminAuth');
              setIsPasswordCorrect(false);
            }}
            className="lg:hidden p-2 text-stone-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
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
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-stone-800 truncate">{user.email}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase">Administrador</p>
            </div>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('adminAuth');
              setIsPasswordCorrect(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
          {activeTab === 'orders' && <OrdersManager key="orders" />}
          {activeTab === 'new-order' && <NewOrderManager key="new-order" onOrderCreated={() => setActiveTab('orders')} />}
          {activeTab === 'stock' && <ProductsManager key="stock" />}
          {activeTab === 'categories' && <CategoriesManager key="categories" />}
          {activeTab === 'options' && <OptionsManager key="options" />}
          {activeTab === 'subobjects' && <SubobjectsManager key="subobjects" />}
          {activeTab === 'coupons' && <CouponsManager key="coupons" />}
          {activeTab === 'shipping' && <ShippingManager key="shipping" />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
