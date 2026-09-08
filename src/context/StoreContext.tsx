"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  FullProduct,
  Category,
  Order,
  ProductReview,
} from "../data/data";
import { productsApi, ordersApi, categoriesApi, reviewsApi, getApiError } from "../lib/api";
import { useAuth } from "./AuthContext";

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
  allProducts: FullProduct[];
  selectedCountry: "Australia" | "Sri Lanka";
  setSelectedCountry: (country: "Australia" | "Sri Lanka") => void;
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
  const { user, isAuthenticated } = useAuth();
  const [allProducts, setAllProducts] = useState<FullProduct[]>([]);
  const [selectedCountry, setSelectedCountryState] = useState<"Australia" | "Sri Lanka">("Australia");
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Sync selected country from authenticated user or localStorage
  useEffect(() => {
    if (user?.country === "Sri Lanka" || user?.country === "Australia") {
      setSelectedCountryState(user.country);
      try {
        localStorage.setItem("cv_selected_country", user.country);
        localStorage.setItem("cv_country_selected", "true");
      } catch { /* ignore */ }
    } else {
      try {
        const saved = localStorage.getItem("cv_selected_country");
        if (saved === "Sri Lanka" || saved === "Australia") {
          setSelectedCountryState(saved);
        }
      } catch { /* ignore */ }
    }
  }, [user]);

  const setSelectedCountry = useCallback((country: "Australia" | "Sri Lanka") => {
    setSelectedCountryState(country);
    try {
      localStorage.setItem("cv_selected_country", country);
      localStorage.setItem("cv_country_selected", "true");
    } catch { /* ignore */ }
  }, []);

  // Filter products by selected country for customers
  const products = useMemo(() => {
    return allProducts.filter((p) => {
      if (!p.targetCountries || !Array.isArray(p.targetCountries) || p.targetCountries.length === 0) {
        return true;
      }
      return p.targetCountries.includes(selectedCountry);
    });
  }, [allProducts, selectedCountry]);

  // ─── Bootstrap: load all data from API ──────────────────────────────────
  const refreshProducts = useCallback(async () => {
    try {
      const { data } = await productsApi.list();
      setAllProducts(data.data || []);
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

  // Whenever user authenticates (e.g. admin logs in), automatically fetch orders immediately!
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
    }
  }, [isAuthenticated, user, refreshOrders]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  // ─── Product Actions ─────────────────────────────────────────────────────
  const addProduct = async (product: FullProduct) => {
    // Optimistic UI update: instantly shows up in the table/cards
    setAllProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
    await productsApi.create(product as unknown as Record<string, unknown>);
    await refreshProducts();
  };

  const updateProduct = async (updated: FullProduct) => {
    // Optimistic UI update: instantly shows edits without waiting or refreshing
    setAllProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    await productsApi.update(updated.id, updated as unknown as Record<string, unknown>);
    await refreshProducts();
  };

  const deleteProduct = async (id: string) => {
    // Optimistic UI update: instantly removes from view
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
    await productsApi.delete(id);
    await refreshProducts();
  };

  const getProductById = (id: string) => allProducts.find(p => p.id === id);

  // ─── Category Actions ────────────────────────────────────────────────────
  const addCategory = async (category: Category) => {
    setCategories((prev) => [...prev.filter((c) => c.id !== category.id), category]);
    await categoriesApi.create(category as unknown as Record<string, unknown>);
    await refreshCategories();
  };

  const updateCategory = async (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    await categoriesApi.update(updated.id, updated as unknown as Record<string, unknown>);
    await refreshCategories();
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await categoriesApi.delete(id);
    await refreshCategories();
  };

  // ─── Order Actions ───────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, status: Order["status"], trackingNumber?: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, ...(trackingNumber ? { trackingNumber } : {}) } : o)));
    await ordersApi.updateStatus(orderId, status, trackingNumber);
    await refreshOrders();
  };

  const addOrder = async (orderData: Record<string, unknown>): Promise<Order> => {
    const { data } = await ordersApi.create(orderData);
    await refreshOrders();
    return data.data;
  };

  const deleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await ordersApi.delete(id);
    await refreshOrders();
  };

  // ─── Review Actions ──────────────────────────────────────────────────────
  const addReview = async (productId: string, reviewInput: Omit<ProductReview, "id" | "date" | "status">) => {
    await reviewsApi.submit({ ...reviewInput, productId });
    await refreshProducts();
  };

  const updateReviewStatus = async (productId: string, reviewId: string, status: ProductReview["status"]) => {
    await reviewsApi.updateStatus(reviewId, status as "approved" | "rejected" | "pending");
    await refreshProducts();
  };

  const deleteReview = async (productId: string, reviewId: string) => {
    await reviewsApi.delete(reviewId);
    await refreshProducts();
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
    setAllProducts([]);
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
        products, allProducts, selectedCountry, setSelectedCountry,
        categories, orders, cart,
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
