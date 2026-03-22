import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  Package, 
  CreditCard,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useStore } from '@/context/store';
import { OrderStatus, PaymentStatus } from '@/types';

const Dashboard: React.FC = () => {
  const { products, orders } = useStore();

  const stats = React.useMemo(() => ({
    totalRevenue: orders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((sum, o) => sum + o.total, 0),
    orderCount: orders.length,
    pendingOrders: orders.filter(o => o.status === OrderStatus.NUEVO).length,
    preparingOrders: orders.filter(o => o.status === OrderStatus.PENDIENTE).length,
    deliveredOrders: orders.filter(o => o.status === OrderStatus.PAGADO).length,
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
  }), [products, orders]);

  const COLORS = ['#D4A373', '#A98467', '#6B705C', '#B7B7A4', '#FFE8D6'];

  return (
    <motion.div 
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
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.paymentMethods.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-brand-500" />
            Estado de Pedidos
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Nuevos', value: stats.pendingOrders },
                    { name: 'En Proceso', value: stats.preparingOrders },
                    { name: 'Entregados', value: stats.deliveredOrders }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#D4A373" />
                  <Cell fill="#A98467" />
                  <Cell fill="#6B705C" />
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
