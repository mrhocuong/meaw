"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Salad,
  Newspaper,
  MessageSquareQuote,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Flame,
  X,
  Download,
} from "lucide-react";
import {
  BowlCategory,
  BowlIngredient,
  CMSData,
  IngredientStep,
  MenuBowl,
  NewsPost,
  OrderStatus,
  Testimonial,
} from "@/types/cms";

type AdminTab =
  | "orders"
  | "bowls"
  | "ingredients"
  | "news"
  | "testimonials"
  | "siteConfig";

export default function AdminCMSPage() {
  const [data, setData] = useState<CMSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("bowls");
  const [toast, setToast] = useState<string | null>(null);

  // Modal / Editing states for Bowls
  const [editingBowl, setEditingBowl] = useState<MenuBowl | null>(null);

  // Modal / Editing states for Ingredients
  const [ingStepFilter, setIngStepFilter] = useState<"all" | IngredientStep>("all");
  const [editingIngredient, setEditingIngredient] = useState<BowlIngredient | null>(null);

  // Modal / Editing states for News
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);

  // Modal / Editing states for Testimonials
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const fetchCMS = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      const json = (await res.json()) as CMSData;
      setData(json);
    } catch (e) {
      console.error(e);
      showNotice("Lỗi tải dữ liệu CMS!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const persistCMS = async (updated: CMSData, successMessage = "Đã lưu thay đổi thành công!") => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const saved = (await res.json()) as CMSData;
        setData(saved);
        showNotice(successMessage);
      } else {
        showNotice("Lỗi khi lưu dữ liệu!");
      }
    } catch {
      showNotice("Không thể kết nối API!");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm("Bạn có chắc muốn khôi phục toàn bộ dữ liệu mẫu mặc định của Soumaki?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        const resetData = (await res.json()) as CMSData;
        setData(resetData);
        showNotice("Đã khôi phục dữ liệu mẫu mặc định!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soumaki-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-plum">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-plum text-cream font-display font-extrabold text-xl flex items-center justify-center mx-auto animate-pulse">
            S
          </div>
          <p className="font-display font-bold text-sm">Đang tải hệ thống CMS Soumaki...</p>
        </div>
      </div>
    );
  }

  // Handlers for Bowls
  const saveBowl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBowl) return;
    const exists = data.bowls.some((b) => b.id === editingBowl.id);
    const nextBowls = exists
      ? data.bowls.map((b) => (b.id === editingBowl.id ? editingBowl : b))
      : [editingBowl, ...data.bowls];
    persistCMS({ ...data, bowls: nextBowls }, "Đã lưu phần ăn vào Thực đơn!");
    setEditingBowl(null);
  };

  const deleteBowl = (id: string) => {
    if (!confirm("Xóa phần ăn này khỏi thực đơn?")) return;
    const nextBowls = data.bowls.filter((b) => b.id !== id);
    persistCMS({ ...data, bowls: nextBowls }, "Đã xóa phần ăn!");
  };

  // Handlers for Ingredients
  const saveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIngredient) return;
    const exists = data.ingredients.some((i) => i.id === editingIngredient.id);
    const nextIngs = exists
      ? data.ingredients.map((i) => (i.id === editingIngredient.id ? editingIngredient : i))
      : [...data.ingredients, editingIngredient];
    persistCMS({ ...data, ingredients: nextIngs }, "Đã lưu nguyên liệu Build-Bowl!");
    setEditingIngredient(null);
  };

  const deleteIngredient = (id: string) => {
    if (!confirm("Xóa nguyên liệu này?")) return;
    const nextIngs = data.ingredients.filter((i) => i.id !== id);
    persistCMS({ ...data, ingredients: nextIngs }, "Đã xóa nguyên liệu!");
  };

  // Handlers for News
  const saveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    const exists = data.news.some((n) => n.id === editingNews.id);
    const nextNews = exists
      ? data.news.map((n) => (n.id === editingNews.id ? editingNews : n))
      : [editingNews, ...data.news];
    persistCMS({ ...data, news: nextNews }, "Đã lưu bài viết tin tức!");
    setEditingNews(null);
  };

  const deleteNews = (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    const nextNews = data.news.filter((n) => n.id !== id);
    persistCMS({ ...data, news: nextNews }, "Đã xóa bài viết!");
  };

  // Handlers for Testimonials
  const saveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const exists = data.testimonials.some((t) => t.id === editingTestimonial.id);
    const nextTests = exists
      ? data.testimonials.map((t) => (t.id === editingTestimonial.id ? editingTestimonial : t))
      : [editingTestimonial, ...data.testimonials];
    persistCMS({ ...data, testimonials: nextTests }, "Đã lưu đánh giá khách hàng!");
    setEditingTestimonial(null);
  };

  const deleteTestimonial = (id: string) => {
    if (!confirm("Xóa đánh giá này?")) return;
    const nextTests = data.testimonials.filter((t) => t.id !== id);
    persistCMS({ ...data, testimonials: nextTests }, "Đã xóa đánh giá!");
  };

  // Handlers for Orders
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const nextOrders = data.orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    persistCMS({ ...data, orders: nextOrders }, `Đã cập nhật đơn ${orderId} -> ${status}`);
  };

  const deleteOrder = (orderId: string) => {
    if (!confirm("Xóa đơn hàng này?")) return;
    const nextOrders = data.orders.filter((o) => o.id !== orderId);
    persistCMS({ ...data, orders: nextOrders }, "Đã xóa đơn hàng!");
  };

  return (
    <div className="min-h-screen bg-cream text-plum flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-cream px-5 py-3.5 rounded-2xl shadow-2xl border border-sun/40 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emeraldSou shrink-0" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-72 bg-plum text-cream p-6 flex flex-col justify-between shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-cream/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sun text-plum font-display font-extrabold text-xl flex items-center justify-center">
                S
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg leading-none">
                  SOUMAKI CMS
                </h1>
                <span className="text-[11px] text-cream/60">Quản trị nội dung & Menu</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("bowls")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "bowls"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4" />
                Thực đơn (Sou-made)
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/15">
                {data.bowls.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ingredients")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "ingredients"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <Salad className="w-4 h-4" />
                Nguyên liệu Build-Bowl
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/15">
                {data.ingredients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                Đơn đặt món
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-coral text-white">
                {data.orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "news"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <Newspaper className="w-4 h-4" />
                Tin tức & Sự kiện
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/15">
                {data.news.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "testimonials"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquareQuote className="w-4 h-4" />
                Đánh giá khách hàng
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-black/15">
                {data.testimonials.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("siteConfig")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "siteConfig"
                  ? "bg-sun text-plum shadow-md"
                  : "text-cream/80 hover:bg-cream/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                Cấu hình Trang chủ
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-cream/15 space-y-2.5 mt-6">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl bg-emeraldSou text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem Trang Chủ Thực Tế</span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportJSON}
              className="py-2 px-3 rounded-xl bg-cream/10 hover:bg-cream/20 text-cream text-xs font-semibold flex items-center justify-center gap-1.5"
              title="Tải file backup JSON"
            >
              <Download className="w-3.5 h-3.5" /> Backup
            </button>
            <button
              onClick={handleResetDefault}
              className="py-2 px-3 rounded-xl bg-cream/10 hover:bg-coral text-cream text-xs font-semibold flex items-center justify-center gap-1.5"
              title="Khôi phục dữ liệu mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Mặc định
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">
        {/* Top KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cream-light rounded-2xl p-4 border border-plum/10">
            <span className="text-[11px] font-bold uppercase text-plum/60">
              Menu Sou-made Bowls
            </span>
            <div className="font-display text-2xl font-extrabold text-plum mt-1">
              {data.bowls.length} món
            </div>
          </div>
          <div className="bg-cream-light rounded-2xl p-4 border border-plum/10">
            <span className="text-[11px] font-bold uppercase text-plum/60">
              Nguyên liệu tự chọn
            </span>
            <div className="font-display text-2xl font-extrabold text-emeraldSou mt-1">
              {data.ingredients.length} món
            </div>
          </div>
          <div className="bg-cream-light rounded-2xl p-4 border border-plum/10">
            <span className="text-[11px] font-bold uppercase text-plum/60">
              Tin tức & Đánh giá
            </span>
            <div className="font-display text-2xl font-extrabold text-plum mt-1">
              {data.news.length + data.testimonials.length} mục
            </div>
          </div>
          <div className="bg-cream-light rounded-2xl p-4 border border-plum/10">
            <span className="text-[11px] font-bold uppercase text-plum/60">
              Đơn đặt hàng
            </span>
            <div className="font-display text-2xl font-extrabold text-coral mt-1">
              {data.orders.length} đơn
            </div>
          </div>
        </div>

        {/* TAB 1: QUẢN LÝ THỰC ĐƠN (SOU-MADE BOWLS) */}
        {activeTab === "bowls" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                  Quản lý Thực đơn (Sou-made Bowls)
                </h2>
                <p className="text-xs sm:text-sm text-plum/70">
                  Thêm, chỉnh sửa hoặc xóa các phần ăn thiết kế sẵn cùng chỉ số Calo, Protein, Carbs, Fat.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingBowl({
                    id: `bowl-${Date.now()}`,
                    code: `B${String(data.bowls.length + 1).padStart(2, "0")}`,
                    name: "",
                    category: "Cân bằng",
                    ingredients: "",
                    calories: 450,
                    protein: 35,
                    carbs: 45,
                    fat: 14,
                    price: 129000,
                    image:
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                    featured: true,
                  })
                }
                className="px-5 py-3 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Thêm Phần Ăn Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.bowls.map((bowl) => (
                <div
                  key={bowl.id}
                  className="bg-cream-pure rounded-3xl p-4 sm:p-5 border border-plum/10 flex gap-4 items-center shadow-sm"
                >
                  <img
                    src={bowl.image}
                    alt={bowl.name}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-cream"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-plum text-cream text-[10px] font-extrabold">
                        {bowl.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sun text-plum text-[10px] font-extrabold">
                        {bowl.category}
                      </span>
                      <span className="text-xs font-extrabold text-emeraldSou flex items-center gap-0.5">
                        <Flame className="w-3.5 h-3.5" /> {bowl.calories} kcal
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-base text-plum truncate">
                      {bowl.name}
                    </h3>
                    <p className="text-xs text-plum/65 line-clamp-1 mb-2">
                      {bowl.ingredients}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-plum/80 space-x-2">
                        <span>P: {bowl.protein}g</span>
                        <span>C: {bowl.carbs}g</span>
                        <span>F: {bowl.fat}g</span>
                        <span className="text-plum font-extrabold">
                          • {formatVND(bowl.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingBowl({ ...bowl })}
                          className="p-2 rounded-xl bg-cream hover:bg-sun text-plum transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBowl(bowl.id)}
                          className="p-2 rounded-xl bg-cream hover:bg-coral hover:text-white text-plum transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: NGUYÊN LIỆU BUILD YOUR OWN BOWL */}
        {activeTab === "ingredients" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                  Nguyên liệu &quot;Build Your Own Bowl&quot;
                </h2>
                <p className="text-xs sm:text-sm text-plum/70">
                  Quản lý các nguyên liệu theo 4 bước (Đạm, Tinh bột, Ăn kèm, Xốt) để khách tự tính Calo & Giá.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingIngredient({
                    id: `ing-${Date.now()}`,
                    name: "",
                    step: ingStepFilter === "all" ? "protein" : ingStepFilter,
                    description: "",
                    calories: 120,
                    protein: 20,
                    carbs: 5,
                    fat: 3,
                    price: 35000,
                    badge: "Mới",
                    emoji: "🥗",
                  })
                }
                className="px-5 py-3 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Thêm Nguyên Liệu
              </button>
            </div>

            {/* Filter by Step */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Tất cả" },
                { key: "protein", label: "Bước 1: Đạm (Sous-vide)" },
                { key: "carb", label: "Bước 2: Tinh bột" },
                { key: "veggie", label: "Bước 3: Ăn kèm (Rau củ)" },
                { key: "sauce", label: "Bước 4: Xốt" },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setIngStepFilter(st.key as "all" | IngredientStep)}
                  className={`px-4 py-2 rounded-full text-xs font-bold ${
                    ingStepFilter === st.key
                      ? "bg-plum text-cream"
                      : "bg-cream-light text-plum border border-plum/15"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.ingredients
                .filter((i) => ingStepFilter === "all" || i.step === ingStepFilter)
                .map((ing) => (
                  <div
                    key={ing.id}
                    className="bg-cream-pure rounded-2xl p-4 border border-plum/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ing.emoji}</span>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-emeraldSou block">
                              {ing.step === "protein"
                                ? "BƯỚC 1: ĐẠM"
                                : ing.step === "carb"
                                ? "BƯỚC 2: TINH BỘT"
                                : ing.step === "veggie"
                                ? "BƯỚC 3: ĂN KÈM"
                                : "BƯỚC 4: XỐT"}
                            </span>
                            <h4 className="font-display font-bold text-sm text-plum">
                              {ing.name}
                            </h4>
                          </div>
                        </div>
                        {ing.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-sun text-plum text-[10px] font-extrabold">
                            {ing.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-plum/65 mb-3">{ing.description}</p>
                    </div>

                    <div className="pt-3 border-t border-plum/10 flex items-center justify-between">
                      <div className="text-[11px] font-bold text-plum/80">
                        <span className="text-coral font-extrabold">{ing.calories} kcal</span> • P:{" "}
                        {ing.protein}g • +{formatVND(ing.price)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingIngredient({ ...ing })}
                          className="p-1.5 rounded-lg bg-cream hover:bg-sun"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteIngredient(ing.id)}
                          className="p-1.5 rounded-lg bg-cream hover:bg-coral hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ ĐƠN ĐẶT HÀNG */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                Quản lý Đơn đặt món ({data.orders.length})
              </h2>
              <p className="text-xs sm:text-sm text-plum/70">
                Các đơn khách đặt từ giỏ hàng hoặc phần &quot;Build Your Own Bowl&quot; trên trang chủ sẽ hiển thị tại đây.
              </p>
            </div>

            {data.orders.length === 0 ? (
              <div className="bg-cream-pure rounded-3xl p-12 text-center border border-plum/10">
                <p className="font-display font-bold text-plum/60">Chưa có đơn hàng nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-cream-pure rounded-3xl p-6 border border-plum/15 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-plum/10">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-plum text-cream font-display font-extrabold text-xs">
                          {ord.id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-mint text-plum text-xs font-extrabold">
                          {ord.serviceType}
                        </span>
                        <span className="text-xs text-plum/60 font-semibold">
                          🕒 {ord.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            updateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className="px-3.5 py-1.5 rounded-full bg-sun text-plum text-xs font-extrabold border border-plum/20 focus:outline-none"
                        >
                          {(
                            [
                              "Mới",
                              "Đang chuẩn bị",
                              "Đang giao",
                              "Hoàn thành",
                              "Đã hủy",
                            ] as OrderStatus[]
                          ).map((st) => (
                            <option key={st} value={st}>
                              Trạng thái: {st}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteOrder(ord.id)}
                          className="p-2 rounded-full bg-cream hover:bg-coral hover:text-white text-plum transition-colors"
                          title="Xóa đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-5 space-y-1.5 text-xs sm:text-sm">
                        <p>
                          <strong>Khách hàng:</strong> {ord.customerName}
                        </p>
                        <p>
                          <strong>Điện thoại:</strong> {ord.phone}
                        </p>
                        <p>
                          <strong>Địa chỉ / Chi nhánh:</strong> {ord.address}
                        </p>
                        {ord.note && (
                          <p className="text-coral font-semibold">
                            <strong>Ghi chú:</strong> {ord.note}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-7 space-y-2">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-cream-light rounded-2xl p-3 border border-plum/10 flex items-start justify-between gap-3 text-xs"
                          >
                            <div>
                              <span className="font-extrabold text-plum">
                                {item.quantity}x {item.name}
                              </span>{" "}
                              <span className="text-emeraldSou font-bold">
                                ({item.calories} kcal)
                              </span>
                              <p className="text-plum/70 mt-0.5">{item.details}</p>
                            </div>
                            <span className="font-display font-extrabold text-plum shrink-0">
                              {formatVND(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 text-sm font-display font-extrabold text-plum">
                          <span>Tổng năng lượng: {ord.totalCalories} CALORIES</span>
                          <span className="text-lg text-coral">
                            Tổng tiền: {formatVND(ord.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TIN TỨC & SỰ KIỆN */}
        {activeTab === "news" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                  Quản lý Tin tức & Sự kiện (Blogs)
                </h2>
                <p className="text-xs sm:text-sm text-plum/70">
                  Cập nhật các bài viết sự kiện, ra mắt món mới tại mục &quot;MỚI! Chuyện nhà Soumaki&quot;.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingNews({
                    id: `news-${Date.now()}`,
                    badge: "MỚI!",
                    title: "",
                    excerpt: "",
                    content: "",
                    date: new Date().toLocaleDateString("vi-VN"),
                    image:
                      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
                  })
                }
                className="px-5 py-3 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Thêm Bài Viết Mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.news.map((post) => (
                <div
                  key={post.id}
                  className="bg-cream-pure rounded-3xl overflow-hidden border border-plum/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-coral text-white text-xs font-extrabold">
                        {post.badge}
                      </span>
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-plum/50 font-bold">{post.date}</span>
                      <h3 className="font-display font-extrabold text-lg text-plum mt-1 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-plum/75 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingNews({ ...post })}
                      className="px-3.5 py-1.5 rounded-xl bg-cream hover:bg-sun text-xs font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button
                      onClick={() => deleteNews(post.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-cream hover:bg-coral hover:text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ĐÁNH GIÁ KHÁCH HÀNG */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                  Đánh giá khách hàng (Testimonials)
                </h2>
                <p className="text-xs sm:text-sm text-plum/70">
                  Quản lý mục &quot;Nói có sách, mách có chứng – Khách hàng nói gì về Soumaki?&quot;
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingTestimonial({
                    id: `rev-${Date.now()}`,
                    customerName: "",
                    date: "Tháng Mười Một, 2026",
                    source: "Customer from Google",
                    rating: 5,
                    comment: "",
                  })
                }
                className="px-5 py-3 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Thêm Đánh Giá
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.testimonials.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-cream-pure rounded-2xl p-5 border border-plum/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-extrabold text-sm text-plum">
                        {rev.customerName}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-mint text-plum font-bold">
                        {rev.source}
                      </span>
                    </div>
                    <p className="text-xs text-plum/80 italic mb-4">“{rev.comment}”</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-plum/10 text-xs">
                    <span className="text-plum/50">{rev.date}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingTestimonial({ ...rev })}
                        className="p-1.5 rounded-lg bg-cream hover:bg-sun"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTestimonial(rev.id)}
                        className="p-1.5 rounded-lg bg-cream hover:bg-coral hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CẤU HÌNH TRANG CHỦ & THÔNG TIN LIÊN HỆ */}
        {activeTab === "siteConfig" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              persistCMS(data, "Đã cập nhật cấu hình Trang chủ!");
            }}
            className="space-y-6 bg-cream-pure rounded-3xl p-6 sm:p-8 border border-plum/10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-plum/10">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-plum">
                  Cấu hình Nội dung Trang chủ & Liên hệ
                </h2>
                <p className="text-xs text-plum/70">
                  Thay đổi khẩu hiệu, thanh chữ chạy Marquee, Sứ mệnh và thông tin cửa hàng.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Tên thương hiệu
                </label>
                <input
                  type="text"
                  value={data.siteConfig.brandName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, brandName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Tiêu đề lớn Hero (H1)
                </label>
                <input
                  type="text"
                  value={data.siteConfig.heroTitle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, heroTitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Thanh chữ chạy trên cùng (Top Marquee)
                </label>
                <input
                  type="text"
                  value={data.siteConfig.marqueeText}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, marqueeText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Mô tả Hero Banner
                </label>
                <textarea
                  rows={2}
                  value={data.siteConfig.heroSubtitle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, heroSubtitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Tiêu đề Sứ mệnh
                </label>
                <input
                  type="text"
                  value={data.siteConfig.missionTitle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, missionTitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Câu trích dẫn Sứ mệnh
                </label>
                <input
                  type="text"
                  value={data.siteConfig.missionQuote}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, missionQuote: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={data.siteConfig.contactEmail}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, contactEmail: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase mb-1.5">
                  Số điện thoại Hotline
                </label>
                <input
                  type="text"
                  value={data.siteConfig.contactPhone}
                  onChange={(e) =>
                    setData({
                      ...data,
                      siteConfig: { ...data.siteConfig, contactPhone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            {/* 3 Services Editor */}
            <div className="pt-4 border-t border-plum/10 space-y-4">
              <h3 className="font-display font-extrabold text-base text-plum">
                3 Thẻ Dịch Vụ (Ăn tại chỗ / Giao hàng / Catering)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.siteConfig.services.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="bg-cream rounded-2xl p-4 border border-plum/15 space-y-2.5"
                  >
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const nextSrvs = [...data.siteConfig.services];
                        nextSrvs[idx] = { ...srv, title: e.target.value };
                        setData({
                          ...data,
                          siteConfig: { ...data.siteConfig, services: nextSrvs },
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-cream-pure border border-plum/20 font-bold text-sm"
                    />
                    <textarea
                      rows={3}
                      value={srv.description}
                      onChange={(e) => {
                        const nextSrvs = [...data.siteConfig.services];
                        nextSrvs[idx] = { ...srv, description: e.target.value };
                        setData({
                          ...data,
                          siteConfig: { ...data.siteConfig, services: nextSrvs },
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-cream-pure border border-plum/20 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </main>

      {/* MODAL EDIT BOWL */}
      {editingBowl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveBowl}
            className="bg-cream-pure text-plum max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-plum/10">
              <h3 className="font-display text-xl font-extrabold">
                Chi tiết Phần ăn (Sou-made Bowl)
              </h3>
              <button
                type="button"
                onClick={() => setEditingBowl(null)}
                className="p-1.5 rounded-full bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Mã tô (VD: B01)</label>
                <input
                  type="text"
                  required
                  value={editingBowl.code}
                  onChange={(e) => setEditingBowl({ ...editingBowl, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold block mb-1">Nhóm nhu cầu</label>
                <select
                  value={editingBowl.category}
                  onChange={(e) =>
                    setEditingBowl({
                      ...editingBowl,
                      category: e.target.value as BowlCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                >
                  <option value="Ít calo">Ít calo</option>
                  <option value="Cân bằng">Cân bằng</option>
                  <option value="Giàu đạm">Giàu đạm</option>
                  <option value="Chay">Chay</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Tên phần ăn *</label>
              <input
                type="text"
                required
                value={editingBowl.name}
                onChange={(e) => setEditingBowl({ ...editingBowl, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">
                Thành phần nguyên liệu *
              </label>
              <textarea
                rows={2}
                required
                value={editingBowl.ingredients}
                onChange={(e) =>
                  setEditingBowl({ ...editingBowl, ingredients: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Calories</label>
                <input
                  type="number"
                  required
                  value={editingBowl.calories}
                  onChange={(e) =>
                    setEditingBowl({ ...editingBowl, calories: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingBowl.protein}
                  onChange={(e) =>
                    setEditingBowl({ ...editingBowl, protein: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingBowl.carbs}
                  onChange={(e) =>
                    setEditingBowl({ ...editingBowl, carbs: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingBowl.fat}
                  onChange={(e) =>
                    setEditingBowl({ ...editingBowl, fat: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={editingBowl.price}
                  onChange={(e) =>
                    setEditingBowl({ ...editingBowl, price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Link ảnh món ăn</label>
              <input
                type="url"
                required
                value={editingBowl.image}
                onChange={(e) => setEditingBowl({ ...editingBowl, image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingBowl(null)}
                className="px-5 py-2.5 rounded-full bg-cream text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou"
              >
                Lưu Phần Ăn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT INGREDIENT */}
      {editingIngredient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveIngredient}
            className="bg-cream-pure text-plum max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-plum/10">
              <h3 className="font-display text-xl font-extrabold">
                Nguyên liệu &quot;Build Your Bowl&quot;
              </h3>
              <button
                type="button"
                onClick={() => setEditingIngredient(null)}
                className="p-1.5 rounded-full bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Emoji</label>
                <input
                  type="text"
                  value={editingIngredient.emoji}
                  onChange={(e) =>
                    setEditingIngredient({ ...editingIngredient, emoji: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold block mb-1">Nhóm Bước</label>
                <select
                  value={editingIngredient.step}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      step: e.target.value as IngredientStep,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                >
                  <option value="protein">Bước 1: Đạm (Sous-vide)</option>
                  <option value="carb">Bước 2: Tinh bột</option>
                  <option value="veggie">Bước 3: Ăn kèm (Rau củ)</option>
                  <option value="sauce">Bước 4: Xốt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold block mb-1">Tên nguyên liệu *</label>
                <input
                  type="text"
                  required
                  value={editingIngredient.name}
                  onChange={(e) =>
                    setEditingIngredient({ ...editingIngredient, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Nhãn (Badge)</label>
                <input
                  type="text"
                  value={editingIngredient.badge || ""}
                  onChange={(e) =>
                    setEditingIngredient({ ...editingIngredient, badge: e.target.value })
                  }
                  placeholder="Sous-vide 4h"
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Mô tả ngắn</label>
              <input
                type="text"
                value={editingIngredient.description}
                onChange={(e) =>
                  setEditingIngredient({
                    ...editingIngredient,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="text-xs font-bold block mb-1">Calories</label>
                <input
                  type="number"
                  required
                  value={editingIngredient.calories}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      calories: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingIngredient.protein}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      protein: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingIngredient.carbs}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      carbs: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingIngredient.fat}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      fat: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={editingIngredient.price}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingIngredient(null)}
                className="px-5 py-2.5 rounded-full bg-cream text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou"
              >
                Lưu Nguyên Liệu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT NEWS */}
      {editingNews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveNews}
            className="bg-cream-pure text-plum max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-plum/10">
              <h3 className="font-display text-xl font-extrabold">
                Bài viết Tin tức & Sự kiện
              </h3>
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="p-1.5 rounded-full bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Nhãn (VD: MỚI!)</label>
                <input
                  type="text"
                  required
                  value={editingNews.badge}
                  onChange={(e) => setEditingNews({ ...editingNews, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Ngày đăng</label>
                <input
                  type="text"
                  required
                  value={editingNews.date}
                  onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Tiêu đề bài viết *</label>
              <input
                type="text"
                required
                value={editingNews.title}
                onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Tóm tắt ngắn *</label>
              <textarea
                rows={2}
                required
                value={editingNews.excerpt}
                onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Nội dung chi tiết</label>
              <textarea
                rows={4}
                value={editingNews.content}
                onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Link ảnh bài viết</label>
              <input
                type="url"
                required
                value={editingNews.image}
                onChange={(e) => setEditingNews({ ...editingNews, image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingNews(null)}
                className="px-5 py-2.5 rounded-full bg-cream text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou"
              >
                Lưu Bài Viết
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT TESTIMONIAL */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveTestimonial}
            className="bg-cream-pure text-plum max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-plum/10">
              <h3 className="font-display text-xl font-extrabold">
                Đánh giá của khách hàng
              </h3>
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="p-1.5 rounded-full bg-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Tên khách hàng *</label>
              <input
                type="text"
                required
                value={editingTestimonial.customerName}
                onChange={(e) =>
                  setEditingTestimonial({
                    ...editingTestimonial,
                    customerName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Nguồn đánh giá</label>
                <select
                  value={editingTestimonial.source}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      source: e.target.value as Testimonial["source"],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                >
                  <option value="Customer from Google">Customer from Google</option>
                  <option value="Customer from GrabFood">Customer from GrabFood</option>
                  <option value="Customer from ShopeeFood">Customer from ShopeeFood</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Thời gian</label>
                <input
                  type="text"
                  value={editingTestimonial.date}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Nội dung nhận xét *</label>
              <textarea
                rows={3}
                required
                value={editingTestimonial.comment}
                onChange={(e) =>
                  setEditingTestimonial({
                    ...editingTestimonial,
                    comment: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-cream border border-plum/20 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-5 py-2.5 rounded-full bg-cream text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou"
              >
                Lưu Đánh Giá
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
