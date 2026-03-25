import React, { useState } from 'react';
import { useStore } from '@/context/store';
import { TransferAccount } from '@/types';
import { Plus, Trash2, Edit2, Check, X, CreditCard, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import ConfirmDialog from '../ui/ConfirmDialog';

const TransferAccountsManager: React.FC = () => {
  const { 
    transferAccounts, 
    addTransferAccount, 
    updateTransferAccount, 
    deleteTransferAccount,
    shippingSettings,
    updateShippingSettings
  } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TransferAccount, 'id'>>({
    bankName: '',
    accountHolder: '',
    cbu: '',
    alias: '',
    isActive: true,
    type: 'CBU'
  });

  const toggleMercadoPago = () => {
    updateShippingSettings({
      ...shippingSettings,
      isMercadoPagoEnabled: !shippingSettings.isMercadoPagoEnabled
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTransferAccount({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addTransferAccount({ ...formData, id: Math.random().toString(36).substr(2, 9) });
      setIsAdding(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountHolder: '',
      cbu: '',
      alias: '',
      isActive: true,
      type: 'CBU'
    });
  };

  const handleEdit = (account: TransferAccount) => {
    setEditingId(account.id);
    setFormData({
      bankName: account.bankName,
      accountHolder: account.accountHolder,
      cbu: account.cbu,
      alias: account.alias,
      isActive: account.isActive,
      type: account.type
    });
    setIsAdding(true);
  };

  const toggleActive = (account: TransferAccount) => {
    updateTransferAccount({ ...account, isActive: !account.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Mercado Pago API Toggle */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Mercado Pago (API)</h3>
              <p className="text-sm text-gray-500">Cobro automático con acreditación instantánea</p>
            </div>
          </div>
          <button
            onClick={toggleMercadoPago}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              shippingSettings.isMercadoPagoEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {shippingSettings.isMercadoPagoEnabled ? 'Activado' : 'Desactivado'}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Cuentas de Transferencia
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Cuenta
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco / Entidad</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="Ej: Santander, Mercado Pago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la Cuenta</label>
                  <input
                    type="text"
                    required
                    value={formData.accountHolder}
                    onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as 'CBU' | 'CVU' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="CBU">CBU (Banco)</option>
                    <option value="CVU">CVU (Virtual)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CBU / CVU</label>
                  <input
                    type="text"
                    required
                    value={formData.cbu}
                    onChange={e => setFormData({ ...formData, cbu: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="22 dígitos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input
                    type="text"
                    required
                    value={formData.alias}
                    onChange={e => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                    placeholder="Alias de la cuenta"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Cuenta Activa (Visible para clientes)</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-top">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transferAccounts.map(account => (
          <div
            key={account.id}
            className={`p-5 rounded-xl border transition-all ${
              account.isActive ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{account.bankName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {account.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAccountToDelete(account.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-900">Titular:</span> {account.accountHolder}</p>
              <p><span className="font-medium text-gray-900">{account.type}:</span> {account.cbu}</p>
              <p><span className="font-medium text-gray-900">Alias:</span> {account.alias}</p>
            </div>

            <button
              onClick={() => toggleActive(account)}
              className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                account.isActive 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {account.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
        
        {transferAccounts.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay cuentas de transferencia configuradas.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-black font-medium hover:underline"
            >
              Agregar la primera cuenta
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!accountToDelete}
        title="Eliminar Cuenta"
        description="¿Estás seguro de que deseas eliminar esta cuenta de transferencia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={() => {
          if (accountToDelete) {
            deleteTransferAccount(accountToDelete);
            toast.success('Cuenta eliminada correctamente');
          }
          setAccountToDelete(null);
        }}
        onCancel={() => setAccountToDelete(null)}
        variant="danger"
      />
    </div>
  );
};

export default TransferAccountsManager;
