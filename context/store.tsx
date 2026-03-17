import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, OrderStatus, ProductOption, PaymentStatus, ProductCategory } from '../types';
import { COMMON_OPTIONS } from '../data/options';
import { MOCK_PRODUCTS } from '../data/products/allProducts';
import axios from 'axios';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';

export interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addToCart: (productId: string, quantity: number, selectedOptions?: { optionId: string; values: string[] }[]) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  updateProduct: (updatedProduct: Product) => void;
  getProduct: (id: string) => Product | undefined;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<{ order: Order; paymentUrl: string | null }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => void;
  updateStock: (productId: string, newStock: number) => void;
  options: ProductOption[];
  addOption: (option: ProductOption) => void;
  updateOption: (option: ProductOption) => void;
  deleteOption: (optionId: string) => void;
  updateProductOptions: (productId: string, optionIds: string[]) => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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

    const unsubscribeOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), async (snapshot) => {
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

    setIsInitialized(true);

    return () => {
      unsubscribeProducts();
      unsubscribeOptions();
      unsubscribeOrders();
    };
  }, [isInitialized]);

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
  };

  const removeFromCart = (cartItemId: string) => {
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
      const baseUrl = window.location.origin;
      // We still call the backend to generate the MercadoPago link
      const response = await axios.post(`${baseUrl}/api/pedidos`, orderData);
      const { order, paymentUrl } = response.data;
      
      // Save to Firestore
      await setDoc(doc(db, 'orders', order.id), order);
      
      // Update local stock in Firestore
      for (const item of orderData.items) {
        const p = products.find(prod => prod.id === item.productId);
        if (p && p.stock !== undefined) {
          await updateDoc(doc(db, 'products', p.id), { stock: Math.max(0, p.stock - item.quantity) });
        }
      }

      clearCart();
      return { order, paymentUrl };
    } catch (error) {
      console.error('Error adding order:', error);
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

  const addOption = async (option: ProductOption) => {
    try {
      await setDoc(doc(db, 'options', option.id), option);
    } catch (error) {
      console.error('Error adding option:', error);
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

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      orders,
      addToCart,
      removeFromCart,
      clearCart,
      updateProduct,
      getProduct,
      addOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      updateStock,
      options,
      addOption,
      updateOption,
      deleteOption,
      updateProductOptions
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
