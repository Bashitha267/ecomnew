"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import {
  communitySpotlightApi,
  CommunitySpotlightItem,
  getApiError,
} from "../../lib/api";
import { useStore } from "../../context/StoreContext";

export const CommunitySpotlightManager: React.FC = () => {
  const { products } = useStore();

  const [spotlights, setSpotlights] = useState<CommunitySpotlightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommunitySpotlightItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CommunitySpotlightItem | null>(null);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add form state
  const [addForm, setAddForm] = useState({
    username: "@",
    productTagged: "",
    link: "/shop",
    image: "",
    sortOrder: 0,
    isActive: true,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: "",
    productTagged: "",
    link: "",
    image: "",
    sortOrder: 0,
    isActive: true,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchSpotlights = async () => {
    setIsLoading(true);
    try {
      const res = await communitySpotlightApi.list();
      if (res.data?.success) {
        setSpotlights(res.data.spotlights || []);
      }
    } catch (err) {
      console.error("Failed to load spotlights:", err);
      showFeedback("error", getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotlights();
  }, []);

  const handleFileUpload = async (file: File, isEdit = false) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await communitySpotlightApi.uploadImage(file);
      if (res.data?.success && res.data.imageUrl) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, image: res.data.imageUrl }));
        } else {
          setAddForm((prev) => ({ ...prev, image: res.data.imageUrl }));
        }
        showFeedback("success", "Spotlight image uploaded successfully!");
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.image) {
      showFeedback("error", "Please upload or provide an image for the spotlight post.");
      return;
    }
    if (!addForm.username.trim() || addForm.username === "@") {
      showFeedback("error", "Please enter a valid username (e.g. @alex.style).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await communitySpotlightApi.create({
        username: addForm.username.trim(),
        productTagged: addForm.productTagged.trim(),
        link: addForm.link.trim() || "/shop",
        image: addForm.image.trim(),
        sortOrder: Number(addForm.sortOrder) || spotlights.length + 1,
        isActive: addForm.isActive ? 1 : 0,
      });

      if (res.data?.success) {
        showFeedback("success", "Community spotlight post added successfully.");
        setIsAddModalOpen(false);
        setAddForm({
          username: "@",
          productTagged: "",
          link: "/shop",
          image: "",
          sortOrder: 0,
          isActive: true,
        });
        fetchSpotlights();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item: CommunitySpotlightItem) => {
    setEditingItem(item);
    setEditForm({
      username: item.username,
      productTagged: item.productTagged || "",
      link: item.link || "/shop",
      image: item.image,
      sortOrder: item.sortOrder || 0,
      isActive: Boolean(item.isActive),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editForm.image) {
      showFeedback("error", "Image cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await communitySpotlightApi.update(editingItem.id, {
        username: editForm.username.trim(),
        productTagged: editForm.productTagged.trim(),
        link: editForm.link.trim() || "/shop",
        image: editForm.image.trim(),
        sortOrder: Number(editForm.sortOrder),
        isActive: editForm.isActive ? 1 : 0,
      });

      if (res.data?.success) {
        showFeedback("success", "Spotlight post updated.");
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchSpotlights();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      const res = await communitySpotlightApi.delete(deletingItem.id);
      if (res.data?.success) {
        showFeedback("success", "Post deleted.");
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchSpotlights();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset the Community Spotlight to default posts?")) return;
    setIsLoading(true);
    try {
      const res = await communitySpotlightApi.reset();
      if (res.data?.success) {
        showFeedback("success", "Community spotlight reset to defaults.");
        fetchSpotlights();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (item: CommunitySpotlightItem) => {
    try {
      const nextActive = item.isActive ? 0 : 1;
      await communitySpotlightApi.update(item.id, { isActive: nextActive });
      setSpotlights((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isActive: nextActive } : s))
      );
      showFeedback("success", `Post ${nextActive ? "published" : "hidden"}`);
    } catch (err) {
      showFeedback("error", getApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center space-x-3 px-4 py-3 rounded text-xs tracking-wide uppercase font-mono shadow-lg transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
              : "bg-red-950 border border-red-800 text-red-300"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="font-sans normal-case tracking-normal">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-auto text-neutral-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
            <Sparkles size={14} />
            <span>Homepage Section Manager</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-white font-sans">
            Community Spotlight Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Upload and organize the customer style gallery showcased on the homepage. Tag products, customize Instagram handles, and reorder photos.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded text-xs font-medium uppercase tracking-wider transition-colors"
            title="Reset to default seed items"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Add Spotlight Post</span>
          </button>
        </div>
      </div>

      {/* Storefront Live Preview Mockup */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Eye size={16} className="text-neutral-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
              Storefront Live Preview
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            {spotlights.filter((s) => s.isActive).length} active posts visible on homepage
          </span>
        </div>

        {/* Scaled Preview Box */}
        <div className="bg-white text-black p-6 rounded border border-neutral-200 overflow-hidden shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-light font-serif tracking-[0.2em] uppercase text-black">
              Community Spotlight
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {spotlights
              .filter((s) => s.isActive)
              .slice(0, 6)
              .map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square overflow-hidden bg-neutral-100 rounded-xs shadow-xs"
                >
                  <img
                    src={item.image}
                    alt={item.username}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                    <div className="flex items-center space-x-1 text-[10px] font-mono">
                      <Camera size={11} />
                      <span className="truncate">{item.username}</span>
                    </div>
                    {item.productTagged && (
                      <span className="text-[9px] text-neutral-300 truncate font-light">
                        {item.productTagged}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Spotlight Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400 px-1">
          <span>All Spotlight Items ({spotlights.length})</span>
          <span>Click to edit or upload new photo</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-lg">
            <RefreshCw size={24} className="animate-spin mx-auto text-neutral-500 mb-2" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading spotlight posts...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {spotlights.map((item) => {
              const isActive = Boolean(item.isActive);
              return (
                <div
                  key={item.id}
                  className={`bg-neutral-900 border rounded-lg overflow-hidden transition-all group flex flex-col justify-between ${
                    isActive ? "border-neutral-800 hover:border-neutral-600" : "border-neutral-800/50 opacity-60"
                  }`}
                >
                  {/* Photo with Overlay Controls */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-950">
                    <img
                      src={item.image}
                      alt={item.username}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop";
                      }}
                    />

                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                      #{item.sortOrder || 0}
                    </div>

                    {/* Active Status Badge */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-colors ${
                          isActive
                            ? "bg-emerald-950/90 text-emerald-300 border-emerald-700"
                            : "bg-neutral-900/90 text-neutral-400 border-neutral-700"
                        }`}
                        title={isActive ? "Visible on storefront" : "Hidden from storefront"}
                      >
                        {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{isActive ? "Active" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Bottom gradient with username */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-white">
                      <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-white">
                        <Camera size={13} className="text-neutral-400" />
                        <span className="truncate">{item.username}</span>
                      </div>
                      {item.productTagged && (
                        <div className="flex items-center space-x-1 text-[11px] text-neutral-300 mt-0.5 font-sans truncate">
                          <ShoppingBag size={11} className="text-neutral-400 shrink-0" />
                          <span className="truncate">{item.productTagged}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[120px]">
                      {item.link || "/shop"}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        title="Edit post"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingItem(item);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL: Add Spotlight Post ─────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera size={18} className="text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Add Community Spotlight Post
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Image Upload / Preview */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Spotlight Photo <span className="text-red-400">*</span>
                </label>

                <div className="flex items-center space-x-4">
                  {/* Thumbnail Preview */}
                  <div className="w-24 h-24 rounded border border-neutral-800 bg-neutral-950 overflow-hidden flex items-center justify-center shrink-0">
                    {addForm.image ? (
                      <img src={addForm.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-neutral-600" />
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, false);
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wider border border-neutral-700 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>{isUploading ? "Uploading..." : "Upload Image File"}</span>
                    </button>

                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. /images/community_1.jpg)"
                      value={addForm.image}
                      onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Instagram / Community Handle <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="@sophia.mode"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500 font-mono"
                />
              </div>

              {/* Tagged Product */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Tagged Product Name
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Oversized Structured Wool Shirt"
                    value={addForm.productTagged}
                    onChange={(e) => setAddForm({ ...addForm, productTagged: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                  {products.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setAddForm({
                            ...addForm,
                            productTagged: e.target.value,
                            link: `/product/${products.find((p) => p.name === e.target.value)?.id || ""}`,
                          });
                        }
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-400 focus:outline-hidden"
                    >
                      <option value="">Or select from store catalog...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Destination Link & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Store Link
                  </label>
                  <input
                    type="text"
                    placeholder="/shop"
                    value={addForm.link}
                    onChange={(e) => setAddForm({ ...addForm, link: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={addForm.sortOrder}
                    onChange={(e) => setAddForm({ ...addForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500 font-mono"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="addActive"
                  checked={addForm.isActive}
                  onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                  className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="addActive" className="text-xs text-neutral-300 cursor-pointer font-sans">
                  Publish immediately to homepage
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 uppercase tracking-wider font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2 rounded bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-xs transition-colors shadow flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Add to Spotlight</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit Spotlight Post ─────────────────────────────────── */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 size={16} className="text-neutral-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Edit Spotlight Post: {editingItem.username}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="space-y-4 text-xs">
              {/* Image Upload / Preview */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                  Spotlight Photo
                </label>

                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded border border-neutral-800 bg-neutral-950 overflow-hidden shrink-0">
                    <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, true);
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wider border border-neutral-700 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>{isUploading ? "Uploading..." : "Replace Image File"}</span>
                    </button>

                    <input
                      type="text"
                      value={editForm.image}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Instagram / Community Handle
                </label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500 font-mono"
                />
              </div>

              {/* Tagged Product */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Tagged Product Name
                </label>
                <input
                  type="text"
                  value={editForm.productTagged}
                  onChange={(e) => setEditForm({ ...editForm, productTagged: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              {/* Destination Link & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Store Link
                  </label>
                  <input
                    type="text"
                    value={editForm.link}
                    onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editForm.sortOrder}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500 font-mono"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="editActive" className="text-xs text-neutral-300 cursor-pointer font-sans">
                  Published to homepage
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 uppercase tracking-wider font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2 rounded bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-xs transition-colors shadow flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete Confirmation ─────────────────────────────────── */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle size={22} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Delete Spotlight Post
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove the spotlight post for{" "}
              <strong className="text-white font-mono">{deletingItem.username}</strong>? This item will no
              longer appear in the homepage community gallery.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 uppercase tracking-wider font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                <span>Delete Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
