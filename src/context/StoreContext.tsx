"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  FullProduct,
  Category,
  Order,
  ProductReview,
} from "../data/data";
import { productsApi, ordersApi, categoriesApi, reviewsApi, getApiError } from "../lib/api";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceAUD: number;
  color: string;
  size: string;
  image: string;
  quantity: number;
}

interface StoreContextType {
  // Data
  products: FullProduct[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Cart
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalAUD: number;

  // Products
  addProduct: (product: FullProduct) => Promise<void>;
  updateProduct: (product: FullProduct) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => FullProduct | undefined;
  refreshProducts: () => Promise<void>;

  // Categories
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;

  // Orders
  updateOrderStatus: (orderId: string, status: Order["status"], trackingNumber?: string) => Promise<void>;
  addOrder: (orderData: Record<string, unknown>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;

  // Reviews
  addReview: (productId: string, review: Omit<ProductReview, "id" | "date" | "status">) => Promise<void>;
  updateReviewStatus: (productId: string, reviewId: string, status: ProductReview["status"]) => Promise<void>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;

  // Misc
  resetStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = "carlton_valley_cart_v3";

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts]     = useState<FullProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // ─── Bootstrap: load all data from API ──────────────────────────────────
  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await productsApi.list();
      setProducts(data.data || []);
    } catch (err) {
      console.warn("Failed to load products:", getApiError(err));
      setError(getApiError(err));
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { data } = await categoriesApi.list();
      setCategories(data.data || []);
    } catch (err) {
      console.warn("Failed to load categories:", getApiError(err));
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const { data } = await ordersApi.list();
      setOrders(data.data || []);
    } catch (err) {
      console.warn("Failed to load orders:", getApiError(err));
    }
  }, []);

  useEffect(() => {
    // Load cart from localStorage (client-side only)
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch { /* ignore */ }

    // Load server data in parallel
    Promise.all([refreshProducts(), refreshCategories(), refreshOrders()])
      .finally(() => setIsLoading(false));
  }, [refreshProducts, refreshCategories, refreshOrders]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  // ─── Product Actions ─────────────────────────────────────────────────────
  const addProduct = async (product: FullProduct) => {
    await productsApi.create(product as unknown as Record<string, unknown>);
    await refreshProducts();
  };

  const updateProduct = async (updated: FullProduct) => {
    await productsApi.update(updated.id, updated as unknown as Record<string, unknown>);
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = async (id: string) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => products.find(p => p.id === id);

  // ─── Category Actions ────────────────────────────────────────────────────
  const addCategory = async (category: Category) => {
    await categoriesApi.create(category as unknown as Record<string, unknown>);
    await refreshCategories();
  };

  const updateCategory = async (updated: Category) => {
    await categoriesApi.update(updated.id, updated as unknown as Record<string, unknown>);
    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = async (id: string) => {
    await categoriesApi.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ─── Order Actions ───────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, status: Order["status"], trackingNumber?: string) => {
    await ordersApi.updateStatus(orderId, status, trackingNumber);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, ...(trackingNumber ? { trackingNumber } : {}) } : o));
  };

  const addOrder = async (orderData: Record<string, unknown>): Promise<Order> => {
    const { data } = await ordersApi.create(orderData);
    await refreshOrders();
    return data.data;
  };

  const deleteOrder = async (id: string) => {
    await ordersApi.delete(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // ─── Review Actions ──────────────────────────────────────────────────────
  const addReview = async (productId: string, reviewInput: Omit<ProductReview, "id" | "date" | "status">) => {
    await reviewsApi.submit({ ...reviewInput, productId });
    // Refresh the affected product to get updated rating
    try {
      const { data } = await productsApi.getById(productId);
      if (data.success) {
        setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...data.data } : p)));
      }
    } catch { /* not critical */ }
  };

  const updateReviewStatus = async (productId: string, reviewId: string, status: ProductReview["status"]) => {
    await reviewsApi.updateStatus(reviewId, status as "approved" | "rejected" | "pending");
    // Locally update the review status in the product
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          reviews: (prod.reviews || []).map(r => (r.id === reviewId ? { ...r, status } : r)),
        };
      })
    );
  };

  const deleteReview = async (productId: string, reviewId: string) => {
    await reviewsApi.delete(reviewId);
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        const updatedReviews = (prod.reviews || []).filter(r => r.id !== reviewId);
        const avg = updatedReviews.length > 0
          ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
          : 5.0;
        return { ...prod, reviews: updatedReviews, reviewCount: updatedReviews.length, rating: parseFloat(avg.toFixed(1)) };
      })
    );
  };

  // ─── Cart Actions ────────────────────────────────────────────────────────
  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.productId === item.productId && ci.color === item.color && ci.size === item.size);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, { ...item, id: "cart-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) =>
    setCart(prev => prev.filter(i => i.id !== cartItemId));

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(cartItemId); return; }
    setCart(prev => prev.map(i => (i.id === cartItemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const resetStoreData = () => {
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setCart([]);
    Promise.all([refreshProducts(), refreshCategories(), refreshOrders()]);
  };

  const cartCount    = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotalAUD = cart.reduce((acc, i) => acc + i.priceAUD * i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products, categories, orders, cart,
        isCartOpen, isLoading, error,
        setIsCartOpen,
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        cartCount, cartTotalAUD,
        addProduct, updateProduct, deleteProduct, getProductById, refreshProducts,
        addCategory, updateCategory, deleteCategory, refreshCategories,
        updateOrderStatus, addOrder, deleteOrder, refreshOrders,
        addReview, updateReviewStatus, deleteReview,
        resetStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
