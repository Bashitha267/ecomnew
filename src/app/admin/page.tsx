"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "../../context/StoreContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";
import {
  FullProduct,
  ProductColorVariant,
  ProductSize,
  Category,
  Order,
  ProductReview,
  ShippingSection,
  DEFAULT_SHIPPING_SECTIONS,
} from "../../data/data";
import { RegionalOrderMap } from "../../components/admin/RegionalOrderMap";
import { HomepageVideoManager } from "../../components/admin/HomepageVideoManager";
import { CommunitySpotlightManager } from "../../components/admin/CommunitySpotlightManager";
import { UserManager } from "../../components/admin/UserManager";
import { getApiError, productsApi, analyticsApi, getImageUrl } from "../../lib/api";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Shirt,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Star,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Filter,
  DollarSign,
  TrendingUp,
  BarChart3,
  MousePointerClick,
  Flame,
  Download,
  TrendingDown,
  LogOut,
  Info,
  Users,
  Camera,
  Sparkles,
} from "lucide-react";

const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "2XL"];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    allProducts,
    products: customerProducts,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    updateOrderStatus,
    deleteOrder,
    refreshOrders,
    addReview,
    addAdminReview,
    updateReviewStatus,
    deleteReview,
    resetStoreData,
  } = useStore();
  const products = allProducts && allProducts.length > 0 ? allProducts : customerProducts;
  const { formatPrice } = useCurrency();

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "categories" | "products" | "reviews" | "reports" | "videos" | "users">("dashboard");
  const [homepageSubTab, setHomepageSubTab] = useState<"videos" | "spotlight">("videos");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // Auto-refresh orders whenever user visits "orders" or "dashboard" tab
  useEffect(() => {
    if (activeTab === "orders" || activeTab === "dashboard") {
      refreshOrders();
    }
  }, [activeTab, refreshOrders]);

  // Initial load when admin enters or user logs in
  useEffect(() => {
    refreshOrders();
    refreshProducts();
    refreshCategories();
  }, [user?.id, refreshOrders, refreshProducts, refreshCategories]);

  // Reports state
  const [reportTimeframe, setReportTimeframe] = useState<"7d" | "30d" | "all">("all");

  // Real analytics data from server (views / clicks / add_to_bag per product)
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, { views: number; clicks: number; addToBag: number }>>({});
  const [engagementSort, setEngagementSort] = useState<"views" | "clicks" | "addToBag">("views");

  useEffect(() => {
    if (activeTab !== "reports") return;
    const days = reportTimeframe === "7d" ? 7 : reportTimeframe === "30d" ? 30 : 0;
    analyticsApi.summary(days)
      .then(res => { if (res.data?.success) setAnalyticsMap(res.data.data); })
      .catch(() => {}); // silently ignore if the table isn't set up yet
  }, [activeTab, reportTimeframe]);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productCountryFilter, setProductCountryFilter] = useState<string>("all");

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<string>("");

  const [mediaPreviewModal, setMediaPreviewModal] = useState<{ url: string; type: "photo" | "video"; title?: string } | null>(null);

  // Product Form state (Create / Edit)
  const [productForm, setProductForm] = useState<Partial<FullProduct>>({
    id: "",
    name: "",
    priceAUD: 220,
    priceLKR: 46000,
    category: "Shirts",
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    targetCountries: ["Australia", "Sri Lanka"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [
      {
        id: "col-1",
        name: "Black",
        hex: "#111111",
        swatchImage: "",
        images: [],
      },
    ],
    descriptionSection: {
      header: "",
      description: "",
      fit: "",
      fabric: "",
      details: "",
    },
    shippingSections: DEFAULT_SHIPPING_SECTIONS,
    rating: 5.0,
    reviewCount: 0,
    reviews: [],
    isNewArrival: true,
    isComingSoon: false,
  });

  // Category Form state
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    id: "",
    title: "",
    buttonText: "SHOP NOW",
    image: "/images/cat_shop_all.jpg",
    link: "/shop",
    description: "",
  });

  // Review Form state
  const [reviewForm, setReviewForm] = useState<{
    reviewerName: string;
    verified: boolean;
    rating: number;
    title: string;
    comment: string;
    itemSize: string;
    itemColor: string;
    mediaType: "photo" | "video";
    mediaUrl: string;
  }>({
    reviewerName: "",
    verified: true,
    rating: 5,
    title: "",
    comment: "",
    itemSize: "M",
    itemColor: "Black",
    mediaType: "photo",
    mediaUrl: "",
  });

  // Search state for searchable comboboxes
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [reviewProductSearch, setReviewProductSearch] = useState("");
  const [showReviewProductDropdown, setShowReviewProductDropdown] = useState(false);

  // Open Product Modal for Create
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    const newId = "prod-" + (products.length + 1);
    setProductForm({
      id: newId,
      name: "",
      priceAUD: 220,
      priceLKR: 46000,
      category: categories[1]?.title || "Shirts",
      badge: "New Arrival",
      inStock: true,
      preOrder: false,
      targetCountries: ["Australia", "Sri Lanka"],
      sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      colors: [
        {
          id: "col-" + Date.now(),
          name: "Black",
          hex: "#111111",
          swatchImage: "",
          images: [],
        },
      ],
      descriptionSection: {
        header: "",
        description: "",
        fit: "Boxy relaxed drape. Designed to sit effortlessly over casual or tailored trousers.",
        fabric: "100% sustainable TENCEL™ Lyocell, 185 GSM.",
        details: "Mother-of-pearl buttons, single chest pocket, split side seams.",
      },
      shippingSections: JSON.parse(JSON.stringify(DEFAULT_SHIPPING_SECTIONS)),
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      isNewArrival: true,
      isComingSoon: false,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Edit
  const handleOpenEditProduct = (prod: FullProduct) => {
    setEditingProduct(prod);
    const targetCountries = prod.targetCountries && prod.targetCountries.length > 0
      ? prod.targetCountries
      : ["Australia", "Sri Lanka"];
    const priceLKR = prod.priceLKR !== undefined && prod.priceLKR !== null
      ? prod.priceLKR
      : (prod.priceAUD ? Math.round(prod.priceAUD * 210.5) : undefined);
    setProductForm({
      ...JSON.parse(JSON.stringify(prod)),
      targetCountries,
      priceAUD: prod.priceAUD,
      priceLKR,
    });
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim()) {
      showToast("Please provide a Product Name", "error");
      return;
    }

    const targetCountries = productForm.targetCountries && productForm.targetCountries.length > 0
      ? productForm.targetCountries
      : ["Australia", "Sri Lanka"];
    const isAU = targetCountries.includes("Australia");
    const isSL = targetCountries.includes("Sri Lanka");

    // Dynamic price validation depending on selected countries
    if (isAU && (productForm.priceAUD === undefined || Number(productForm.priceAUD) <= 0)) {
      showToast("Please provide a valid Australia Price (AUD $)", "error");
      return;
    }
    if (isSL && (productForm.priceLKR === undefined || Number(productForm.priceLKR) <= 0)) {
      showToast("Please provide a valid Sri Lanka Price (LKR Rs)", "error");
      return;
    }

    setIsSavingProduct(true);
    try {
      const finalId = editingProduct
        ? editingProduct.id
        : (productForm.id?.trim() || ("prod-" + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 6)));

      const priceAUDNum = Number(productForm.priceAUD) || 0;
      const priceLKRNum = Number(productForm.priceLKR) || 0;

      // Ensure priceAUD is filled for DB NOT NULL schema requirement
      const finalPriceAUD = priceAUDNum > 0
        ? priceAUDNum
        : (priceLKRNum > 0 ? Math.round((priceLKRNum / 210.5) * 100) / 100 : 0);

      const finalPriceLKR = isSL
        ? (priceLKRNum > 0 ? priceLKRNum : Math.round(finalPriceAUD * 210.5))
        : (priceLKRNum > 0 ? priceLKRNum : undefined);

      const finalProduct: FullProduct = {
        id: finalId,
        name: productForm.name.trim(),
        priceAUD: finalPriceAUD,
        priceLKR: finalPriceLKR,
        category: productForm.category || "Shirts",
        badge: productForm.badge || undefined,
        inStock: productForm.inStock ?? true,
        preOrder: productForm.preOrder ?? false,
        targetCountries,
        sizes: productForm.sizes && productForm.sizes.length > 0 ? productForm.sizes : ["M", "L"],
        colors: productForm.colors && productForm.colors.length > 0 ? productForm.colors : [
          {
            id: "col-1",
            name: "Standard",
            swatchImage: "",
            images: [],
          },
        ],
        descriptionSection: {
          header: productForm.descriptionSection?.header || productForm.name || "",
          description: productForm.descriptionSection?.description || "",
          fit: productForm.descriptionSection?.fit || "",
          fabric: productForm.descriptionSection?.fabric || "",
          details: productForm.descriptionSection?.details || "",
        },
        shippingSections: productForm.shippingSections || DEFAULT_SHIPPING_SECTIONS,
        rating: editingProduct ? editingProduct.rating : (Number(productForm.rating) || 5.0),
        reviewCount: editingProduct ? editingProduct.reviewCount : (productForm.reviews?.length || 0),
        reviews: editingProduct ? editingProduct.reviews : (productForm.reviews || []),
        isNewArrival: productForm.isNewArrival ?? true,
        isComingSoon: productForm.isComingSoon ?? false,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString().split("T")[0],
      };

      if (editingProduct) {
        await updateProduct(finalProduct);
        showToast("Product details edited successfully!", "success");
      } else {
        await addProduct(finalProduct);
        showToast("New product added successfully!", "success");
      }

      setIsProductModalOpen(false);
    } catch (err) {
      console.error("Save product error:", err);
      showToast(getApiError(err) || "Failed to save product to database.", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showToast(`Product "${name}" deleted successfully!`, "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to delete product.", "error");
    }
  };

  // Color Variant Management within Product Form
  const handleAddColorVariant = () => {
    const newColor: ProductColorVariant = {
      id: "col-" + Date.now(),
      name: "New Color",
      hex: "#333333",
      swatchImage: "",
      images: [],
    };
    setProductForm((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), newColor],
    }));
  };

  const handleRemoveColorVariant = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors?.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateColorField = (index: number, field: keyof ProductColorVariant, value: any) => {
    setProductForm((prev) => {
      const updated = [...(prev.colors || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, colors: updated };
    });
  };

  // Image management for a color (Up to 6 images)
  const handleAddImageToColor = (colorIndex: number, imageUrl: string) => {
    if (!imageUrl.trim()) return;
    setProductForm((prev) => {
      const updatedColors = [...(prev.colors || [])];
      const currentImages = updatedColors[colorIndex].images || [];
      if (currentImages.length >= 6) {
        alert("Maximum 6 images allowed per colorway.");
        return prev;
      }
      updatedColors[colorIndex].images = [...currentImages, imageUrl.trim()];
      return { ...prev, colors: updatedColors };
    });
  };

  const handleRemoveImageFromColor = (colorIndex: number, imgIndex: number) => {
    setProductForm((prev) => {
      const updatedColors = [...(prev.colors || [])];
      updatedColors[colorIndex].images = updatedColors[colorIndex].images.filter((_, idx) => idx !== imgIndex);
      return { ...prev, colors: updatedColors };
    });
  };

  // ─── File Upload Handlers for Product Color Variants ─────────────────────
  const [uploadingSwatchIdx, setUploadingSwatchIdx] = useState<number | null>(null);
  const [uploadingPhotosIdx, setUploadingPhotosIdx] = useState<number | null>(null);
  const swatchFileInputs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const photosFileInputs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleUploadSwatch = async (colorIdx: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (JPEG, PNG, WEBP, GIF, AVIF)", "error");
      return;
    }
    setUploadingSwatchIdx(colorIdx);
    try {
      const res = await productsApi.uploadImage(file);
      if (res.data?.url) {
        handleUpdateColorField(colorIdx, "swatchImage", res.data.url);
        showToast("Swatch image uploaded to uploads/ successfully!", "success");
      }
    } catch (err) {
      showToast(getApiError(err) || "Failed to upload swatch image", "error");
    } finally {
      setUploadingSwatchIdx(null);
      if (swatchFileInputs.current[colorIdx]) {
        swatchFileInputs.current[colorIdx]!.value = "";
      }
    }
  };

  const handleUploadColorPhotos = async (colorIdx: number, files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const currentImages = productForm.colors?.[colorIdx]?.images || [];
    const remainingSlots = 6 - currentImages.length;
    if (remainingSlots <= 0) {
      showToast("Maximum 6 images allowed per colorway.", "error");
      return;
    }

    const fileArray = Array.from(files).slice(0, remainingSlots);
    for (const f of fileArray) {
      if (!f.type.startsWith("image/")) {
        showToast("Please upload only valid image files (JPEG, PNG, WEBP, etc.)", "error");
        return;
      }
    }

    setUploadingPhotosIdx(colorIdx);
    try {
      const res = await productsApi.uploadMultipleImages(fileArray);
      if (res.data?.urls && res.data.urls.length > 0) {
        setProductForm((prev) => {
          const updatedColors = [...(prev.colors || [])];
          const curr = updatedColors[colorIdx].images || [];
          updatedColors[colorIdx] = {
            ...updatedColors[colorIdx],
            images: [...curr, ...res.data.urls].slice(0, 6),
          };
          return { ...prev, colors: updatedColors };
        });
        showToast(`Uploaded ${res.data.urls.length} photo(s) to uploads/ successfully!`, "success");
      }
    } catch (err) {
      showToast(getApiError(err) || "Failed to upload images", "error");
    } finally {
      setUploadingPhotosIdx(null);
      if (photosFileInputs.current[colorIdx]) {
        photosFileInputs.current[colorIdx]!.value = "";
      }
    }
  };

  // Dynamic Shipping Section and Bullet Points Management
  const handleAddShippingSection = () => {
    setProductForm((prev) => ({
      ...prev,
      shippingSections: [
        ...(prev.shippingSections || []),
        { header: "International Shipping", points: ["Dispatched via DHL Express (3–7 business days)"] },
      ],
    }));
  };

  const handleRemoveShippingSection = (secIndex: number) => {
    setProductForm((prev) => ({
      ...prev,
      shippingSections: prev.shippingSections?.filter((_, i) => i !== secIndex),
    }));
  };

  const handleUpdateShippingHeader = (secIndex: number, headerText: string) => {
    setProductForm((prev) => {
      const updated = [...(prev.shippingSections || [])];
      updated[secIndex].header = headerText;
      return { ...prev, shippingSections: updated };
    });
  };

  const handleAddShippingPoint = (secIndex: number) => {
    setProductForm((prev) => {
      const updated = [...(prev.shippingSections || [])];
      updated[secIndex].points = [...updated[secIndex].points, ""];
      return { ...prev, shippingSections: updated };
    });
  };

  const handleUpdateShippingPoint = (secIndex: number, pointIndex: number, text: string) => {
    setProductForm((prev) => {
      const updated = [...(prev.shippingSections || [])];
      updated[secIndex].points[pointIndex] = text;
      return { ...prev, shippingSections: updated };
    });
  };

  const handleRemoveShippingPoint = (secIndex: number, pointIndex: number) => {
    setProductForm((prev) => {
      const updated = [...(prev.shippingSections || [])];
      updated[secIndex].points = updated[secIndex].points.filter((_, idx) => idx !== pointIndex);
      return { ...prev, shippingSections: updated };
    });
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title?.trim()) {
      showToast("Please provide a Category Title.", "error");
      return;
    }

    setIsSavingCategory(true);
    try {
      const catId = editingCategory ? editingCategory.id : "cat-" + Date.now().toString().slice(-6);
      const finalCat: Category = {
        id: catId,
        title: categoryForm.title.trim(),
        buttonText: categoryForm.buttonText || "SHOP NOW",
        image: categoryForm.image || "/images/cat_shop_all.jpg",
        link: categoryForm.link || "/shop",
        description: categoryForm.description || "",
        itemCount: products.filter((p) => p.category === categoryForm.title).length,
      };

      if (editingCategory) {
        await updateCategory(finalCat);
        showToast("Category updated successfully!", "success");
      } else {
        await addCategory(finalCat);
        showToast("New category created successfully!", "success");
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error("Save category error:", err);
      showToast(getApiError(err) || "Failed to save category.", "error");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete category "${title}"?`)) return;
    try {
      await deleteCategory(id);
      showToast(`Category "${title}" deleted successfully!`, "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to delete category.", "error");
    }
  };

  // Review CRUD
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview || !reviewForm.reviewerName || !reviewForm.comment) {
      showToast("Please select product, reviewer name, and comment", "error");
      return;
    }

    setIsSavingReview(true);
    try {
      await addAdminReview(selectedProductForReview, {
        reviewerName: reviewForm.reviewerName.trim(),
        verified: reviewForm.verified,
        rating: reviewForm.rating,
        title: reviewForm.title?.trim() || undefined,
        comment: reviewForm.comment.trim(),
        itemSize: reviewForm.itemSize,
        itemColor: reviewForm.itemColor,
        mediaType: reviewForm.mediaUrl ? reviewForm.mediaType : undefined,
        mediaUrl: reviewForm.mediaUrl || undefined,
        mediaThumbnail: reviewForm.mediaUrl ? reviewForm.mediaUrl : undefined,
      });

      showToast("Review published & approved successfully!", "success");
      setIsReviewModalOpen(false);
      setReviewProductSearch("");
      setShowReviewProductDropdown(false);
      setReviewForm({
        reviewerName: "",
        verified: true,
        rating: 5,
        title: "",
        comment: "",
        itemSize: "M",
        itemColor: "Black",
        mediaType: "photo",
        mediaUrl: "",
      });
    } catch (err) {
      console.error("Save review error:", err);
      showToast(getApiError(err) || "Failed to submit review.", "error");
    } finally {
      setIsSavingReview(false);
    }
  };


  const handleUpdateReviewStatus = async (productId: string, reviewId: string, status: ProductReview["status"]) => {
    try {
      await updateReviewStatus(productId, reviewId, status);
      showToast(`Review marked as ${status} in database!`, "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to update review status.", "error");
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(productId, reviewId);
      showToast("Review deleted successfully from database!", "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to delete review.", "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"], trackingNumber?: string) => {
    try {
      await updateOrderStatus(orderId, status, trackingNumber);
      showToast(`Order #${orderId} status updated to "${status}"!`, "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to update order status.", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await deleteOrder(orderId);
      showToast(`Order #${orderId} deleted from database!`, "success");
    } catch (err) {
      showToast(getApiError(err) || "Failed to delete order.", "error");
    }
  };

  // Calculations for Dashboard & Order Currency Handling
  const AUD_TO_LKR_RATE = 210.5;

  const isOrderSriLankan = (order: { country?: string; shippingAddress?: string }): boolean => {
    if (order.country === "Sri Lanka") return true;
    if (order.country === "Australia") return false;
    const addr = (order.shippingAddress || "").toLowerCase();
    return addr.includes("sri lanka") || addr.includes("colombo");
  };

  const formatOrderPrice = (amountAUD: number, country?: string, shippingAddress?: string): string => {
    const isSL = isOrderSriLankan({ country, shippingAddress });
    if (isSL) {
      const lkr = Math.round((Number(amountAUD) || 0) * AUD_TO_LKR_RATE);
      return `LKR ${lkr.toLocaleString()}`;
    }
    return `AUD $${Number(amountAUD || 0).toFixed(2)}`;
  };

  const ausOrders = orders.filter((o) => !isOrderSriLankan(o));
  const slOrders = orders.filter((o) => isOrderSriLankan(o));

  const ausRevenueAUD = ausOrders.reduce((sum, o) => sum + (Number(o.totalAUD) || 0), 0);
  const slRevenueAUD = slOrders.reduce((sum, o) => sum + (Number(o.totalAUD) || 0), 0);
  const slRevenueLKR = Math.round(slRevenueAUD * AUD_TO_LKR_RATE);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAUD, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const allReviewsList: { product: FullProduct; review: ProductReview }[] = [];
  products.forEach((p) => {
    (p.reviews || []).forEach((r) => {
      allReviewsList.push({ product: p, review: r });
    });
  });

  const averageStoreRating =
    products.length > 0
      ? (products.reduce((acc, p) => acc + (p.rating || 5.0), 0) / products.length).toFixed(1)
      : "5.0";

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== "all" && o.status.toLowerCase() !== orderStatusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== "all" && p.category !== productCategoryFilter) {
      return false;
    }
    if (productCountryFilter !== "all") {
      const pCountries = p.targetCountries && p.targetCountries.length > 0
        ? p.targetCountries
        : ["Australia", "Sri Lanka"];
      if (!pCountries.includes(productCountryFilter)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Analytics & Reports Calculations — all values derived from real orders only
  // Filter orders by timeframe
  const now = new Date();
  const timeframeDays = reportTimeframe === "7d" ? 7 : reportTimeframe === "30d" ? 30 : Infinity;
  const filteredReportOrders = orders.filter((o) => {
    if (timeframeDays === Infinity) return true;
    const created = o.date ? new Date(o.date) : null;
    if (!created || isNaN(created.getTime())) return true;
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= timeframeDays;
  });

  const productAnalytics = products.map((prod) => {
    // Real units sold from actual non-cancelled orders in the selected timeframe
    const unitsFromOrders = filteredReportOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, ord) => {
        const item = ord.items.find((i) => i.productId === prod.id);
        return sum + (item ? item.quantity : 0);
      }, 0);

    // Real revenue = actual units × product price
    const grossRevenueAUD = unitsFromOrders * prod.priceAUD;

    // Real order count for this product
    const orderCount = filteredReportOrders
      .filter((o) => o.status !== "Cancelled" && o.items.some((i) => i.productId === prod.id))
      .length;

    return {
      product: prod,
      unitsSold: unitsFromOrders,
      grossRevenueAUD,
      orderCount,
    };
  });

  // 1. Top Selling Items (by real units sold)
  const topSellingItems = [...productAnalytics].sort((a, b) => b.unitsSold - a.unitsSold);

  // Most Viewed / Most Clicked — no real tracking data; fall back to top sellers
  const mostViewedItems = topSellingItems;
  const mostClickedItems = topSellingItems;

  // Real Summary Totals for selected timeframe
  const reportNonCancelledOrders = filteredReportOrders.filter((o) => o.status !== "Cancelled");
  const reportAusOrders = reportNonCancelledOrders.filter((o) => !isOrderSriLankan(o));
  const reportSlOrders = reportNonCancelledOrders.filter((o) => isOrderSriLankan(o));

  const reportAusRevenueAUD = reportAusOrders.reduce((sum, o) => sum + (Number(o.totalAUD) || 0), 0);
  const reportSlRevenueAUD = reportSlOrders.reduce((sum, o) => sum + (Number(o.totalAUD) || 0), 0);
  const reportSlRevenueLKR = Math.round(reportSlRevenueAUD * AUD_TO_LKR_RATE);

  const totalReportUnitsSold = reportNonCancelledOrders
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const totalReportRevenueAUD = reportAusRevenueAUD + reportSlRevenueAUD;

  const totalReportOrders = reportNonCancelledOrders.length;

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Rank", "Product Name", "SKU", "Category", "Price (AUD)", "Units Sold", "Gross Revenue (AUD)", "Orders"];
    const rows = topSellingItems.map((item, idx) => [
      idx + 1,
      `"${item.product.name.replace(/"/g, '""')}"`,
      item.product.id,
      item.product.category,
      item.product.priceAUD,
      item.unitsSold,
      item.grossRevenueAUD,
      item.orderCount,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carlton_valley_analytics_report_${reportTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans antialiased">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-neutral-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-serif font-bold text-sm tracking-widest uppercase text-white">
            CV ADMIN
          </span>
        </div>
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 border border-neutral-700 px-2.5 py-1 rounded"
        >
          <span>View Store</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Closable Toggle Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-neutral-900 border-r border-neutral-800 z-50 flex flex-col justify-between transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          {/* Brand Header & Toggle */}
          <div className="h-16 border-b border-neutral-800 px-4 flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-serif text-sm font-semibold tracking-[0.2em] uppercase text-white truncate">
                  CARLTON VALLEY
                </span>
              </div>
            ) : (
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mx-auto animate-pulse" />
            )}

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Tabs with Icons */}
          <nav className="p-3 space-y-1.5 font-sans text-xs tracking-wider uppercase font-medium">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <LayoutDashboard size={18} />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("orders");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all relative ${
                activeTab === "orders"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <ShoppingBag size={18} />
              {!sidebarCollapsed && <span>Orders</span>}
              {pendingOrdersCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "orders" ? "bg-black text-white" : "bg-emerald-500 text-black"
                  } ${sidebarCollapsed ? "absolute top-2 right-2" : "ml-auto"}`}
                >
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("categories");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "categories"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Layers size={18} />
              {!sidebarCollapsed && <span>Categories</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "products"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Shirt size={18} />
              {!sidebarCollapsed && <span>Products</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("reviews");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "reviews"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <MessageSquare size={18} />
              {!sidebarCollapsed && <span>Reviews</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("reports");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "reports"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <BarChart3 size={18} />
              {!sidebarCollapsed && <span>Reports</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("videos");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "videos"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Video size={18} />
              {!sidebarCollapsed && <span>Homepage Content</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-all ${
                activeTab === "users"
                  ? "bg-white text-black font-bold shadow"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Users size={18} />
              {!sidebarCollapsed && <span>Manage Users</span>}
            </button>
          </nav>
        </div>

        {/* Footer in sidebar */}
        <div className="p-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink size={16} />
            {!sidebarCollapsed && <span>Live Storefront</span>}
          </Link>
          <button
            onClick={() => {
              if (confirm("Reset all store data to factory defaults?")) {
                resetStoreData();
              }
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded text-neutral-500 hover:text-red-400 text-[11px] transition-colors"
          >
            <RefreshCw size={14} />
            {!sidebarCollapsed && <span>Reset Demo Data</span>}
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-neutral-900/60 backdrop-blur border-b border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-200">
              {activeTab === "dashboard" && "Overview Dashboard"}
              {activeTab === "orders" && "Customer Orders"}
              {activeTab === "categories" && "Product Categories"}
              {activeTab === "products" && "Catalog & Inventory"}
              {activeTab === "reviews" && "Customer Reviews & Media"}
              {activeTab === "reports" && "Reports & Performance Analytics"}
              {activeTab === "videos" && "Homepage Content Management"}
              {activeTab === "users" && "User & Access Management"}
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <Link
              href="/shop"
              className="hidden sm:flex items-center space-x-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded transition-colors"
            >
              <span>View Shop Catalog</span>
              <ArrowUpRight size={13} />
            </Link>
            <div className="flex items-center space-x-3 border-l border-neutral-800 pl-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-neutral-200 font-medium leading-tight">{user?.name || "Admin"}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Master Administrator</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-neutral-400 hover:text-red-400 p-1.5 rounded hover:bg-neutral-800 transition-colors"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Australia Sales */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                      <span>🇦🇺</span> Australia Sales
                    </span>
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white my-1">
                    AUD ${ausRevenueAUD.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2 border-t border-neutral-800/80 pt-2 flex items-center justify-between">
                    <span>{ausOrders.length} Australia orders</span>
                    <span className="text-neutral-500 font-mono text-[10px]">AUD ($)</span>
                  </div>
                </div>

                {/* Card 2: Sri Lanka Sales */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
                      <span>🇱🇰</span> Sri Lanka Sales
                    </span>
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-400 my-1">
                    LKR {slRevenueLKR.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2 border-t border-neutral-800/80 pt-2 flex items-center justify-between">
                    <span>{slOrders.length} Sri Lanka orders</span>
                    <span className="text-neutral-500 font-mono text-[10px]">LKR (Rs)</span>
                  </div>
                </div>

                {/* Card 3: Total Orders */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Total Orders</span>
                    <ShoppingBag size={18} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white my-1">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2 border-t border-neutral-800/80 pt-2">
                    <span className="text-yellow-400 font-medium">{pendingOrdersCount} requiring fulfillment</span>
                  </div>
                </div>

                {/* Card 4: Active Products */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Active Products</span>
                    <Shirt size={18} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white my-1">
                    {products.length}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2 border-t border-neutral-800/80 pt-2">
                    <span>Across {categories.length} categories</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Overview */}
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-200">
                      Recent Transactions
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1"
                    >
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-neutral-400 border-b border-neutral-800 pb-2">
                          <th className="pb-2 font-medium">Order ID</th>
                          <th className="pb-2 font-medium">Customer</th>
                          <th className="pb-2 font-medium">Total</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {orders.slice(0, 4).map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-800/40">
                            <td className="py-3 font-mono font-medium text-white">{order.id}</td>
                            <td className="py-3 text-neutral-300">
                              <div>{order.customerName}</div>
                              <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                                <span>{isOrderSriLankan(order) ? "🇱🇰" : "🇦🇺"}</span>
                                <span>{order.country || (isOrderSriLankan(order) ? "Sri Lanka" : "Australia")}</span>
                              </div>
                            </td>
                            <td className="py-3 font-mono text-neutral-200">
                              <span className="font-semibold text-white">
                                {formatOrderPrice(order.totalAUD, order.country, order.shippingAddress)}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : order.status === "Shipped"
                                    ? "bg-blue-950 text-blue-300 border border-blue-800"
                                    : order.status === "Processing"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : "bg-neutral-800 text-neutral-300"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderModalOpen(true);
                                }}
                                className="text-neutral-400 hover:text-white p-1"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Store Actions & Top Sellers */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-200">
                    Quick Inventory Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleOpenCreateProduct}
                      className="w-full bg-white text-black py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Create New Product</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({
                          id: "cat-" + (categories.length + 1),
                          title: "",
                          buttonText: "SHOP NOW",
                          image: "/images/cat_shop_all.jpg",
                          link: "/shop",
                          description: "",
                        });
                        setIsCategoryModalOpen(true);
                      }}
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Category</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductForReview("");
                        setReviewProductSearch("");
                        setIsReviewModalOpen(true);
                      }}
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare size={16} />
                      <span>Add Customer Review</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-neutral-800">
                    <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-3">
                      Top Selling Apparel
                    </h4>
                    <div className="space-y-3">
                      {products.slice(0, 3).map((prod) => (
                        <div key={prod.id} className="flex items-center space-x-3 text-xs">
                          <img
                            src={getImageUrl(prod.colors[0]?.images[0] || prod.colors[0]?.swatchImage)}
                            alt={prod.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                            }}
                            className="w-10 h-12 object-cover rounded bg-neutral-800"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-white truncate">{prod.name}</p>
                            <p className="text-neutral-400 font-mono text-[11px]">{formatPrice(prod.priceAUD)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold text-xs">★ {prod.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Regional Order Heatmaps (Sri Lanka 9 Provinces & Australia 8 States) */}
              <RegionalOrderMap orders={orders} formatPrice={formatPrice} />
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <button
                    onClick={async () => {
                      setIsRefreshingOrders(true);
                      await refreshOrders();
                      setIsRefreshingOrders(false);
                      showToast("Orders refreshed from database!", "info");
                    }}
                    disabled={isRefreshingOrders}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-white rounded transition-colors disabled:opacity-50"
                    title="Refresh orders from database"
                  >
                    <RefreshCw size={13} className={isRefreshingOrders ? "animate-spin" : ""} />
                    <span>{isRefreshingOrders ? "Syncing..." : "Refresh"}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-400 uppercase tracking-wider text-[11px]">Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-white rounded px-3 py-2 focus:outline-none"
                    >
                      <option value="all">All Orders ({orders.length})</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800 text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Order ID</th>
                        <th className="py-3.5 px-4 font-semibold">Date</th>
                        <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                        <th className="py-3.5 px-4 font-semibold">Items Purchased</th>
                        <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-400">
                            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-500" />
                            <p className="text-sm font-medium text-white">No orders found</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {searchQuery ? "Try adjusting your search or filter." : "No orders have been found."}
                            </p>
                            <button
                              onClick={async () => {
                                setIsRefreshingOrders(true);
                                await refreshOrders();
                                setIsRefreshingOrders(false);
                              }}
                              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition-colors"
                            >
                              <RefreshCw size={12} className={isRefreshingOrders ? "animate-spin" : ""} />
                              <span>Sync Orders Now</span>
                            </button>
                          </td>
                        </tr>
                      )}
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-white">{order.id}</td>
                          <td className="py-4 px-4 text-neutral-400 font-mono text-[11px]">{order.date}</td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-white">{order.customerName}</div>
                            <div className="text-[11px] text-neutral-400">{order.customerEmail}</div>
                            {order.country && (
                              <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5 flex items-center gap-1">
                                <span>{order.country === "Sri Lanka" ? "🇱🇰" : "🇦🇺"}</span>
                                <span>{order.district ? `${order.district}, ` : ""}{order.country}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex -space-x-2 overflow-hidden">
                              {order.items.map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image}
                                  alt={item.productName}
                                  title={`${item.productName} (${item.color}, ${item.size}) x${item.quantity}`}
                                  className="inline-block h-8 w-8 rounded-full ring-2 ring-neutral-900 object-cover"
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium text-white">
                            <div className="font-bold text-white">
                              {formatOrderPrice(order.totalAUD, order.country, order.shippingAddress)}
                            </div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-sans">
                              <span>{isOrderSriLankan(order) ? "🇱🇰 LKR" : "🇦🇺 AUD"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                              className={`text-[11px] font-semibold uppercase tracking-wider rounded px-2.5 py-1 border focus:outline-none ${
                                order.status === "Delivered"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                  : order.status === "Shipped"
                                  ? "bg-blue-950 text-blue-300 border-blue-700"
                                  : order.status === "Processing"
                                  ? "bg-amber-950 text-amber-300 border-amber-700"
                                  : "bg-neutral-800 text-neutral-300 border-neutral-700"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderModalOpen(true);
                              }}
                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded text-xs transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Store Collections & Categories
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Manage shopping navigation blocks and catalog groupings
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({
                      id: "cat-" + (categories.length + 1),
                      title: "",
                      buttonText: "SHOP NOW",
                      image: "/images/cat_shop_all.jpg",
                      link: "/shop",
                      description: "",
                    });
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-white text-black py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center space-x-1.5"
                >
                  <Plus size={15} />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const productCount = products.filter((p) => p.category === cat.title).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div>
                            <h4 className="text-base font-serif font-bold text-white tracking-wide">
                              {cat.title}
                            </h4>
                            <span className="text-[11px] font-mono text-neutral-300">
                              {productCount} items linked
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-mono tracking-wider bg-black/70 border border-white/20 text-white px-2 py-1">
                            {cat.buttonText}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {cat.description || "No description entered for this collection category."}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                          <span className="font-mono text-[11px] text-neutral-500">
                            Route: {cat.link}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setCategoryForm(cat);
                                setIsCategoryModalOpen(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.title)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Product Header & Filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search products, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={productCountryFilter}
                    onChange={(e) => setProductCountryFilter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Regions</option>
                    <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                    <option value="Australia">🇦🇺 Australia</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={async () => {
                      await refreshProducts();
                      showToast("Product list refreshed from database!", "info");
                    }}
                    className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-white py-2.5 px-3 rounded text-xs transition-colors flex items-center space-x-1.5"
                    title="Refresh product list from database"
                  >
                    <RefreshCw size={13} />
                    <span>Sync</span>
                  </button>

                  <button
                    onClick={handleOpenCreateProduct}
                    className="bg-white text-black py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800 text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Product & ID</th>
                        <th className="py-3.5 px-4 font-semibold">Category</th>
                        <th className="py-3.5 px-4 font-semibold">Price</th>
                        <th className="py-3.5 px-4 font-semibold">Display Regions</th>
                        <th className="py-3.5 px-4 font-semibold">Colors & Images</th>
                        <th className="py-3.5 px-4 font-semibold">Sizes</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-neutral-400">
                            <Shirt className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-500" />
                            <p className="text-sm font-medium text-white">No products found</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {searchQuery || productCategoryFilter !== "all" || productCountryFilter !== "all" ? "Try adjusting your search or filter." : "No products have been added yet."}
                            </p>
                            <button
                              onClick={async () => {
                                await refreshProducts();
                                showToast("Product list refreshed from database!", "info");
                              }}
                              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition-colors"
                            >
                              <RefreshCw size={12} />
                              <span>Sync Products Now</span>
                            </button>
                          </td>
                        </tr>
                      )}
                      {filteredProducts.map((prod) => {
                        const totalImages = prod.colors.reduce((sum, c) => sum + (c.images?.length || 0), 0);
                        const firstImage = getImageUrl(prod.colors[0]?.images[0] || prod.colors[0]?.swatchImage);
                        return (
                          <tr key={prod.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={firstImage}
                                  alt={prod.name}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                                  }}
                                  className="w-12 h-14 object-cover rounded bg-neutral-950 border border-neutral-800"
                                />
                                <div>
                                  <Link
                                    href={`/product/${prod.id}`}
                                    className="font-serif text-sm font-medium text-white hover:underline block"
                                  >
                                    {prod.name}
                                  </Link>
                                  <span className="font-mono text-[11px] text-neutral-500 uppercase">
                                    ID: {prod.id} {prod.badge && `• ${prod.badge}`}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono font-medium">
                              {(!prod.targetCountries || prod.targetCountries.length === 2 || prod.targetCountries.length === 0) ? (
                                <div className="space-y-0.5">
                                  <div className="text-white text-xs">🇦🇺 AUD ${(Number(prod.priceAUD) || 0).toFixed(2)}</div>
                                  <div className="text-amber-400 text-[11px]">
                                    🇱🇰 LKR {((Number(prod.priceLKR) || Math.round((Number(prod.priceAUD) || 0) * 210.5))).toLocaleString()}
                                  </div>
                                </div>
                              ) : prod.targetCountries.includes("Sri Lanka") ? (
                                <div className="text-amber-400 text-xs">
                                  🇱🇰 LKR {((Number(prod.priceLKR) || Math.round((Number(prod.priceAUD) || 0) * 210.5))).toLocaleString()}
                                </div>
                              ) : (
                                <div className="text-white text-xs">🇦🇺 AUD ${(Number(prod.priceAUD) || 0).toFixed(2)}</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1">
                                {(!prod.targetCountries || prod.targetCountries.length === 2 || prod.targetCountries.length === 0) ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-200 border border-neutral-700" title="Visible in both Australia and Sri Lanka">
                                    <span>🇦🇺 🇱🇰</span>
                                    <span>Both</span>
                                  </span>
                                ) : prod.targetCountries.includes("Sri Lanka") ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-700/60" title="Visible in Sri Lanka only">
                                    <span>🇱🇰</span>
                                    <span>Sri Lanka</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 text-blue-300 border border-blue-700/60" title="Visible in Australia only">
                                    <span>🇦🇺</span>
                                    <span>Australia</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1">
                                  {prod.colors.map((c) => (
                                    <span
                                      key={c.id}
                                      className="w-3.5 h-3.5 rounded-full border border-neutral-600 inline-block"
                                      style={{ backgroundColor: c.hex || "#333" }}
                                      title={`${c.name} (${c.images.length} images)`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono block">
                                  {prod.colors.length} colors • {totalImages} images (up to 6/color)
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {prod.sizes.map((s) => (
                                  <span
                                    key={s}
                                    className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    prod.inStock
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                      : "bg-red-950 text-red-300 border border-red-800"
                                  }`}
                                >
                                  {prod.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                                {prod.preOrder && (
                                  <span className="block text-[10px] font-mono text-yellow-400">
                                    Pre-Order
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <Link
                                  href={`/product/${prod.id}`}
                                  target="_blank"
                                  className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                                  title="Preview Product Detail Page"
                                >
                                  <Eye size={15} />
                                </Link>
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Customer Reviews & Media Uploads
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Moderate customer feedback, star ratings, photo and video testimonials
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProductForReview("");
                    setReviewProductSearch("");
                    setIsReviewModalOpen(true);
                  }}
                  className="bg-white text-black py-2 px-4 rounded text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center space-x-1.5"
                >
                  <Plus size={15} />
                  <span>Add Review</span>
                </button>
              </div>

              {/* Reviews Moderation Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800 text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Product Tagged</th>
                        <th className="py-3.5 px-4 font-semibold">Reviewer & Date</th>
                        <th className="py-3.5 px-4 font-semibold">Rating</th>
                        <th className="py-3.5 px-4 font-semibold">Review Text & Size</th>
                        <th className="py-3.5 px-4 font-semibold">Attached Media</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {allReviewsList.map(({ product, review }) => (
                        <tr key={review.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-serif text-white font-medium">{product.name}</div>
                            <span className="font-mono text-[10px] text-neutral-500">ID: {product.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-medium text-white">{review.reviewerName}</span>
                              {review.verified && (
                                <CheckCircle size={12} className="text-emerald-400" />
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-neutral-400">{review.date}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex text-emerald-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={13}
                                  className={
                                    i < review.rating
                                      ? "fill-emerald-400 text-emerald-400 stroke-none"
                                      : "text-neutral-700"
                                  }
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-sm">
                            {review.title && (
                              <div className="font-medium text-neutral-200 mb-0.5">{review.title}</div>
                            )}
                            <p className="text-neutral-300 text-[11px] line-clamp-2">{review.comment}</p>
                            {review.itemSize && (
                              <span className="inline-block mt-1 text-[10px] font-mono text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded">
                                Item size: {review.itemSize} {review.itemColor && `• ${review.itemColor}`}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {review.mediaUrl ? (
                              <button
                                onClick={() =>
                                  setMediaPreviewModal({
                                    url: review.mediaUrl!,
                                    type: review.mediaType || "photo",
                                    title: `${review.reviewerName}'s Review Media`,
                                  })
                                }
                                className="relative group/media w-12 h-12 rounded bg-neutral-950 overflow-hidden border border-neutral-700 block cursor-pointer"
                              >
                                {review.mediaType === "video" ? (
                                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                                    {review.mediaThumbnail ? (
                                      <img
                                        src={review.mediaThumbnail}
                                        alt="Video thumb"
                                        className="w-full h-full object-cover opacity-60"
                                      />
                                    ) : (
                                      <div className="bg-neutral-800 w-full h-full" />
                                    )}
                                    <Play size={16} className="absolute text-white drop-shadow" />
                                  </div>
                                ) : (
                                  <img
                                    src={review.mediaUrl}
                                    alt="Review media"
                                    className="w-full h-full object-cover group-hover/media:scale-110 transition-transform"
                                  />
                                )}
                              </button>
                            ) : (
                              <span className="text-neutral-600 font-mono text-[10px]">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                review.status === "approved"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : review.status === "pending"
                                  ? "bg-yellow-950 text-yellow-300 border border-yellow-800"
                                  : "bg-red-950 text-red-300 border border-red-800"
                              }`}
                            >
                              {review.status || "approved"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => {
                                  const nextStatus = review.status === "approved" ? "pending" : "approved";
                                  handleUpdateReviewStatus(product.id, review.id, nextStatus);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                                title="Toggle status"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(product.id, review.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800"
                                title="Delete review"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & ANALYTICS */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Reports Header & Timeframe Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 p-5 rounded-lg border border-neutral-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={20} className="text-emerald-400" />
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white">
                      E-Commerce Performance Reports
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Real-time engagement breakdown: Most Viewed, Most Clicked, and Top Selling items.
                  </p>
                </div>

                {/* Timeframe & CSV Export Controls */}
                <div className="flex items-center space-x-3 self-stretch sm:self-auto">
                  <div className="flex bg-neutral-950 p-1 rounded border border-neutral-800 text-xs font-mono">
                    <button
                      onClick={() => setReportTimeframe("7d")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        reportTimeframe === "7d"
                          ? "bg-white text-black font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setReportTimeframe("30d")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        reportTimeframe === "30d"
                          ? "bg-white text-black font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      30 Days
                    </button>
                    <button
                      onClick={() => setReportTimeframe("all")}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        reportTimeframe === "all"
                          ? "bg-white text-black font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      All Time
                    </button>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3.5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-neutral-700"
                    title="Export CSV data"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm("This will permanently delete ALL analytics data (page views, clicks, add-to-bag events). This is irreversible. Continue?")) return;
                      try {
                        await analyticsApi.clear();
                        setAnalyticsMap({});
                        showToast("Analytics data cleared successfully.", "success");
                      } catch {
                        showToast("Failed to clear analytics data.", "error");
                      }
                    }}
                    className="bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 hover:border-red-600 px-3.5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    title="Delete all analytics tracking data"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Clear Analytics</span>
                  </button>
                </div>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Australia Revenue */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span>🇦🇺</span> Australia Revenue
                    </span>
                    <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    AUD ${reportAusRevenueAUD.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {reportAusOrders.length} AU order{reportAusOrders.length !== 1 ? "s" : ""} in period
                  </div>
                </div>

                {/* Card 2: Sri Lanka Revenue */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span>🇱🇰</span> Sri Lanka Revenue
                    </span>
                    <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    LKR {reportSlRevenueLKR.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {reportSlOrders.length} LK order{reportSlOrders.length !== 1 ? "s" : ""} in period
                  </div>
                </div>

                {/* Card 3: Total Orders Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Total Orders</span>
                    <ShoppingBag size={16} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {totalReportOrders}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {filteredReportOrders.filter((o) => o.status === "Cancelled").length} cancelled in period
                  </div>
                </div>

                {/* Card 4: Units Sold Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Total Units Sold</span>
                    <Flame size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {totalReportUnitsSold} <span className="text-xs text-neutral-400 font-normal">units</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Across {products.length} product{products.length !== 1 ? "s" : ""}
                  </div>
                </div>

              </div>

              {/* REPORT SECTION 1: TOP SELLING ITEMS */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden space-y-4 p-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <Flame size={18} className="text-amber-400" />
                    <div>
                      <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                        Top Products by Sales
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Ranked by real units sold from completed orders
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Top {topSellingItems.length} Products</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold text-right">Units Sold</th>
                        <th className="py-3 px-4 font-semibold text-right">Gross Revenue</th>
                        <th className="py-3 px-4 font-semibold text-right">Orders</th>
                        <th className="py-3 px-4 text-right font-semibold">Live Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {topSellingItems.map((item, idx) => {
                        const img = getImageUrl(item.product.colors[0]?.images[0] || item.product.colors[0]?.swatchImage);
                        return (
                          <tr key={item.product.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-400">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                idx === 0 ? "bg-amber-500/20 text-amber-300 font-bold" : idx === 1 ? "bg-neutral-700 text-white" : idx === 2 ? "bg-neutral-800 text-neutral-300" : "text-neutral-500"
                              }`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={item.product.name}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                                    }}
                                    className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0 border border-neutral-700"
                                  />
                                ) : (
                                  <div className="w-10 h-12 bg-neutral-800 rounded shrink-0 border border-neutral-700 flex items-center justify-center text-neutral-600 text-[9px]">IMG</div>
                                )}
                                <div>
                                  <div className="font-serif text-white font-medium text-[13px]">{item.product.name}</div>
                                  <div className="font-mono text-[10px] text-neutral-500">ID: {item.product.id} • {formatPrice(item.product.priceAUD)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-sans text-neutral-300">
                              <span className="bg-neutral-800 px-2 py-0.5 rounded text-[11px]">{item.product.category}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                              {item.unitsSold} <span className="text-[10px] text-neutral-400 font-normal">units</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                              {formatPrice(item.grossRevenueAUD)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                              {item.orderCount}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/product/${item.product.id}`}
                                target="_blank"
                                className="inline-flex items-center space-x-1 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded text-[11px] transition-colors"
                              >
                                <span>View</span>
                                <ExternalLink size={11} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REPORT SECTION 2: PRODUCT ENGAGEMENT (real views, clicks, add-to-bag from DB) */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden space-y-4 p-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <MousePointerClick size={18} className="text-purple-400" />
                    <div>
                      <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                        Product Engagement
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Real page views, product clicks, and add-to-bag events recorded from customer sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-neutral-400 mr-1 hidden sm:inline">Sort:</span>
                    <button
                      onClick={() => setEngagementSort("views")}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                        engagementSort === "views"
                          ? "bg-white text-black font-bold"
                          : "bg-neutral-800 text-neutral-300 hover:text-white"
                      }`}
                    >
                      Most Viewed
                    </button>
                    <button
                      onClick={() => setEngagementSort("clicks")}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                        engagementSort === "clicks"
                          ? "bg-purple-600 text-white font-bold"
                          : "bg-neutral-800 text-neutral-300 hover:text-white"
                      }`}
                    >
                      Most Clicked
                    </button>
                    <button
                      onClick={() => setEngagementSort("addToBag")}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                        engagementSort === "addToBag"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-neutral-800 text-neutral-300 hover:text-white"
                      }`}
                    >
                      Most Added
                    </button>
                  </div>
                </div>

                {Object.keys(analyticsMap).length === 0 ? (
                  <div className="py-10 text-center text-neutral-500 text-sm font-mono">
                    <MousePointerClick size={24} className="mx-auto mb-3 opacity-40" />
                    <p>No engagement data yet.</p>
                    <p className="text-[11px] mt-1 text-neutral-600">
                      Data will appear here once customers start visiting product pages.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                        <tr>
                          <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                          <th className="py-3 px-4 font-semibold">Product</th>
                          <th
                            className={`py-3 px-4 font-semibold text-right cursor-pointer transition-colors ${
                              engagementSort === "views" ? "text-white underline underline-offset-4 font-bold" : "hover:text-neutral-200"
                            }`}
                            onClick={() => setEngagementSort("views")}
                          >
                            Page Views {engagementSort === "views" ? "▼" : ""}
                          </th>
                          <th
                            className={`py-3 px-4 font-semibold text-right cursor-pointer transition-colors ${
                              engagementSort === "clicks" ? "text-purple-400 underline underline-offset-4 font-bold" : "hover:text-purple-300"
                            }`}
                            onClick={() => setEngagementSort("clicks")}
                          >
                            Clicks {engagementSort === "clicks" ? "▼" : ""}
                          </th>
                          <th
                            className={`py-3 px-4 font-semibold text-right cursor-pointer transition-colors ${
                              engagementSort === "addToBag" ? "text-emerald-400 underline underline-offset-4 font-bold" : "hover:text-emerald-300"
                            }`}
                            onClick={() => setEngagementSort("addToBag")}
                          >
                            Add to Bag {engagementSort === "addToBag" ? "▼" : ""}
                          </th>
                          <th className="py-3 px-4 font-semibold text-center">Conversion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {[...products]
                          .map(prod => ({
                            product: prod,
                            stats: analyticsMap[prod.id] || { views: 0, clicks: 0, addToBag: 0 },
                          }))
                          .sort((a, b) => {
                            if (engagementSort === "clicks") return b.stats.clicks - a.stats.clicks;
                            if (engagementSort === "addToBag") return b.stats.addToBag - a.stats.addToBag;
                            return b.stats.views - a.stats.views;
                          })
                          .map((item, idx) => {
                            const img = item.product.colors[0]?.images[0] || item.product.colors[0]?.swatchImage;
                            const convPct = item.stats.views > 0
                              ? ((item.stats.addToBag / item.stats.views) * 100).toFixed(1)
                              : "0.0";
                            return (
                              <tr key={item.product.id} className="hover:bg-neutral-800/40 transition-colors">
                                <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-400">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    idx === 0 ? "bg-purple-500/20 text-purple-300 font-bold" : idx === 1 ? "bg-neutral-700 text-white" : idx === 2 ? "bg-neutral-800 text-neutral-300" : "text-neutral-500"
                                  }`}>
                                    #{idx + 1}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center space-x-3">
                                    {img ? (
                                      <img src={img} alt={item.product.name} className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0 border border-neutral-700" />
                                    ) : (
                                      <div className="w-10 h-12 bg-neutral-800 rounded shrink-0 border border-neutral-700 flex items-center justify-center text-neutral-600 text-[9px]">IMG</div>
                                    )}
                                    <div>
                                      <div className="font-serif text-white font-medium text-[13px]">{item.product.name}</div>
                                      <div className="font-mono text-[10px] text-neutral-500">{item.product.category} • {formatPrice(item.product.priceAUD)}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                                  {item.stats.views.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono font-semibold text-purple-400">
                                  {item.stats.clicks.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                                  {item.stats.addToBag.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono text-[11px]">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    Number(convPct) > 5 ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : Number(convPct) > 0 ? "bg-purple-950 text-purple-300 border border-purple-800"
                                    : "bg-neutral-800 text-neutral-500"
                                  }`}>
                                    {convPct}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* REPORT SECTION 4: CATEGORY PERFORMANCE BREAKDOWN */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <Layers size={18} className="text-neutral-300" />
                    <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                      Category Engagement & Revenue Distribution
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat, i) => {
                    const catItems = productAnalytics.filter((p) => p.product.category === cat.title);
                    const catUnits = catItems.reduce((acc, p) => acc + p.unitsSold, 0);
                    const catRevenue = catItems.reduce((acc, p) => acc + p.grossRevenueAUD, 0);
                    const revenueShare = totalReportRevenueAUD > 0
                      ? Number(((catRevenue / totalReportRevenueAUD) * 100).toFixed(1))
                      : 0;

                    return (
                      <div key={cat.id} className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                          />
                          <div>
                            <div className="font-serif text-sm font-bold text-white uppercase">{cat.title}</div>
                            <div className="text-[10px] font-mono text-neutral-400">{catItems.length} Products</div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between text-neutral-400">
                            <span>Revenue Share:</span>
                            <span className="text-white font-bold">{revenueShare}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-white h-full rounded-full"
                              style={{ width: `${revenueShare}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-900 flex justify-between text-[11px] font-mono">
                          <div>
                            <span className="text-neutral-500 block">Units Sold:</span>
                            <span className="text-neutral-200 font-bold">{catUnits}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-neutral-500 block">Gross Revenue:</span>
                            <span className="text-emerald-400 font-bold">{formatPrice(catRevenue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* HOMEPAGE CONTENT TAB (Videos & Community Spotlight) */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              {/* Sub navigation for Homepage management */}
              <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
                <button
                  onClick={() => setHomepageSubTab("videos")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                    homepageSubTab === "videos"
                      ? "bg-white text-black font-bold shadow"
                      : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Video size={14} />
                  <span>Hero & Editorial Videos</span>
                </button>

                <button
                  onClick={() => setHomepageSubTab("spotlight")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                    homepageSubTab === "spotlight"
                      ? "bg-white text-black font-bold shadow"
                      : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Camera size={14} />
                  <span>Community Spotlight</span>
                </button>
              </div>

              {homepageSubTab === "videos" ? (
                <HomepageVideoManager />
              ) : (
                <CommunitySpotlightManager />
              )}
            </div>
          )}

          {/* MANAGE USERS TAB */}
          {activeTab === "users" && (
            <UserManager />
          )}

        </div>
      </main>

      {/* FULL PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl max-h-[92vh] rounded-lg shadow-2xl flex flex-col animate-scaleUp text-neutral-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 rounded-t-lg">
              <div>
                <h3 className="text-base font-serif font-bold tracking-wider uppercase text-white">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Luxury Product"}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure color variations (up to 6 images/color), sizes XS-2XL, descriptions, and shipping points.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Row 1: Basic Information & Dynamic Regional Pricing */}
              {(() => {
                const targetCountries = productForm.targetCountries && productForm.targetCountries.length > 0
                  ? productForm.targetCountries
                  : ["Australia", "Sri Lanka"];
                const isAU = targetCountries.includes("Australia");
                const isSL = targetCountries.includes("Sri Lanka");
                const both = isAU && isSL;

                return (
                  <div className={`grid grid-cols-1 ${both ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
                    <div>
                      <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                        Product ID / SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.id || ""}
                        onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                        placeholder="e.g. prod-101"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white font-mono focus:border-neutral-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Relaxed Twill TENCEL™ Shirt"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                      />
                    </div>

                    {/* Australia Price field — rendered when Australia or both selected (or fallback if neither) */}
                    {(isAU || (!isAU && !isSL)) && (
                      <div>
                        <label className="flex items-center justify-between uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                          <span className="flex items-center space-x-1">
                            <span>🇦🇺 Price (AUD $) *</span>
                          </span>
                          <span className="text-[10px] font-mono text-blue-400 font-normal">AUD</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="any"
                          value={productForm.priceAUD || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setProductForm((prev) => ({
                              ...prev,
                              priceAUD: val,
                              // If SL is also selected and user hasn't typed custom priceLKR, suggest conversion
                              priceLKR: prev.priceLKR && prev.priceLKR > 0 ? prev.priceLKR : Math.round(val * 210.5),
                            }));
                          }}
                          placeholder="220"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Sri Lanka Price field — rendered when Sri Lanka or both selected */}
                    {isSL && (
                      <div>
                        <label className="flex items-center justify-between uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                          <span className="flex items-center space-x-1">
                            <span>🇱🇰 Price (LKR Rs) *</span>
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-normal">LKR</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="any"
                          value={productForm.priceLKR || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setProductForm((prev) => ({
                              ...prev,
                              priceLKR: val,
                              // If AU is not selected, automatically set priceAUD for database schema requirement
                              priceAUD: (!isAU || !prev.priceAUD) ? Math.round((val / 210.5) * 100) / 100 : prev.priceAUD,
                            }));
                          }}
                          placeholder="46000"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Row 2: Category, Badge & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-800/80">
                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={categorySearchQuery || productForm.category || ""}
                      onFocus={() => {
                        setCategorySearchQuery(productForm.category || "");
                        setShowCategoryDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
                      onChange={(e) => {
                        setCategorySearchQuery(e.target.value);
                        setShowCategoryDropdown(true);
                      }}
                      placeholder="Search category..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                    />
                    {showCategoryDropdown && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded shadow-xl max-h-48 overflow-y-auto">
                        {categories
                          .filter((c) =>
                            !categorySearchQuery ||
                            c.title.toLowerCase().includes(categorySearchQuery.toLowerCase())
                          )
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={() => {
                                setProductForm({ ...productForm, category: c.title });
                                setCategorySearchQuery(c.title);
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 text-xs hover:bg-neutral-800 transition-colors ${
                                productForm.category === c.title
                                  ? "text-white font-semibold bg-neutral-800"
                                  : "text-neutral-300"
                              }`}
                            >
                              {c.title}
                            </button>
                          ))}
                        {categories.filter((c) =>
                          !categorySearchQuery ||
                          c.title.toLowerCase().includes(categorySearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-xs text-neutral-500">No categories found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={productForm.badge || ""}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. New Arrival, Bestseller"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={productForm.inStock ?? true}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-white focus:ring-0"
                  />
                  <label htmlFor="inStockCheck" className="uppercase tracking-wider text-[11px] font-semibold text-neutral-300 cursor-pointer">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="preOrderCheck"
                    checked={productForm.preOrder ?? false}
                    onChange={(e) => setProductForm({ ...productForm, preOrder: e.target.checked })}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-white focus:ring-0"
                  />
                  <label htmlFor="preOrderCheck" className="uppercase tracking-wider text-[11px] font-semibold text-neutral-300 cursor-pointer">
                    Pre-Order Available
                  </label>
                </div>
              </div>

              {/* Display Countries / Target Regions (Australia & Sri Lanka) */}
              <div className="pt-3 border-t border-neutral-800/80 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                  <div>
                    <label className="block uppercase tracking-wider text-[11px] font-bold text-white">
                      Display Store Countries (Target Audience) *
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Choose which store country this product will be displayed in. Select single or both.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 w-fit">
                    {(productForm.targetCountries || ["Australia", "Sri Lanka"]).length === 2
                      ? "🌏 Displaying in Both Countries"
                      : (productForm.targetCountries || ["Australia", "Sri Lanka"])[0] === "Sri Lanka"
                      ? "🇱🇰 Sri Lanka Boutique Only"
                      : "🇦🇺 Australia Boutique Only"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sri Lanka Button */}
                  {(() => {
                    const countries = productForm.targetCountries || ["Australia", "Sri Lanka"];
                    const isSL = countries.includes("Sri Lanka");
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          let next: string[];
                          if (isSL) {
                            next = countries.filter((c) => c !== "Sri Lanka");
                            if (next.length === 0) next = ["Australia"];
                          } else {
                            next = [...countries, "Sri Lanka"];
                          }
                          setProductForm({ ...productForm, targetCountries: next });
                        }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-md border text-xs font-semibold tracking-wider uppercase transition-all ${
                          isSL
                            ? "bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span className="text-base">🇱🇰</span>
                        <span>Sri Lanka</span>
                        {isSL ? (
                          <CheckCircle size={14} className="text-amber-400 ml-1" />
                        ) : (
                          <span className="text-[10px] text-neutral-500 ml-1">(Click to add)</span>
                        )}
                      </button>
                    );
                  })()}

                  {/* Australia Button */}
                  {(() => {
                    const countries = productForm.targetCountries || ["Australia", "Sri Lanka"];
                    const isAU = countries.includes("Australia");
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          let next: string[];
                          if (isAU) {
                            next = countries.filter((c) => c !== "Australia");
                            if (next.length === 0) next = ["Sri Lanka"];
                          } else {
                            next = [...countries, "Australia"];
                          }
                          setProductForm({ ...productForm, targetCountries: next });
                        }}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-md border text-xs font-semibold tracking-wider uppercase transition-all ${
                          isAU
                            ? "bg-blue-950/80 border-blue-500 text-blue-200 shadow-md shadow-blue-950/40"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span className="text-base">🇦🇺</span>
                        <span>Australia</span>
                        {isAU ? (
                          <CheckCircle size={14} className="text-blue-400 ml-1" />
                        ) : (
                          <span className="text-[10px] text-neutral-500 ml-1">(Click to add)</span>
                        )}
                      </button>
                    );
                  })()}

                  {/* Select Both Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm({ ...productForm, targetCountries: ["Australia", "Sri Lanka"] });
                    }}
                    className={`px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded border transition-colors ${
                      (productForm.targetCountries || ["Australia", "Sri Lanka"]).length === 2
                        ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                        : "border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 bg-neutral-900"
                    }`}
                  >
                    Select Both (All Regions)
                  </button>
                </div>

                {/* Dynamic Pricing Indicator */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/70 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
                  <span>Price Fields Required:</span>
                  <span className="text-white font-semibold">
                    {((productForm.targetCountries || ["Australia", "Sri Lanka"]).length === 2)
                      ? "🇦🇺 AUD + 🇱🇰 LKR (2 Fields Required)"
                      : (productForm.targetCountries || ["Australia", "Sri Lanka"])[0] === "Sri Lanka"
                      ? "🇱🇰 LKR Price Required (1 Field)"
                      : "🇦🇺 AUD Price Required (1 Field)"}
                  </span>
                </div>
              </div>

              {/* Sizes Selector (XS, S, M, L, XL, 2XL) */}
              <div className="pt-3 border-t border-neutral-800/80">
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-2">
                  Available Sizes (XS, S, M, L, XL, 2XL)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((size) => {
                    const isSelected = productForm.sizes?.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => {
                          const currentSizes = productForm.sizes || [];
                          if (isSelected) {
                            setProductForm({
                              ...productForm,
                              sizes: currentSizes.filter((s) => s !== size),
                            });
                          } else {
                            setProductForm({
                              ...productForm,
                              sizes: [...currentSizes, size],
                            });
                          }
                        }}
                        className={`px-4 py-2 font-mono text-xs font-semibold rounded border transition-all ${
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLOR VARIANTS & UP TO 6 IMAGES PER COLOR */}
              <div className="pt-3 border-t border-neutral-800/80 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="uppercase tracking-wider text-xs font-bold text-white block">
                      Color Variants & Multi-Image Gallery
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Each color variant supports a color name, swatch thumbnail, and up to 6 high-res product photos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorVariant}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded text-xs flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Color</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {productForm.colors?.map((color, colorIdx) => (
                    <div
                      key={color.id || colorIdx}
                      className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <input
                            type="color"
                            value={color.hex || "#111111"}
                            onChange={(e) => handleUpdateColorField(colorIdx, "hex", e.target.value)}
                            className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                            title="Select Color Code"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Color Name (e.g. Black, Bone White)"
                            value={color.name}
                            onChange={(e) => handleUpdateColorField(colorIdx, "name", e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
                          />
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <span className="text-[11px] font-mono text-neutral-400">
                            {color.images?.length || 0} / 6 images
                          </span>
                          {productForm.colors!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColorVariant(colorIdx)}
                              className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900"
                              title="Remove this color variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Swatch Thumbnail File Upload */}
                      <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-300">
                            Swatch Thumbnail Image (Saved to uploads/)
                          </label>
                          <span className="text-[10px] text-neutral-400">File upload</span>
                        </div>

                        {/* Hidden file input for swatch */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => {
                            swatchFileInputs.current[colorIdx] = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadSwatch(colorIdx, file);
                          }}
                          className="hidden"
                        />

                        <div className="flex items-center gap-3">
                          {color.swatchImage ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative w-12 h-12 rounded border border-neutral-700 overflow-hidden bg-neutral-950 flex-shrink-0">
                                <img
                                  src={getImageUrl(color.swatchImage)}
                                  alt="Swatch preview"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-mono text-neutral-300 truncate" title={color.swatchImage}>
                                  {color.swatchImage}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    type="button"
                                    disabled={uploadingSwatchIdx === colorIdx}
                                    onClick={() => swatchFileInputs.current[colorIdx]?.click()}
                                    className="text-[10px] font-medium text-amber-400 hover:text-amber-300 underline"
                                  >
                                    {uploadingSwatchIdx === colorIdx ? "Uploading..." : "Replace File"}
                                  </button>
                                  <span className="text-neutral-600">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateColorField(colorIdx, "swatchImage", "")}
                                    className="text-[10px] font-medium text-red-400 hover:text-red-300 underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={uploadingSwatchIdx === colorIdx}
                              onClick={() => swatchFileInputs.current[colorIdx]?.click()}
                              className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded border border-neutral-700 text-xs transition-colors"
                            >
                              {uploadingSwatchIdx === colorIdx ? (
                                <>
                                  <RefreshCw size={13} className="animate-spin text-amber-400" />
                                  <span>Uploading Swatch...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={13} className="text-amber-400" />
                                  <span>Upload Swatch Image File</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 6 Images Grid & File Upload for this Color */}
                      <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-300">
                              Product Photos for {color.name || "Color"} (Up to 6 images)
                            </label>
                            <p className="text-[10px] text-neutral-400">
                              Upload images directly from your computer to the server's uploads folder.
                            </p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {color.images?.length || 0} / 6 Photos
                          </span>
                        </div>

                        {/* Hidden multi-file input */}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          ref={(el) => {
                            photosFileInputs.current[colorIdx] = el;
                          }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleUploadColorPhotos(colorIdx, e.target.files);
                            }
                          }}
                          className="hidden"
                        />
                        
                        {/* Image Thumbnails Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                          {color.images?.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative aspect-[3/4] bg-neutral-950 rounded overflow-hidden group border border-neutral-800">
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={`Angle ${imgIdx + 1}`}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/cat_shop_all.jpg';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromColor(colorIdx, imgIdx)}
                                  className="p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                                  title="Delete Image"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-black/80 text-[9px] font-mono px-1.5 py-0.5 rounded text-white">
                                #{imgIdx + 1}
                              </span>
                            </div>
                          ))}

                          {/* Upload Box Slot if under 6 images */}
                          {(color.images?.length || 0) < 6 && (
                            <button
                              type="button"
                              disabled={uploadingPhotosIdx === colorIdx}
                              onClick={() => photosFileInputs.current[colorIdx]?.click()}
                              className="aspect-[3/4] border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded flex flex-col items-center justify-center p-2 text-center bg-neutral-950/50 hover:bg-neutral-950 transition-colors text-neutral-400 hover:text-white"
                            >
                              {uploadingPhotosIdx === colorIdx ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <RefreshCw size={18} className="animate-spin text-amber-400" />
                                  <span className="text-[10px] font-mono text-amber-400">Saving...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center space-y-1.5">
                                  <div className="p-2 rounded-full bg-neutral-800">
                                    <Upload size={14} className="text-white" />
                                  </div>
                                  <span className="text-[10px] font-medium leading-tight">
                                    Upload Photo
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-mono">
                                    (6 max)
                                  </span>
                                </div>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Actions bar: File upload button + optional external link input */}
                        {(color.images?.length || 0) < 6 && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-neutral-800">
                            <button
                              type="button"
                              disabled={uploadingPhotosIdx === colorIdx}
                              onClick={() => photosFileInputs.current[colorIdx]?.click()}
                              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold px-4 py-2 rounded text-xs flex items-center justify-center space-x-2 transition-colors"
                            >
                              {uploadingPhotosIdx === colorIdx ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin text-black" />
                                  <span>Uploading Files to uploads/...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={14} />
                                  <span>Choose File(s) to Upload</span>
                                </>
                              )}
                            </button>

                            <span className="text-neutral-400 text-center text-[10px] font-mono sm:px-1">or URL:</span>

                            <div className="flex-1 flex items-center space-x-1">
                              <input
                                type="text"
                                id={`new-img-input-${colorIdx}`}
                                placeholder="Paste image URL (optional fallback)..."
                                className="flex-1 bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) {
                                      handleAddImageToColor(colorIdx, val);
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`new-img-input-${colorIdx}`) as HTMLInputElement;
                                  if (input && input.value) {
                                    handleAddImageToColor(colorIdx, input.value);
                                    input.value = "";
                                  }
                                }}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white px-2.5 py-1.5 rounded text-xs font-medium"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION SECTION (Desc Header, Description, Fit, Fabric, Details) */}
              <div className="pt-3 border-t border-neutral-800/80 space-y-4">
                <div>
                  <label className="uppercase tracking-wider text-xs font-bold text-white block">
                    Product Description Section
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    Structured text fields for product storytelling, tailoring fit, fabric composition, and details.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-400 mb-1">
                      Desc Header *
                    </label>
                    <input
                      type="text"
                      value={productForm.descriptionSection?.header || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          descriptionSection: {
                            ...productForm.descriptionSection!,
                            header: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Relaxed Twill TENCEL™ Shirt"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-400 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.descriptionSection?.description || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          descriptionSection: {
                            ...productForm.descriptionSection!,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Cut for a relaxed boxy drape, crafted from sustainable botanical twill..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-400 mb-1">
                        Fit
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.descriptionSection?.fit || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            descriptionSection: {
                              ...productForm.descriptionSection!,
                              fit: e.target.value,
                            },
                          })
                        }
                        placeholder="Boxy relaxed drape. Fits true to size for an oversized look."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:border-neutral-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-400 mb-1">
                        Fabric
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.descriptionSection?.fabric || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            descriptionSection: {
                              ...productForm.descriptionSection!,
                              fabric: e.target.value,
                            },
                          })
                        }
                        placeholder="100% sustainable TENCEL™ Lyocell, 185 GSM twill weave."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:border-neutral-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[10px] font-semibold text-neutral-400 mb-1">
                        Details
                      </label>
                      <textarea
                        rows={2}
                        value={productForm.descriptionSection?.details || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            descriptionSection: {
                              ...productForm.descriptionSection!,
                              details: e.target.value,
                            },
                          })
                        }
                        placeholder="Mother-of-pearl buttons, single chest pocket, split side seams."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white focus:border-neutral-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SHIPPING SECTION (Dynamic Point-by-Point inputs) */}
              <div className="pt-3 border-t border-neutral-800/80 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="uppercase tracking-wider text-xs font-bold text-white block">
                      Shipping Section & Point-by-Point Bullet Inputs
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Enter each shipping statement as an individual input point (Matching shipping UI).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddShippingSection}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded text-xs flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Shipping Sub-Section</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {productForm.shippingSections?.map((section, secIdx) => (
                    <div
                      key={secIdx}
                      className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 max-w-sm">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">Header:</span>
                          <input
                            type="text"
                            value={section.header}
                            onChange={(e) => handleUpdateShippingHeader(secIdx, e.target.value)}
                            placeholder="e.g. Shipping, Australia"
                            className="bg-neutral-900 border border-neutral-800 rounded px-3 py-1 text-xs text-white focus:outline-none font-serif"
                          />
                        </div>
                        {productForm.shippingSections!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveShippingSection(secIdx)}
                            className="p-1 text-neutral-500 hover:text-red-400"
                            title="Delete section"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Individual Points Inputs */}
                      <div className="space-y-2 pl-2 border-l-2 border-neutral-800">
                        {section.points.map((point, ptIdx) => (
                          <div key={ptIdx} className="flex items-center space-x-2">
                            <span className="text-neutral-500 font-mono text-[11px]">•</span>
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => handleUpdateShippingPoint(secIdx, ptIdx, e.target.value)}
                              placeholder={`Shipping point #${ptIdx + 1}...`}
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveShippingPoint(secIdx, ptIdx)}
                              className="p-1 text-neutral-500 hover:text-red-400"
                              title="Remove bullet point"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddShippingPoint(secIdx)}
                          className="mt-2 text-xs text-neutral-300 hover:text-white flex items-center space-x-1.5 py-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                        >
                          <Plus size={13} />
                          <span>+ Add Point</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-5 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded text-xs uppercase tracking-wider font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="bg-white text-black px-6 py-2.5 rounded text-xs uppercase tracking-wider font-bold hover:bg-neutral-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSavingProduct && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingProduct ? "Save Product Changes" : "Publish Product"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-lg shadow-2xl p-6 animate-scaleUp text-neutral-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                {editingCategory ? `Edit Category: ${editingCategory.title}` : "Add Category"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.title || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  placeholder="e.g. Tops & Shirts, Bottoms"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Button Text (Overlay Box)
                </label>
                <input
                  type="text"
                  value={categoryForm.buttonText || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, buttonText: e.target.value })}
                  placeholder="SHOP TOPS"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Card Banner Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="/images/cat_shop_tops.jpg or https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Shop Filter Route Link
                </label>
                <input
                  type="text"
                  value={categoryForm.link || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, link: e.target.value })}
                  placeholder="/shop?category=Shirts"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Relaxed silhouettes, botanical twills, and crisp cotton..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="bg-white text-black px-5 py-2 rounded font-bold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSavingCategory && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-lg shadow-2xl p-6 animate-scaleUp text-neutral-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                  Order {selectedOrder.id}
                </h3>
                <span className="text-neutral-400 font-mono text-[11px]">{selectedOrder.date}</span>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-3 rounded border border-neutral-800">
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block">Customer</span>
                  <span className="font-medium text-white block">{selectedOrder.customerName}</span>
                  <span className="text-neutral-400 text-[11px]">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block">Payment Method</span>
                  <span className="font-medium text-white block">{selectedOrder.paymentMethod}</span>
                  {selectedOrder.trackingNumber && (
                    <span className="text-emerald-400 font-mono text-[11px] block">
                      Track: {selectedOrder.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 uppercase text-[10px] block mb-1">Shipping Destination</span>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 space-y-1">
                  {selectedOrder.country && (
                    <div className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5">
                      <span>{selectedOrder.country === "Sri Lanka" ? "🇱🇰" : "🇦🇺"}</span>
                      <span>{selectedOrder.country} • {selectedOrder.district || "Standard District"}</span>
                    </div>
                  )}
                  <p className="text-neutral-300 font-mono text-[11px]">
                    {selectedOrder.shippingAddress}
                  </p>
                  {selectedOrder.customerPhone && (
                    <p className="text-neutral-400 text-[10px] font-mono">
                      Phone: {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 uppercase text-[10px] block mb-2">Line Items</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-neutral-950 p-2.5 rounded border border-neutral-800"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={item.image} alt={item.productName} className="w-10 h-12 object-cover rounded" />
                        <div>
                          <p className="font-serif text-white font-medium">{item.productName}</p>
                          <p className="text-neutral-400 font-mono text-[11px]">
                            Color: {item.color} • Size: {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-medium text-white">
                        {formatOrderPrice(item.priceAUD * item.quantity, selectedOrder.country, selectedOrder.shippingAddress)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800 font-serif text-sm">
                <span className="text-neutral-300 uppercase tracking-wider">Total Paid</span>
                <div className="text-right">
                  <div className="font-bold font-mono text-base text-white">
                    {formatOrderPrice(selectedOrder.totalAUD, selectedOrder.country, selectedOrder.shippingAddress)}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {isOrderSriLankan(selectedOrder) ? "🇱🇰 Sri Lanka (LKR)" : "🇦🇺 Australia (AUD)"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteOrder(selectedOrder.id);
                    setIsOrderModalOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                >
                  Delete Order
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-400">Change Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Order["status"];
                      handleUpdateOrderStatus(selectedOrder.id, newStatus);
                      setSelectedOrder({ ...selectedOrder, status: newStatus });
                    }}
                    className="bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REVIEW MODAL (With Photo/Video Upload simulation) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-lg shadow-2xl p-6 animate-scaleUp text-neutral-100 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                Add Customer Review with Media
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Target Product *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search product by name or SKU..."
                    value={reviewProductSearch}
                    onFocus={() => {
                      setShowReviewProductDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowReviewProductDropdown(false), 200)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReviewProductSearch(val);
                      setShowReviewProductDropdown(true);
                      if (!val.trim()) {
                        setSelectedProductForReview("");
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 pr-8 text-white focus:outline-none focus:border-neutral-500"
                  />
                  {reviewProductSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewProductSearch("");
                        setSelectedProductForReview("");
                        setShowReviewProductDropdown(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {showReviewProductDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded shadow-xl max-h-52 overflow-y-auto">
                      {allProducts
                        .filter((p) =>
                          !reviewProductSearch ||
                          p.name.toLowerCase().includes(reviewProductSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(reviewProductSearch.toLowerCase())
                        )
                        .map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => {
                              setSelectedProductForReview(p.id);
                              setReviewProductSearch(p.name);
                              setShowReviewProductDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-xs transition-colors hover:bg-neutral-800 ${
                              selectedProductForReview === p.id
                                ? "bg-neutral-800 text-white font-semibold"
                                : "text-neutral-300"
                            }`}
                          >
                            <span className="block font-medium">{p.name}</span>
                            <span className="block text-[10px] text-neutral-500 font-mono">{p.id} · {p.category}</span>
                          </button>
                        ))}
                      {allProducts.filter((p) =>
                        !reviewProductSearch ||
                        p.name.toLowerCase().includes(reviewProductSearch.toLowerCase()) ||
                        p.id.toLowerCase().includes(reviewProductSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-xs text-neutral-500">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                    placeholder="e.g. Darius H."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                  >
                    <option value="5">5 Stars - Outstanding</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                    Purchased Size
                  </label>
                  <select
                    value={reviewForm.itemSize}
                    onChange={(e) => setReviewForm({ ...reviewForm, itemSize: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                  >
                    {ALL_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                    Purchased Color
                  </label>
                  <input
                    type="text"
                    value={reviewForm.itemColor}
                    onChange={(e) => setReviewForm({ ...reviewForm, itemColor: e.target.value })}
                    placeholder="Black"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="e.g. Loved the shirt!"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1">
                  Review Comment *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Loved the shirt! Has a nice silk like feel. Very light weight especially for summer weather..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Photo or Video media upload link */}
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-2">
                <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300">
                  Attach Photo or Video Media (URL)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={reviewForm.mediaType}
                    onChange={(e) => setReviewForm({ ...reviewForm, mediaType: e.target.value as any })}
                    className="bg-neutral-900 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Paste Image or MP4 video URL..."
                    value={reviewForm.mediaUrl}
                    onChange={(e) => setReviewForm({ ...reviewForm, mediaUrl: e.target.value })}
                    className="col-span-2 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="bg-white text-black px-5 py-2 rounded font-bold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSavingReview && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isSavingReview ? "Saving..." : "Post Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW LIGHTBOX MODAL */}
      {mediaPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex justify-center items-center p-4">
          <div className="relative max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden animate-scaleUp">
            <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center text-xs text-neutral-300">
              <span>{mediaPreviewModal.title || "Customer Media Preview"}</span>
              <button onClick={() => setMediaPreviewModal(null)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black min-h-[300px]">
              {mediaPreviewModal.type === "video" ? (
                <video src={mediaPreviewModal.url} controls autoPlay className="max-h-[70vh] w-auto rounded shadow" />
              ) : (
                <img src={mediaPreviewModal.url} alt="Customer attached preview" className="max-h-[70vh] w-auto object-contain rounded" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL ADMIN TOAST NOTIFICATION */}
      {toast && toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-md shadow-2xl border flex items-center space-x-3 transition-all duration-300 animate-slideUp ${
            toast.type === "success"
              ? "bg-neutral-900 border-emerald-500/70 text-white"
              : toast.type === "error"
              ? "bg-neutral-900 border-red-500/70 text-white"
              : "bg-neutral-900 border-neutral-700 text-white"
          }`}
        >
          <div className="shrink-0">
            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 text-xs font-sans font-medium tracking-wide">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white text-xs p-1 ml-2 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
