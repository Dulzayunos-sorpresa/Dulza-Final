import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  History, 
  TrendingUp,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { toast } from 'sonner';

interface BillingAccount {
  id: string;
  name: string;
  balance: number;
  lastUpdated: any;
}

interface BillingTransaction {
  id: string;
  accountId: string;
  accountName?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: any;
  orderId?: string;
}

const BillingManager = () => {
  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  
  // Form states
  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    description: '',
    orderId: ''
  });
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    initialBalance: '0'
  });

  useEffect(() => {
    const qAccounts = query(collection(db, 'billing_accounts'), orderBy('name'));
    const unsubscribeAccounts = onSnapshot(qAccounts, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BillingAccount[];
      setAccounts(accountsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'billing_accounts'));

    const qTransactions = query(
      collection(db, 'billing_transactions'), 
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BillingTransaction[];
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'billing_transactions'));

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
    };
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.accountId || !newTransaction.amount) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    const account = accounts.find(a => a.id === newTransaction.accountId);
    
    if (!account) return;

    try {
      // Use a transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        const accountRef = doc(db, 'billing_accounts', newTransaction.accountId);
        const accountDoc = await transaction.get(accountRef);
        
        if (!accountDoc.exists()) {
          throw new Error("La cuenta no existe");
        }

        const currentBalance = accountDoc.data().balance || 0;
        const newBalance = newTransaction.type === 'income' 
          ? currentBalance + amount 
          : currentBalance - amount;

        // Create transaction record
        const transactionRef = doc(collection(db, 'billing_transactions'));
        transaction.set(transactionRef, {
          accountId: newTransaction.accountId,
          accountName: account.name,
          amount,
          type: newTransaction.type,
          description: newTransaction.description,
          date: Timestamp.now(),
          orderId: newTransaction.orderId || null
        });

        // Update account balance
        transaction.update(accountRef, {
          balance: newBalance,
          lastUpdated: Timestamp.now()
        });
      });

      toast.success('Transacción registrada con éxito');
      setShowAddTransaction(false);
      setNewTransaction({
        accountId: '',
        amount: '',
        type: 'income',
        description: '',
        orderId: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar la transacción');
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;

    try {
      await addDoc(collection(db, 'billing_accounts'), {
        name: newAccount.name,
        balance: parseFloat(newAccount.initialBalance) || 0,
        lastUpdated: Timestamp.now()
      });
      toast.success('Cuenta creada con éxito');
      setShowAddAccount(false);
      setNewAccount({ name: '', initialBalance: '0' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'billing_accounts');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display text-stone-800">Facturación</h2>
          <p className="text-stone-500 font-medium">Gestión de cuentas y movimientos financieros</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddAccount(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Nueva Cuenta
          </button>
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total en Cuentas</p>
              <h3 className="text-2xl font-display text-stone-800">${totalBalance.toLocaleString()}</h3>
            </div>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accounts}>
                <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                  {accounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B4513' : '#D2B48C'} />
                  ))}
                </Bar>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Saldo']}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {accounts.map((account, i) => (
          <motion.div 
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <Wallet className="w-5 h-5" />
              </div>
              <button className="p-2 text-stone-300 hover:text-stone-500 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{account.name}</p>
              <h3 className="text-2xl font-display text-stone-800">${account.balance.toLocaleString()}</h3>
              <p className="text-[10px] text-stone-400 mt-1">
                Actualizado: {account.lastUpdated?.toDate().toLocaleString() || 'N/A'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-brand-500" />
            <h3 className="text-xl font-display text-stone-800">Movimientos Recientes</h3>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-stone-50 text-stone-500 rounded-xl hover:bg-stone-100 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 bg-stone-50 text-stone-500 rounded-xl hover:bg-stone-100 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cuenta</th>
                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Descripción</th>
                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Monto</th>
                <th className="px-8 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-stone-700">
                      {tx.date?.toDate().toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {tx.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {accounts.find(a => a.id === tx.accountId)?.name || 'Cuenta eliminada'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-stone-600 font-medium max-w-xs truncate">
                      {tx.description || 'Sin descripción'}
                    </div>
                    {tx.orderId && (
                      <div className="text-[10px] text-brand-500 font-bold uppercase mt-1">
                        Pedido: #{tx.orderId.slice(-6)}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className={`text-sm font-bold flex items-center justify-end gap-1 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      ${tx.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-stone-400 hover:text-brand-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-stone-400">
                      <History className="w-12 h-12 opacity-20" />
                      <p className="font-medium">No hay movimientos registrados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTransaction(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-display text-stone-800">Registrar Pago</h3>
                <button 
                  onClick={() => setShowAddTransaction(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                      newTransaction.type === 'income' 
                        ? 'bg-green-50 text-green-600 ring-2 ring-green-500/20' 
                        : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    Ingreso
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
                      newTransaction.type === 'expense' 
                        ? 'bg-red-50 text-red-600 ring-2 ring-red-500/20' 
                        : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-5 h-5" />
                    Egreso
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Cuenta</label>
                  <select 
                    value={newTransaction.accountId}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-brand-500/20"
                    required
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Monto</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-5 py-4 bg-stone-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-brand-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descripción</label>
                  <textarea 
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej: Pago pedido #12345"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-brand-500/20 h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Registro
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddAccount && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAccount(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-display text-stone-800">Nueva Cuenta</h3>
                <button 
                  onClick={() => setShowAddAccount(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleAddAccount} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nombre de la Cuenta</label>
                  <input 
                    type="text" 
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Mercado Pago, Efectivo, Santander"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Saldo Inicial</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={newAccount.initialBalance}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, initialBalance: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-5 py-4 bg-stone-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all"
                >
                  Crear Cuenta
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingManager;
