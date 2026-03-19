import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, OrderStatus, ProductOption, PaymentStatus, ProductCategory, Coupon, ShippingSettings } from '../types';
import { COMMON_OPTIONS } from '../data/options';
import { MOCK_PRODUCTS } from '../data/products/allProducts';
import axios from 'axios';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, where, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { trackEvent, AnalyticsEvents } from '../src/utils/analytics';

export interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  coupons: Coupon[];
  shippingSettings: ShippingSettings;
  addToCart: (productId: string, quantity: number, selectedOptions?: { optionId: string; values: string[] }[]) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  updateProduct: (updatedProduct: Product) => void;
  getProduct: (id: string) => Product | undefined;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<{ order: Order; paymentUrl: string | null }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateOrderShipping: (orderId: string, cost: number, zone: string, distance?: number) => Promise<void>;
  updateShippingSettings: (settings: ShippingSettings) => Promise<void>;
  updateStock: (productId: string, newStock: number) => void;
  options: ProductOption[];
  addOption: (option: ProductOption) => void;
  updateOption: (option: ProductOption) => void;
  deleteOption: (optionId: string) => void;
  updateProductOptions: (productId: string, optionIds: string[]) => void;
  subobjects: ProductOptionValue[];
  addSubobject: (subobject: ProductOptionValue) => void;
  updateSubobject: (subobject: ProductOptionValue) => void;
  deleteSubobject: (subobjectId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  validateCoupon: (code: string) => Coupon | undefined;
  shippingSettings: ShippingSettings;
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [subobjects, setSubobjects] = useState<ProductOptionValue[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    baseCost: 3000,
    pricePerKm: 1350,
    maxKmForAutoPayment: 25 // Default threshold for "Zona 10"
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (snapshot.empty) {
        // Set mock products immediately so the UI isn't empty
        const mockProductsWithStock = MOCK_PRODUCTS.map(p => {
          const product = { ...p, stock: p.stock ?? 50 };
          if (p.category === ProductCategory.CUSTOM_BOX || p.category === ProductCategory.BREAKFAST) {
            product.options = [
              COMMON_OPTIONS.PRESENTATION,
              COMMON_OPTIONS.CAKES,
              COMMON_OPTIONS.CUPS,
              COMMON_OPTIONS.DRINKS,
              COMMON_OPTIONS.SWEETS
            ];
          }
          return product;
        });
        setProducts(mockProductsWithStock);

        if (!isInitialized) {
          // Try to seed products to Firestore (will fail if not admin, which is fine)
          try {
            const batch = mockProductsWithStock.map(product => 
              setDoc(doc(db, 'products', product.id), product)
            );
            await Promise.all(batch);
          } catch (error) {
            console.warn('Could not seed products to Firestore (likely not admin). Using local mock data.');
          }
        }
      } else {
        const prods: Product[] = [];
        snapshot.forEach(doc => prods.push(doc.data() as Product));
        setProducts(prods);
      }
    }, (error) => {
      console.error('Firestore Error (products):', error);
      // Fallback to mock products on error
      setProducts(MOCK_PRODUCTS);
    });

    const unsubscribeOptions = onSnapshot(collection(db, 'options'), async (snapshot) => {
      if (snapshot.empty) {
        // Set mock options immediately
        const mockOptions = Object.values(COMMON_OPTIONS);
        setOptions(mockOptions);

        if (!isInitialized) {
          // Try to seed options
          try {
            const batch = mockOptions.map(o => setDoc(doc(db, 'options', o.id), o));
            await Promise.all(batch);
          } catch (error) {
            console.warn('Could not seed options to Firestore. Using local mock data.');
          }
        }
      } else {
        const opts: ProductOption[] = [];
        snapshot.forEach(doc => opts.push(doc.data() as ProductOption));
        setOptions(opts);
      }
    }, (error) => {
      console.error('Firestore Error (options):', error);
      setOptions(Object.values(COMMON_OPTIONS));
    });

    const unsubscribeSubobjects = onSnapshot(collection(db, 'subobjects'), (snapshot) => {
      if (snapshot.empty) {
        // Extract all unique values from COMMON_OPTIONS to seed subobjects
        const allValues: ProductOptionValue[] = [];
        Object.values(COMMON_OPTIONS).forEach(opt => {
          opt.values.forEach(val => {
            if (!allValues.find(v => v.id === val.id)) {
              allValues.push({ ...val, category: opt.name });
            }
          });
        });
        setSubobjects(allValues);

        if (!isInitialized) {
          try {
            const batch = allValues.map(v => setDoc(doc(db, 'subobjects', v.id), v));
            Promise.all(batch).catch(console.warn);
          } catch (e) {}
        }
      } else {
        const subs: ProductOptionValue[] = [];
        snapshot.forEach(doc => subs.push(doc.data() as ProductOptionValue));
        setSubobjects(subs);
      }
    }, (error) => {
      console.error('Firestore Error (subobjects):', error);
    });

    const adminEmails = ['audisiofausto@gmail.com', 'uateventos@gmail.com'];
    const isAdmin = user && adminEmails.includes(user.email || '');

    let unsubscribeOrders = () => {};
    if (isAdmin) {
      unsubscribeOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), async (snapshot) => {
        if (snapshot.empty && !isInitialized) {
          // Try to migrate from backend
          try {
            const baseUrl = window.location.origin;
            const response = await axios.get(`${baseUrl}/api/pedidos`);
            const oldOrders: Order[] = response.data;
            if (oldOrders && oldOrders.length > 0) {
              const batch = oldOrders.map(o => setDoc(doc(db, 'orders', o.id), o));
              await Promise.all(batch);
            }
          } catch (e) {
            console.warn("Migration error or no orders to migrate");
          }
        } else {
          const ords: Order[] = [];
          snapshot.forEach(doc => ords.push(doc.data() as Order));
          setOrders(ords);
        }
      }, (error) => {
        console.error('Firestore Error (orders):', error);
      });
    }

    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const cups: Coupon[] = [];
      snapshot.forEach(doc => cups.push(doc.data() as Coupon));
      setCoupons(cups);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Firestore Error (coupons):', error);
      }
    });

    const unsubscribeShipping = onSnapshot(doc(db, 'settings', 'shipping'), (snapshot) => {
      if (snapshot.exists()) {
        setShippingSettings(snapshot.data() as ShippingSettings);
      } else if (isAdmin) {
        // Initialize if not exists and is admin
        setDoc(doc(db, 'settings', 'shipping'), {
          baseCost: 3000,
          pricePerKm: 1350,
          maxKmForAutoPayment: 25
        }).catch(console.error);
      }
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error('Firestore Error (shipping):', error);
      }
    });

    setIsInitialized(true);

    return () => {
      unsubscribeProducts();
      unsubscribeOptions();
      unsubscribeSubobjects();
      unsubscribeOrders();
      unsubscribeCoupons();
      unsubscribeShipping();
    };
  }, [isInitialized, user]);

  const addToCart = (productId: string, quantity: number, selectedOptions?: { optionId: string; values: string[] }[]) => {
    const product = products.find(p => p.id === productId);
    if (!product || (product.stock !== undefined && product.stock < quantity)) {
      alert('No hay stock suficiente');
      return;
    }

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      quantity,
      selectedOptions
    };
    setCart(prev => [...prev, newItem]);

    trackEvent(AnalyticsEvents.ADD_TO_CART, {
      item_id: productId,
      item_name: product.name,
      quantity: quantity,
      price: product.price,
      currency: 'ARS'
    });
  };

  const removeFromCart = (cartItemId: string) => {
    const itemToRemove = cart.find(item => item.id === cartItemId);
    if (itemToRemove) {
      const product = products.find(p => p.id === itemToRemove.productId);
      trackEvent(AnalyticsEvents.REMOVE_FROM_CART, {
        item_id: itemToRemove.productId,
        item_name: product?.name || 'Unknown',
        quantity: itemToRemove.quantity,
        currency: 'ARS'
      });
    }
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'products', productId), { stock: newStock });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => {
    try {
      console.log('Iniciando proceso de pedido...', orderData);
      const baseUrl = window.location.origin;
      
      // Llamamos al backend para crear el pedido y generar el link de pago
      console.log('Llamando al backend para crear pedido y link de pago...');
      const response = await axios.post(`${baseUrl}/api/pedidos`, orderData);
      const { order, paymentUrl } = response.data;
      
      console.log('Respuesta del backend recibida:', { orderId: order.id, hasPaymentUrl: !!paymentUrl });
      
      // Guardamos en Firestore
      console.log('Guardando pedido en Firestore...');
      await setDoc(doc(db, 'orders', order.id), order);
      console.log('Pedido guardado en Firestore exitosamente.');
      
      // Guardamos el carrito temporalmente por si el pago falla
      localStorage.setItem('pendingCart', JSON.stringify(cart));
      
      // Actualizamos stock localmente y en Firestore
      console.log('Actualizando stock de productos...');
      for (const item of orderData.items) {
        const p = products.find(prod => prod.id === item.productId);
        if (p && p.stock !== undefined) {
          try {
            await updateDoc(doc(db, 'products', p.id), { stock: Math.max(0, p.stock - item.quantity) });
          } catch (stockError) {
            console.warn('No se pudo actualizar el stock (probablemente no eres admin):', stockError);
          }
        }
      }
      
      clearCart();
      
      trackEvent(AnalyticsEvents.PURCHASE, {
        transaction_id: order.id,
        value: order.total,
        currency: 'ARS',
        items: order.items.map(i => ({
          item_id: i.productId,
          item_name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      });

      return { order, paymentUrl };
    } catch (error: any) {
      console.error('Error detallado en addOrder:', error);
      
      trackEvent(AnalyticsEvents.PAYMENT_FAILED, {
        error_message: error.message || 'Unknown error'
      });
      if (error.response) {
        console.error('Datos del error del backend:', error.response.data);
        throw new Error(error.response.data.message || error.response.data.error || 'Error en el servidor al procesar el pedido');
      }
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const updateOrderShipping = async (orderId: string, cost: number, zone: string, distance?: number) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const newTotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0) - (order.discountAmount || 0) + cost;

      await updateDoc(orderRef, {
        shippingCost: cost,
        shippingZone: zone,
        distanceKm: distance,
        total: newTotal
      });
    } catch (error) {
      console.error('Error updating shipping:', error);
    }
  };

  const updateShippingSettings = async (settings: ShippingSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'shipping'), settings);
    } catch (error) {
      console.error('Error updating shipping settings:', error);
    }
  };

  const addOption = async (option: ProductOption) => {
    try {
      await setDoc(doc(db, 'options', option.id), option);
    } catch (error) {
      console.error('Error adding option:', error);
    }
  };

  const addSubobject = async (subobject: ProductOptionValue) => {
    try {
      await setDoc(doc(db, 'subobjects', subobject.id), subobject);
    } catch (error) {
      console.error('Error adding subobject:', error);
    }
  };

  const updateSubobject = async (subobject: ProductOptionValue) => {
    try {
      await setDoc(doc(db, 'subobjects', subobject.id), subobject);
      // Update options that use this subobject
      const optionsToUpdate = options.filter(o => o.values.some(v => v.id === subobject.id));
      for (const o of optionsToUpdate) {
        const newValues = o.values.map(v => v.id === subobject.id ? subobject : v);
        await updateOption({ ...o, values: newValues });
      }
    } catch (error) {
      console.error('Error updating subobject:', error);
    }
  };

  const deleteSubobject = async (subobjectId: string) => {
    try {
      await deleteDoc(doc(db, 'subobjects', subobjectId));
      // Remove from options
      const optionsToUpdate = options.filter(o => o.values.some(v => v.id === subobjectId));
      for (const o of optionsToUpdate) {
        const newValues = o.values.filter(v => v.id !== subobjectId);
        await updateOption({ ...o, values: newValues });
      }
    } catch (error) {
      console.error('Error deleting subobject:', error);
    }
  };

  const updateOption = async (updatedOption: ProductOption) => {
    try {
      await setDoc(doc(db, 'options', updatedOption.id), updatedOption);
      // Update products that use this option
      const productsToUpdate = products.filter(p => p.options?.some(o => o.id === updatedOption.id));
      for (const p of productsToUpdate) {
        const newOptions = p.options?.map(o => o.id === updatedOption.id ? updatedOption : o);
        await updateDoc(doc(db, 'products', p.id), { options: newOptions });
      }
    } catch (error) {
      console.error('Error updating option:', error);
    }
  };

  const deleteOption = async (optionId: string) => {
    try {
      await deleteDoc(doc(db, 'options', optionId));
      // Remove from products
      const productsToUpdate = products.filter(p => p.options?.some(o => o.id === optionId));
      for (const p of productsToUpdate) {
        const newOptions = p.options?.filter(o => o.id !== optionId);
        await updateDoc(doc(db, 'products', p.id), { options: newOptions });
      }
    } catch (error) {
      console.error('Error deleting option:', error);
    }
  };

  const updateProductOptions = async (productId: string, optionIds: string[]) => {
    try {
      const selectedOptions = options.filter(o => optionIds.includes(o.id));
      await updateDoc(doc(db, 'products', productId), { options: selectedOptions });
    } catch (error) {
      console.error('Error updating product options:', error);
    }
  };

  const addCoupon = async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch (error) {
      console.error('Error adding coupon:', error);
    }
  };

  const updateCoupon = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { ...coupon });
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const validateCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) return undefined;
    
    // Check expiry
    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      if (expiry < new Date()) return undefined;
    }
    
    return coupon;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      orders,
      coupons,
      addToCart,
      removeFromCart,
      clearCart,
      updateProduct,
      getProduct,
      addOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      updateOrderShipping,
      updateShippingSettings,
      updateStock,
      options,
      addOption,
      updateOption,
      deleteOption,
      updateProductOptions,
      subobjects,
      addSubobject,
      updateSubobject,
      deleteSubobject,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      validateCoupon,
      shippingSettings,
      user,
      loginWithGoogle,
      logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
