"use client";

import React, { useState } from "react";
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
} from "lucide-react";

const ALL_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "2XL"];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    addReview,
    updateReviewStatus,
    deleteReview,
    resetStoreData,
  } = useStore();
  const { formatPrice } = useCurrency();

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "categories" | "products" | "reviews" | "reports">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Reports state
  const [reportTimeframe, setReportTimeframe] = useState<"7d" | "30d" | "all">("30d");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");

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
    category: "Shirts",
    badge: "New Arrival",
    inStock: true,
    preOrder: false,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [
      {
        id: "col-1",
        name: "Black",
        hex: "#111111",
        swatchImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop",
        ],
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

  // Open Product Modal for Create
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    const newId = "prod-" + (products.length + 1);
    setProductForm({
      id: newId,
      name: "",
      priceAUD: 220,
      category: categories[1]?.title || "Shirts",
      badge: "New Arrival",
      inStock: true,
      preOrder: false,
      sizes: ["XS", "S", "M", "L", "XL", "2XL"],
      colors: [
        {
          id: "col-" + Date.now(),
          name: "Black",
          hex: "#111111",
          swatchImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop",
          images: [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop",
          ],
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
    setProductForm(JSON.parse(JSON.stringify(prod)));
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.id) {
      alert("Please provide a Product ID and Name");
      return;
    }

    const finalProduct: FullProduct = {
      id: productForm.id!,
      name: productForm.name!,
      priceAUD: Number(productForm.priceAUD) || 0,
      category: productForm.category || "Shirts",
      badge: productForm.badge || undefined,
      inStock: productForm.inStock ?? true,
      preOrder: productForm.preOrder ?? false,
      sizes: productForm.sizes && productForm.sizes.length > 0 ? productForm.sizes : ["M", "L"],
      colors: productForm.colors && productForm.colors.length > 0 ? productForm.colors : [
        {
          id: "col-1",
          name: "Standard",
          swatchImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300",
          images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000"],
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
      updateProduct(finalProduct);
    } else {
      addProduct(finalProduct);
    }

    setIsProductModalOpen(false);
  };

  // Color Variant Management within Product Form
  const handleAddColorVariant = () => {
    const newColor: ProductColorVariant = {
      id: "col-" + Date.now(),
      name: "New Color",
      hex: "#333333",
      swatchImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
      ],
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
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title) return;
    const catId = editingCategory ? editingCategory.id : "cat-" + Date.now();
    const finalCat: Category = {
      id: catId,
      title: categoryForm.title!,
      buttonText: categoryForm.buttonText || "SHOP NOW",
      image: categoryForm.image || "/images/cat_shop_all.jpg",
      link: categoryForm.link || "/shop",
      description: categoryForm.description || "",
      itemCount: products.filter((p) => p.category === categoryForm.title).length,
    };

    if (editingCategory) {
      updateCategory(finalCat);
    } else {
      addCategory(finalCat);
    }
    setIsCategoryModalOpen(false);
  };

  // Review CRUD
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview || !reviewForm.reviewerName || !reviewForm.comment) {
      alert("Please select product, reviewer name, and comment");
      return;
    }

    addReview(selectedProductForReview, {
      reviewerName: reviewForm.reviewerName,
      verified: reviewForm.verified,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
      itemSize: reviewForm.itemSize,
      itemColor: reviewForm.itemColor,
      mediaType: reviewForm.mediaUrl ? reviewForm.mediaType : undefined,
      mediaUrl: reviewForm.mediaUrl || undefined,
      mediaThumbnail: reviewForm.mediaUrl ? reviewForm.mediaUrl : undefined,
    });

    setIsReviewModalOpen(false);
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
  };

  // Calculations for Dashboard
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

  // Analytics & Reports Calculations
  const timeframeMultiplier = reportTimeframe === "7d" ? 0.35 : reportTimeframe === "30d" ? 1 : 2.6;

  const productAnalytics = products.map((prod, index) => {
    const baseViews = Math.round((2850 - index * 240 + (prod.reviews?.length || 0) * 160) * timeframeMultiplier);
    const views = Math.max(baseViews, 320);
    const uniqueVisitors = Math.round(views * 0.76);
    const ctr = Number((19.2 + (index % 4) * 2.5).toFixed(1));
    const clicks = Math.round((views * ctr) / 100);
    const quickAddClicks = Math.round(clicks * 0.35);
    const addToBagClicks = Math.round(clicks * 0.48);

    const unitsFromOrders = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, ord) => {
        const item = ord.items.find((i) => i.productId === prod.id);
        return sum + (item ? item.quantity : 0);
      }, 0);
    const unitsSold = Math.round((unitsFromOrders + 24 - index * 2) * (reportTimeframe === "7d" ? 0.4 : 1));
    const finalUnitsSold = Math.max(unitsSold, 3);
    const grossRevenueAUD = finalUnitsSold * prod.priceAUD;
    const remainingStock = prod.inStock ? 52 - (index * 4) % 20 : 0;
    const sellThroughRate = Number(((finalUnitsSold / (finalUnitsSold + remainingStock || 1)) * 100).toFixed(1));
    const conversionRate = Number(((finalUnitsSold / clicks) * 100).toFixed(1));

    return {
      product: prod,
      views,
      uniqueVisitors,
      clicks,
      ctr,
      quickAddClicks,
      addToBagClicks,
      unitsSold: finalUnitsSold,
      grossRevenueAUD,
      conversionRate,
      remainingStock,
      sellThroughRate,
      trend: index % 2 === 0 ? +16.4 : +9.2,
    };
  });

  // 1. Most Viewed Items
  const mostViewedItems = [...productAnalytics].sort((a, b) => b.views - a.views);

  // 2. Most Clicked Items
  const mostClickedItems = [...productAnalytics].sort((a, b) => b.clicks - a.clicks);

  // 3. Top Selling Items
  const topSellingItems = [...productAnalytics].sort((a, b) => b.unitsSold - a.unitsSold);

  // Summary Totals
  const totalReportViews = productAnalytics.reduce((acc, p) => acc + p.views, 0);
  const totalReportClicks = productAnalytics.reduce((acc, p) => acc + p.clicks, 0);
  const totalReportUnitsSold = productAnalytics.reduce((acc, p) => acc + p.unitsSold, 0);
  const totalReportRevenueAUD = productAnalytics.reduce((acc, p) => acc + p.grossRevenueAUD, 0);
  const avgStoreCTR = Number(((totalReportClicks / (totalReportViews || 1)) * 100).toFixed(1));

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Rank", "Product Name", "SKU", "Category", "Price (AUD)", "Views", "Unique Visitors", "Clicks", "CTR (%)", "Units Sold", "Gross Revenue (AUD)", "Sell-Through (%)"];
    const rows = topSellingItems.map((item, idx) => [
      idx + 1,
      `"${item.product.name.replace(/"/g, '""')}"`,
      item.product.id,
      item.product.category,
      item.product.priceAUD,
      item.views,
      item.uniqueVisitors,
      item.clicks,
      `${item.ctr}%`,
      item.unitsSold,
      item.grossRevenueAUD,
      `${item.sellThroughRate}%`,
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
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Total Sales</span>
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white">
                    {formatPrice(totalRevenue)}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center space-x-1">
                    <TrendingUp size={12} />
                    <span>+18.4% from last month</span>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Total Orders</span>
                    <ShoppingBag size={18} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">
                    <span className="text-yellow-400 font-medium">{pendingOrdersCount} requiring fulfillment</span>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Active Products</span>
                    <Shirt size={18} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white">
                    {products.length}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">
                    <span>Across {categories.length} categories</span>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs uppercase tracking-wider font-medium">Average Rating</span>
                    <Star size={18} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-white">
                    {averageStoreRating} <span className="text-sm text-neutral-500 font-normal">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">
                    <span>{allReviewsList.length} verified customer reviews</span>
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
                            <td className="py-3 text-neutral-300">{order.customerName}</td>
                            <td className="py-3 font-mono text-neutral-200">{formatPrice(order.totalAUD)}</td>
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
                        setSelectedProductForReview(products[0]?.id || "");
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
                            src={prod.colors[0]?.images[0] || prod.colors[0]?.swatchImage}
                            alt={prod.name}
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

                <div className="flex items-center space-x-2 text-xs">
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
                        <th className="py-3.5 px-4 font-semibold">Total (AUD)</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
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
                            {formatPrice(order.totalAUD)}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
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
                              onClick={() => {
                                if (confirm(`Delete category "${cat.title}"?`)) {
                                  deleteCategory(cat.id);
                                }
                              }}
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
                </div>

                <button
                  onClick={handleOpenCreateProduct}
                  className="bg-white text-black py-2.5 px-4 rounded text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center space-x-2 self-stretch sm:self-auto justify-center"
                >
                  <Plus size={16} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-neutral-800 text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Product & ID</th>
                        <th className="py-3.5 px-4 font-semibold">Category</th>
                        <th className="py-3.5 px-4 font-semibold">Price (AUD)</th>
                        <th className="py-3.5 px-4 font-semibold">Colors & Images</th>
                        <th className="py-3.5 px-4 font-semibold">Sizes</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {filteredProducts.map((prod) => {
                        const totalImages = prod.colors.reduce((sum, c) => sum + (c.images?.length || 0), 0);
                        const firstImage = prod.colors[0]?.images[0] || prod.colors[0]?.swatchImage;
                        return (
                          <tr key={prod.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={firstImage}
                                  alt={prod.name}
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
                            <td className="py-4 px-4 text-neutral-300">{prod.category}</td>
                            <td className="py-4 px-4 font-mono font-medium text-white">
                              {formatPrice(prod.priceAUD)}
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
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
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
                    setSelectedProductForReview(products[0]?.id || "");
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
                                  updateReviewStatus(product.id, review.id, nextStatus);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                                title="Toggle status"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this customer review?")) {
                                    deleteReview(product.id, review.id);
                                  }
                                }}
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
                </div>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Views Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Total Product Views</span>
                    <Eye size={16} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {totalReportViews.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
                    <TrendingUp size={12} />
                    <span>+18.4% vs prev period</span>
                  </div>
                </div>

                {/* Total Clicks Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Product Clicks & CTR</span>
                    <MousePointerClick size={16} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {totalReportClicks.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-neutral-300 font-mono">
                    <span className="text-emerald-400 font-semibold">{avgStoreCTR}%</span>
                    <span>Avg Click-Through Rate</span>
                  </div>
                </div>

                {/* Units Sold Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Total Units Sold</span>
                    <Flame size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {totalReportUnitsSold} <span className="text-xs text-neutral-400 font-normal">units</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
                    <TrendingUp size={12} />
                    <span>+24.1% sales velocity</span>
                  </div>
                </div>

                {/* Gross Revenue Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[11px] uppercase tracking-wider font-mono">Gross Sales Revenue</span>
                    <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {formatPrice(totalReportRevenueAUD)}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Across {orders.length} orders
                  </div>
                </div>

              </div>

              {/* REPORT SECTION 1: MOST VIEWED ITEMS */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden space-y-4 p-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <Eye size={18} className="text-blue-400" />
                    <div>
                      <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                        Most Viewed Items (Traffic Leaders)
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Ranked by total page impressions and unique guest visitors
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Top {mostViewedItems.length} Products</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold text-right">Total Views</th>
                        <th className="py-3 px-4 font-semibold text-right">Unique Visitors</th>
                        <th className="py-3 px-4 font-semibold text-right">CTR</th>
                        <th className="py-3 px-4 font-semibold text-center">Weekly Trend</th>
                        <th className="py-3 px-4 text-right font-semibold">Live Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {mostViewedItems.map((item, idx) => {
                        const img = item.product.colors[0]?.images[0] || item.product.colors[0]?.swatchImage;
                        return (
                          <tr key={item.product.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-400">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                idx === 0 ? "bg-blue-500/20 text-blue-300 font-bold" : idx === 1 ? "bg-neutral-700 text-white" : idx === 2 ? "bg-neutral-800 text-neutral-300" : "text-neutral-500"
                              }`}>
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={img}
                                  alt={item.product.name}
                                  className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0 border border-neutral-700"
                                />
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
                              {item.views.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                              {item.uniqueVisitors.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                              {item.ctr}%
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-[11px]">
                              <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                                <TrendingUp size={10} />
                                <span>+{item.trend}%</span>
                              </span>
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

              {/* REPORT SECTION 2: MOST CLICKED ITEMS (PURCHASE INTENT) */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden space-y-4 p-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <MousePointerClick size={18} className="text-purple-400" />
                    <div>
                      <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                        Most Clicked Items (Purchase Intent)
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Ranked by customer engagement, quick add interactions, and add-to-bag clicks
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">High-Intent Actions</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold text-right">Total Clicks</th>
                        <th className="py-3 px-4 font-semibold text-right">Click-Through (CTR)</th>
                        <th className="py-3 px-4 font-semibold text-right">Add to Bag Clicks</th>
                        <th className="py-3 px-4 font-semibold text-right">Quick Add Clicks</th>
                        <th className="py-3 px-4 font-semibold text-center">Intent Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {mostClickedItems.map((item, idx) => {
                        const img = item.product.colors[0]?.images[0] || item.product.colors[0]?.swatchImage;
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
                                <img
                                  src={img}
                                  alt={item.product.name}
                                  className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0 border border-neutral-700"
                                />
                                <div>
                                  <div className="font-serif text-white font-medium text-[13px]">{item.product.name}</div>
                                  <div className="font-mono text-[10px] text-neutral-500">{item.product.category} • {formatPrice(item.product.priceAUD)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                              {item.clicks.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-purple-400">
                              {item.ctr}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                              {item.addToBagClicks.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                              {item.quickAddClicks.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-[10px]">
                              <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                                idx < 2
                                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                                  : "bg-neutral-800 text-neutral-300"
                              }`}>
                                {idx === 0 ? "Highest Demand" : idx === 1 ? "High Intent" : "Steady Demand"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REPORT SECTION 3: TOP SELLING ITEMS (REVENUE & VOLUME) */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden space-y-4 p-5">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                  <div className="flex items-center space-x-2">
                    <Flame size={18} className="text-amber-400" />
                    <div>
                      <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-white">
                        Top Selling Items (Revenue & Volume)
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Ranked by units sold, total gross revenue, and sell-through rate
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-500 uppercase">Sales Leaders</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold text-right">Units Sold</th>
                        <th className="py-3 px-4 font-semibold text-right">Gross Revenue</th>
                        <th className="py-3 px-4 font-semibold text-right">Stock Remaining</th>
                        <th className="py-3 px-4 font-semibold text-right">Sell-Through</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {topSellingItems.map((item, idx) => {
                        const img = item.product.colors[0]?.images[0] || item.product.colors[0]?.swatchImage;
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
                                <img
                                  src={img}
                                  alt={item.product.name}
                                  className="w-10 h-12 object-cover rounded bg-neutral-950 shrink-0 border border-neutral-700"
                                />
                                <div>
                                  <div className="font-serif text-white font-medium text-[13px]">{item.product.name}</div>
                                  <div className="font-mono text-[10px] text-neutral-500">{item.product.category} • Unit: {formatPrice(item.product.priceAUD)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                              {item.unitsSold} <span className="text-[10px] text-neutral-400 font-normal">units</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                              {formatPrice(item.grossRevenueAUD)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                              {item.remainingStock > 0 ? (
                                <span>{item.remainingStock} in stock</span>
                              ) : (
                                <span className="text-amber-400">Pre-Order Only</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-200">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="w-16 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-amber-400 h-full rounded-full"
                                    style={{ width: `${Math.min(item.sellThroughRate, 100)}%` }}
                                  />
                                </div>
                                <span>{item.sellThroughRate}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-[10px]">
                              {idx === 0 ? (
                                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold uppercase">
                                  ★ Best Seller
                                </span>
                              ) : item.remainingStock < 10 ? (
                                <span className="bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold uppercase">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                    const catViews = catItems.reduce((acc, p) => acc + p.views, 0);
                    const catUnits = catItems.reduce((acc, p) => acc + p.unitsSold, 0);
                    const catRevenue = catItems.reduce((acc, p) => acc + p.grossRevenueAUD, 0);
                    const viewShare = Number(((catViews / (totalReportViews || 1)) * 100).toFixed(1));

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
                            <span>Traffic Share:</span>
                            <span className="text-white font-bold">{viewShare}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-white h-full rounded-full"
                              style={{ width: `${viewShare}%` }}
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
              
              {/* Row 1: Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                    Price (AUD $) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.priceAUD || ""}
                    onChange={(e) => setProductForm({ ...productForm, priceAUD: Number(e.target.value) })}
                    placeholder="220"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white font-mono focus:border-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category, Badge & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-800/80">
                <div>
                  <label className="block uppercase tracking-wider text-[11px] font-semibold text-neutral-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={productForm.category || "Shirts"}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:border-neutral-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
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

                      {/* Swatch Thumbnail input */}
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                          Swatch Thumbnail Image URL
                        </label>
                        <input
                          type="text"
                          value={color.swatchImage || ""}
                          onChange={(e) => handleUpdateColorField(colorIdx, "swatchImage", e.target.value)}
                          placeholder="https://... swatch preview image"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-[11px] text-white focus:outline-none"
                        />
                      </div>

                      {/* 6 Images Grid for this Color */}
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-neutral-400 mb-1.5">
                          Product Photos for {color.name || "Color"} (Up to 6 images)
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-2">
                          {color.images?.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative aspect-[3/4] bg-neutral-900 rounded overflow-hidden group border border-neutral-800">
                              <img src={imgUrl} alt="Product angle" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromColor(colorIdx, imgIdx)}
                                  className="p-1 bg-red-600/80 text-white rounded-full hover:bg-red-600"
                                  title="Delete Image"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] font-mono px-1 rounded text-white">
                                #{imgIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add Image Input row */}
                        {(color.images?.length || 0) < 6 && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              id={`new-img-input-${colorIdx}`}
                              placeholder="Paste photo URL and click Add (e.g. Unsplash URL)..."
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs text-white focus:outline-none focus:border-neutral-500"
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
                              className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded text-xs uppercase font-medium"
                            >
                              Add Image
                            </button>
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
                  className="bg-white text-black px-6 py-2.5 rounded text-xs uppercase tracking-wider font-bold hover:bg-neutral-200 transition-colors"
                >
                  {editingProduct ? "Save Product Changes" : "Publish Product"}
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
                  className="bg-white text-black px-5 py-2 rounded font-bold uppercase tracking-wider hover:bg-neutral-200"
                >
                  Save Category
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
                        {formatPrice(item.priceAUD * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800 font-serif text-sm">
                <span className="text-neutral-300 uppercase tracking-wider">Total Paid</span>
                <span className="font-bold font-mono text-base text-white">{formatPrice(selectedOrder.totalAUD)}</span>
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
                <select
                  required
                  value={selectedProductForReview}
                  onChange={(e) => setSelectedProductForReview(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-white focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
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
                  className="bg-white text-black px-5 py-2 rounded font-bold uppercase tracking-wider hover:bg-neutral-200"
                >
                  Post Review
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

    </div>
  );
}
