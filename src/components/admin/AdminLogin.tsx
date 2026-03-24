import React, { useState, useEffect } from 'react';
import { LayoutDashboard, XCircle, LogOut } from 'lucide-react';
import { loginWithGoogle, logout, auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'framer-motion';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === adminPassword) {
      onAuthenticated();
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert("¡Rajá de acá! Clave incorrecta. 💅");
    }
  };

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

  const isPasswordCorrect = sessionStorage.getItem('adminAuth') === 'true';

  if (!isPasswordCorrect) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <LayoutDashboard className="w-16 h-16 text-brand-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display text-stone-800 mb-2">Acceso Restringido</h1>
          <p className="text-stone-600 mb-8">Ingresá la clave de administrador para continuar.</p>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-brand-700 transition-colors"
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
          <LayoutDashboard className="w-16 h-16 text-brand-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display text-stone-800 mb-2">Acceso Restringido</h1>
          <p className="text-stone-600 mb-8">Por favor, inicia sesión para acceder al panel de administración.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full bg-brand-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
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
          <h1 className="text-2xl font-display text-stone-800 mb-2">Acceso Denegado</h1>
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

  return null;
};

export default AdminLogin;

