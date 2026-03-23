"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Users,
  UserPlus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Music,
  Crown,
  KeyRound,
  Eye,
  EyeOff,
  BarChart3,
  Wifi,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import SessionsMonitor from "@/components/admin/sessions-monitor";
import WafDashboard from "@/components/admin/waf-dashboard";
import SecurityDashboard from "@/components/admin/security-dashboard";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  patternCount: number;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "analytics" | "sessions" | "waf" | "security">("users");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch users");
      }
      const data: UsersResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Couldn't load the users. Want to try again?");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, fetchUsers]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handlePromote = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/promote`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${user.email} is now an admin`);
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't promote that user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/demote`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${user.email} is no longer an admin`);
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't demote that user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${deleteTarget.email} has been removed`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete that user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openPasswordModal = (user: AdminUser) => {
    setPasswordTarget(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async () => {
    if (!passwordTarget) return;

    if (newPassword.length < 8) {
      toast.error("Make that password at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Those passwords aren't matching");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users/${passwordTarget.id}/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Password changed for ${passwordTarget.email}`);
      setPasswordTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't change that password. Want to try again?"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#1A1410] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8732A] mx-auto mb-4" />
          <p className="text-[#A08060] font-mono text-sm tracking-wider">
            FIRE UP THE CONSOLE...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const adminCount = users.filter((u) => u.isAdmin).length;
  const recentUsers = users.filter((u) => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(u.createdAt) > dayAgo;
  }).length;

  return (
    <div className="min-h-screen bg-[#1A1410] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="vintage-panel rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#E8732A] shadow-[0_0_8px_rgba(232,115,42,0.6)]" />
              <h1 className="font-mono text-[#F5E6D3] text-xl md:text-2xl tracking-wider uppercase">
                Admin Console
              </h1>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="vintage-button text-[#F5E6D3] font-mono text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MACHINE
            </Button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#4A3728]/50">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === "users"
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === "analytics"
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === "sessions"
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Sessions
            </button>
            <button
              onClick={() => setActiveTab("waf")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === "waf"
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              WAF
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === "security"
                  ? "bg-[#E8732A]/20 text-[#E8732A] border border-[#E8732A]/30"
                  : "text-[#A08060] hover:bg-[#3D2B1F] border border-transparent"
              }`}
            >
              <ShieldOff className="w-3.5 h-3.5" />
              Security
            </button>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AnalyticsDashboard />}

        {/* Sessions Tab */}
        {activeTab === "sessions" && <SessionsMonitor />}

        {/* WAF Tab */}
        {activeTab === "waf" && <WafDashboard />}

        {/* Security Tab */}
        {activeTab === "security" && <SecurityDashboard />}

        {/* Users Tab */}
        {activeTab === "users" && <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="vintage-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8732A]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E8732A]" />
              </div>
              <div>
                <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                  Total Users
                </p>
                <p className="text-[#F5E6D3] font-mono text-2xl">{total}</p>
              </div>
            </div>
          </div>
          <div className="vintage-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E8732A]/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#E8732A]" />
              </div>
              <div>
                <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                  Admins
                </p>
                <p className="text-[#F5E6D3] font-mono text-2xl">
                  {adminCount}
                </p>
              </div>
            </div>
          </div>
          <div className="vintage-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#27AE60]/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#27AE60]" />
              </div>
              <div>
                <p className="text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                  New (24h)
                </p>
                <p className="text-[#F5E6D3] font-mono text-2xl">
                  {recentUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & User Table */}
        <div className="vintage-panel rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-mono text-[#D4A574] text-sm tracking-wider uppercase">
              User Management
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08060]" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 bg-[#0A0A0A] border-[#4A3728] text-[#F5E6D3] font-mono text-sm placeholder:text-[#A08060]/50"
                />
              </div>
              <Button
                type="submit"
                className="vintage-button text-[#F5E6D3] font-mono text-xs"
              >
                SEARCH
              </Button>
            </form>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#E8732A]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A08060] font-mono text-sm">
                {search ? "No users found matching your search." : "No users found."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#4A3728]">
                      <th className="text-left py-3 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                        User
                      </th>
                      <th className="text-left py-3 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                        Patterns
                      </th>
                      <th className="text-left py-3 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                        Joined
                      </th>
                      <th className="text-right py-3 px-3 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-[0.15em]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#4A3728]/50 hover:bg-[#3D2B1F]/30 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div>
                            <p className="text-[#F5E6D3] font-mono text-sm">
                              {user.name || "—"}
                            </p>
                            <p className="text-[#A08060] text-xs">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8732A]/20 text-[#E8732A] font-mono text-[0.65rem] uppercase tracking-wider">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4A3728]/50 text-[#A08060] font-mono text-[0.65rem] uppercase tracking-wider">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 text-[#D4A574] font-mono text-sm">
                            <Music className="w-3 h-3" />
                            {user.patternCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#A08060] font-mono text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            {user.id !== session.user.id && (
                              <>
                                {user.isAdmin ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleDemote(user)}
                                    disabled={actionLoading === user.id}
                                    className="bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-[0.65rem] uppercase tracking-wider h-7 px-2"
                                  >
                                    {actionLoading === user.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <ShieldOff className="w-3 h-3 mr-1" />
                                        Demote
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePromote(user)}
                                    disabled={actionLoading === user.id}
                                    className="bg-[#E8732A]/20 hover:bg-[#E8732A]/30 text-[#E8732A] border border-[#E8732A]/30 font-mono text-[0.65rem] uppercase tracking-wider h-7 px-2"
                                  >
                                    {actionLoading === user.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Shield className="w-3 h-3 mr-1" />
                                        Promote
                                      </>
                                    )}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => openPasswordModal(user)}
                                  disabled={actionLoading === user.id}
                                  className="bg-[#2980B9]/20 hover:bg-[#2980B9]/30 text-[#2980B9] border border-[#2980B9]/30 font-mono text-[0.65rem] uppercase tracking-wider h-7 px-2"
                                  title="Change Password"
                                >
                                  <KeyRound className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => setDeleteTarget(user)}
                                  disabled={actionLoading === user.id}
                                  className="bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30 font-mono text-[0.65rem] uppercase tracking-wider h-7 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {user.id === session.user.id && (
                              <span className="text-[#A08060] font-mono text-[0.65rem] italic">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-[#3D2B1F]/30 rounded-lg border border-[#4A3728]/50 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[#F5E6D3] font-mono text-sm">
                          {user.name || "—"}
                        </p>
                        <p className="text-[#A08060] text-xs">{user.email}</p>
                      </div>
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8732A]/20 text-[#E8732A] font-mono text-[0.6rem] uppercase">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#4A3728]/50 text-[#A08060] font-mono text-[0.6rem] uppercase">
                          User
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#A08060] font-mono">
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {user.patternCount} patterns
                      </span>
                      <span>
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {user.id !== session.user.id && (
                      <div className="flex items-center gap-2 pt-1">
                        {user.isAdmin ? (
                          <Button
                            size="sm"
                            onClick={() => handleDemote(user)}
                            disabled={actionLoading === user.id}
                            className="bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-[0.6rem] uppercase h-7 flex-1"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <ShieldOff className="w-3 h-3 mr-1" />
                                Demote
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePromote(user)}
                            disabled={actionLoading === user.id}
                            className="bg-[#E8732A]/20 hover:bg-[#E8732A]/30 text-[#E8732A] border border-[#E8732A]/30 font-mono text-[0.6rem] uppercase h-7 flex-1"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Promote
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => openPasswordModal(user)}
                          disabled={actionLoading === user.id}
                          className="bg-[#2980B9]/20 hover:bg-[#2980B9]/30 text-[#2980B9] border border-[#2980B9]/30 font-mono text-[0.6rem] uppercase h-7"
                          title="Change Password"
                        >
                          <KeyRound className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                          disabled={actionLoading === user.id}
                          className="bg-[#C0392B]/20 hover:bg-[#C0392B]/30 text-[#C0392B] border border-[#C0392B]/30 font-mono text-[0.6rem] uppercase h-7"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[#A08060] font-mono text-xs">
                    Page {page} of {totalPages} ({total} users)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="vintage-button text-[#F5E6D3] font-mono text-xs h-7 px-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      className="vintage-button text-[#F5E6D3] font-mono text-xs h-7 px-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </>}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#2C1E14] border-[#4A3728] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5E6D3] font-mono tracking-wider">
              REMOVE THIS USER
            </DialogTitle>
            <DialogDescription className="text-[#A08060]">
              This is permanent—you can't undo it.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-3 py-2">
              <div className="bg-[#0A0A0A] rounded-lg border border-[#4A3728] p-3">
                <p className="text-[#F5E6D3] font-mono text-sm">
                  {deleteTarget.name || "No name"}
                </p>
                <p className="text-[#A08060] text-xs">{deleteTarget.email}</p>
                <p className="text-[#D4A574] text-xs mt-1">
                  {deleteTarget.patternCount} saved pattern
                  {deleteTarget.patternCount !== 1 ? "s" : ""} will also be
                  deleted
                </p>
              </div>
              <p className="text-[#C0392B] font-mono text-xs">
                Seriously, are you sure? All their patterns and data go away too.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setDeleteTarget(null)}
              className="bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-xs"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading === deleteTarget?.id}
              className="bg-[#C0392B] hover:bg-[#C0392B]/80 text-white font-mono text-xs"
            >
              {actionLoading === deleteTarget?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              DELETE USER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={!!passwordTarget}
        onOpenChange={(open) => !open && setPasswordTarget(null)}
      >
        <DialogContent className="bg-[#2C1E14] border-[#4A3728] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5E6D3] font-mono tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#2980B9]" />
              NEW PASSWORD
            </DialogTitle>
            <DialogDescription className="text-[#A08060]">
              Give this user a fresh password.
            </DialogDescription>
          </DialogHeader>
          {passwordTarget && (
            <div className="space-y-4 py-2">
              <div className="bg-[#0A0A0A] rounded-lg border border-[#4A3728] p-3">
                <p className="text-[#F5E6D3] font-mono text-sm">
                  {passwordTarget.name || "No name"}
                </p>
                <p className="text-[#A08060] text-xs">{passwordTarget.email}</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="admin-new-password"
                  className="text-[#D4A574] font-mono text-xs uppercase tracking-wider"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="bg-[#0A0A0A] border-[#4A3728] text-[#F5E6D3] font-mono text-sm placeholder:text-[#A08060]/50 pr-10"
                    disabled={passwordLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-[#A08060]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#A08060]" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="admin-confirm-password"
                  className="text-[#D4A574] font-mono text-xs uppercase tracking-wider"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="bg-[#0A0A0A] border-[#4A3728] text-[#F5E6D3] font-mono text-sm placeholder:text-[#A08060]/50 pr-10"
                    disabled={passwordLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#A08060]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#A08060]" />
                    )}
                  </Button>
                </div>
              </div>

              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="text-[#C0392B] font-mono text-xs">
                  Gotta be at least 8 characters
                </p>
              )}
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-[#C0392B] font-mono text-xs">
                  Those don't match up
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setPasswordTarget(null)}
              className="bg-[#3D2B1F] hover:bg-[#4A3728] text-[#D4A574] border border-[#4A3728] font-mono text-xs"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                passwordLoading ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              className="bg-[#2980B9] hover:bg-[#2980B9]/80 text-white font-mono text-xs"
            >
              {passwordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              UPDATE PASSWORD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
