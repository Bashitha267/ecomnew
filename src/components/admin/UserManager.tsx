"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  Calendar,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { usersApi, UserItem, UserStats, getApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const AVAILABLE_COUNTRIES = [
  "Australia",
  "Sri Lanka",
  "United States",
  "United Kingdom",
  "New Zealand",
  "Singapore",
];

export const UserManager: React.FC = () => {
  const { user: currentAuthUser } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminCount: 0,
    customerCount: 0,
    countries: { Australia: 0, "Sri Lanka": 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Adding Admin / User
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin" as "admin" | "customer",
    country: "Australia",
    phone: "",
    address: "",
  });

  // Form State for Editing User
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "customer" as "admin" | "customer",
    country: "Australia",
    phone: "",
    address: "",
    newPassword: "",
  });

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.list({
        role: roleFilter !== "all" ? roleFilter : undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.data?.success) {
        setUsers(res.data.users || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      showFeedback("error", getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, countryFilter, searchQuery]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(delayTimer);
  }, [fetchUsers]);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      country: "Australia",
      phone: "",
      address: "",
    });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      showFeedback("error", "Name, email, and password are required.");
      return;
    }
    if (formData.password.length < 6) {
      showFeedback("error", "Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showFeedback("error", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await usersApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        country: formData.country,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      });

      if (res.data?.success) {
        showFeedback("success", res.data.message || "User created successfully.");
        setIsAddModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (target: UserItem) => {
    setEditingUser(target);
    setEditFormData({
      name: target.name,
      role: target.role,
      country: target.country || "Australia",
      phone: target.phone || "",
      address: target.address || "",
      newPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.name.trim()) {
      showFeedback("error", "Name cannot be empty.");
      return;
    }
    if (editFormData.newPassword && editFormData.newPassword.length < 6) {
      showFeedback("error", "New password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload: Record<string, any> = {
        name: editFormData.name.trim(),
        role: editFormData.role,
        country: editFormData.country,
        phone: editFormData.phone.trim() || null,
        address: editFormData.address.trim() || null,
      };
      if (editFormData.newPassword) {
        updatePayload.password = editFormData.newPassword;
      }

      const res = await usersApi.update(editingUser.id, updatePayload);
      if (res.data?.success) {
        showFeedback("success", "User updated successfully.");
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (target: UserItem) => {
    if (target.id === currentAuthUser?.id) {
      showFeedback("error", "You cannot delete your own logged-in administrator account.");
      return;
    }
    setDeletingUser(target);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      const res = await usersApi.delete(deletingUser.id);
      if (res.data?.success) {
        showFeedback("success", "User account removed.");
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
        fetchUsers();
      }
    } catch (err) {
      showFeedback("error", getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
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

      {/* Header bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
            <ShieldCheck size={14} />
            <span>Role & Country Based Access Control</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-white font-sans">
            User & Administrator Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Manage system administrators and customer accounts. Filter user registries by role and geographical region.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
            title="Reload user list"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <UserPlus size={15} />
            <span>Add Admin</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono uppercase mb-2">
            <span>Total Users</span>
            <Users size={16} className="text-neutral-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</div>
          <div className="text-[10px] text-neutral-500 mt-1">Accounts registered in DB</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono uppercase mb-2">
            <span>Administrators</span>
            <Shield size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.adminCount}</div>
          <div className="text-[10px] text-neutral-500 mt-1">Full backend privileges</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono uppercase mb-2">
            <span>Customers</span>
            <ShoppingBag size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.customerCount}</div>
          <div className="text-[10px] text-neutral-500 mt-1">Storefront customers</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-lg">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-mono uppercase mb-2">
            <span>Top Regions</span>
            <Globe size={16} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xs font-mono text-neutral-300">AU:</span>
            <span className="text-lg font-bold font-mono text-white">{stats.countries?.Australia || 0}</span>
            <span className="text-xs font-mono text-neutral-500">|</span>
            <span className="text-xs font-mono text-neutral-300">LK:</span>
            <span className="text-lg font-bold font-mono text-white">{stats.countries?.["Sri Lanka"] || 0}</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Australia & Sri Lanka users</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, username, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-neutral-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center space-x-1.5 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded">
              <Filter size={13} className="text-neutral-500" />
              <span className="text-[11px] font-mono text-neutral-400 uppercase">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer py-1"
              >
                <option value="all" className="bg-neutral-900">All Roles</option>
                <option value="admin" className="bg-neutral-900">Admin Only</option>
                <option value="customer" className="bg-neutral-900">Customer Only</option>
              </select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center space-x-1.5 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded">
              <Globe size={13} className="text-neutral-500" />
              <span className="text-[11px] font-mono text-neutral-400 uppercase">Country:</span>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer py-1"
              >
                <option value="all" className="bg-neutral-900">All Countries</option>
                <option value="Australia" className="bg-neutral-900">Australia 🇦🇺</option>
                <option value="Sri Lanka" className="bg-neutral-900">Sri Lanka 🇱🇰</option>
                <option value="United States" className="bg-neutral-900">United States 🇺🇸</option>
                <option value="United Kingdom" className="bg-neutral-900">United Kingdom 🇬🇧</option>
                <option value="New Zealand" className="bg-neutral-900">New Zealand 🇳🇿</option>
              </select>
            </div>

            {(roleFilter !== "all" || countryFilter !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setRoleFilter("all");
                  setCountryFilter("all");
                  setSearchQuery("");
                }}
                className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1 underline transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-4 font-medium">User Profile</th>
                <th className="py-3.5 px-4 font-medium">Role</th>
                <th className="py-3.5 px-4 font-medium">Country / Region</th>
                <th className="py-3.5 px-4 font-medium">Contact</th>
                <th className="py-3.5 px-4 font-medium">Orders</th>
                <th className="py-3.5 px-4 font-medium">Joined Date</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw size={22} className="animate-spin text-neutral-500" />
                      <span className="font-mono text-xs uppercase tracking-wider">Loading users registry...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users size={28} className="text-neutral-600" />
                      <span className="font-sans text-sm text-neutral-300">No users found</span>
                      <span className="text-xs text-neutral-500">
                        Try adjusting your search query, role filter, or country filter.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isCurrent = item.id === currentAuthUser?.id;
                  const initials = item.name
                    ? item.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-800/30 transition-colors group"
                    >
                      {/* User Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-wider border ${
                              item.role === "admin"
                                ? "bg-amber-950 text-amber-300 border-amber-800/60"
                                : "bg-neutral-800 text-neutral-200 border-neutral-700"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-neutral-200">{item.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-neutral-400 text-[11px] font-mono flex items-center space-x-1.5 mt-0.5">
                              <Mail size={11} className="text-neutral-500" />
                              <span>{item.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {item.role === "admin" ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono text-[10px] font-bold uppercase tracking-wider">
                            <Shield size={11} className="text-amber-400" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-[10px] uppercase tracking-wider">
                            <Users size={11} className="text-neutral-400" />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 font-sans text-xs">
                          <Globe size={12} className="text-neutral-400" />
                          <span>{item.country || "Australia"}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-neutral-400">
                        {item.phone ? (
                          <div className="flex items-center space-x-1 font-mono text-[11px] text-neutral-300">
                            <Phone size={11} className="text-neutral-500" />
                            <span>{item.phone}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-xs text-neutral-300">
                          <ShoppingBag size={12} className="text-neutral-500" />
                          <span>{item.ordersCount || 0}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                            title="Edit user details or change role"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded transition-colors ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed text-neutral-600"
                                : "hover:bg-neutral-800 text-neutral-400 hover:text-red-400"
                            }`}
                            title={isCurrent ? "You cannot delete your own account" : "Delete user"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Showing {users.length} registered accounts</span>
          <span>Role & Country Filter Active</span>
        </div>
      </div>

      {/* ─── MODAL: Add Admin / User ────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Add New Administrator / User
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Anderson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@carltonvalley.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Password (min 6 chars) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "customer" })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                  >
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="customer">Customer (Storefront Only)</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                  >
                    {AVAILABLE_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone & Address (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+61 400 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Address / City (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Melbourne, VIC"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-xs transition-colors shadow flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Edit User ────────────────────────────────────────────── */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 size={16} className="text-neutral-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Edit User: {editingUser.email}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    disabled={editingUser.id === currentAuthUser?.id}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value as "admin" | "customer" })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500 disabled:opacity-50"
                  >
                    <option value="admin">Administrator</option>
                    <option value="customer">Customer</option>
                  </select>
                  {editingUser.id === currentAuthUser?.id && (
                    <span className="text-[10px] text-neutral-500 block mt-1">
                      You cannot demote your own account.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Country
                  </label>
                  <select
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                  >
                    {AVAILABLE_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Password Reset */}
              <div className="border-t border-neutral-800 pt-3">
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1 flex items-center space-x-1">
                  <Lock size={12} className="text-amber-400" />
                  <span>Reset Password (Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-500"
                />
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
                  disabled={isSubmitting}
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

      {/* ─── MODAL: Delete Confirmation ──────────────────────────────────── */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle size={22} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Confirm User Deletion
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete user{" "}
              <strong className="text-white font-mono">{deletingUser.email}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 uppercase tracking-wider font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw size={13} className="animate-spin" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
