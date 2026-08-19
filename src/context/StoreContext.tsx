"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FullProduct,
  Category,
  Order,
  ProductReview,
  INITIAL_FULL_PRODUCTS,
  CATEGORIES_DATA,
  INITIAL_ORDERS,
} from "../data/data";

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
  products: FullProduct[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addProduct: (product: FullProduct) => void;
  updateProduct: (product: FullProduct) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => FullProduct | undefined;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  addOrder: (order: Order) => void;
  addReview: (productId: string, review: Omit<ProductReview, "id" | "date" | "status">) => void;
  updateReviewStatus: (productId: string, reviewId: string, status: ProductReview["status"]) => void;
  deleteReview: (productId: string, reviewId: string) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalAUD: number;
  resetStoreData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = "carlton_valley_products_v2";
const CATEGORIES_STORAGE_KEY = "carlton_valley_categories_v2";
const ORDERS_STORAGE_KEY = "carlton_valley_orders_v2";
const CART_STORAGE_KEY = "carlton_valley_cart_v2";

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<FullProduct[]>(INITIAL_FULL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
      const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn("Could not load stored data:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {}
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {}
  }, [categories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {}
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart, isHydrated]);

  const addProduct = (product: FullProduct) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updated: FullProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProductById = (id: string): FullProduct | undefined => {
    return products.find(p => p.id === id);
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const addReview = (productId: string, reviewInput: Omit<ProductReview, "id" | "date" | "status">) => {
    const newReview: ProductReview = {
      ...reviewInput,
      id: "rev-" + Date.now(),
      date: new Date().toLocaleDateString("en-US"),
      status: "approved",
    };

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const updatedReviews = [newReview, ...(prod.reviews || [])];
        const avgRating =
          updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
        return {
          ...prod,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: Number(avgRating.toFixed(1)),
        };
      })
    );
  };

  const updateReviewStatus = (productId: string, reviewId: string, status: ProductReview["status"]) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const updatedReviews = (prod.reviews || []).map((r) =>
          r.id === reviewId ? { ...r, status } : r
        );
        return {
          ...prod,
          reviews: updatedReviews,
        };
      })
    );
  };

  const deleteReview = (productId: string, reviewId: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const updatedReviews = (prod.reviews || []).filter((r) => r.id !== reviewId);
        const avgRating =
          updatedReviews.length > 0
            ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
            : 5.0;
        return {
          ...prod,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: Number(avgRating.toFixed(1)),
        };
      })
    );
  };

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.productId === item.productId &&
          ci.color === item.color &&
          ci.size === item.size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      } else {
        const newCartItem: CartItem = {
          ...item,
          id: "cart-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        };
        return [...prev, newCartItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const resetStoreData = () => {
    setProducts(INITIAL_FULL_PRODUCTS);
    setCategories(CATEGORIES_DATA);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_FULL_PRODUCTS));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(CATEGORIES_DATA));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalAUD = cart.reduce((acc, item) => acc + item.priceAUD * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        cart,
        isCartOpen,
        setIsCartOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        addOrder,
        addReview,
        updateReviewStatus,
        deleteReview,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotalAUD,
        resetStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
