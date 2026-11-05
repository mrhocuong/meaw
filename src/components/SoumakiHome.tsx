"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  ShoppingBag,
  Sparkles,
  Check,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Star,
  Settings,
  Utensils,
  Truck,
  Users,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  BowlCategory,
  BowlIngredient,
  CMSData,
  IngredientStep,
  MenuBowl,
  NewsPost,
  OrderCartItem,
} from "@/types/cms";

interface SoumakiHomeProps {
  initialData: CMSData;
}

const CATEGORIES: ("Tất cả" | BowlCategory)[] = [
  "Tất cả",
  "Ít calo",
  "Cân bằng",
  "Giàu đạm",
  "Chay",
];

const STEP_META: {
  key: IngredientStep;
  stepNum: string;
  title: string;
  subtitle: string;
  multi: boolean;
}[] = [
  {
    key: "protein",
    stepNum: "BƯỚC 1",
    title: "Đạm (Sous-vide)",
    subtitle:
      "Bằng kỹ thuật Sous-Vide, nấu chậm ở nhiệt độ thấp, các món thịt tại Soumaki được giữ trọn dinh dưỡng, mềm ẩm khó cưỡng và bùng nổ vị ngon nguyên bản.",
    multi: true,
  },
  {
    key: "carb",
    stepNum: "BƯỚC 2",
    title: "Tinh bột",
    subtitle:
      "Khẩu phần tinh bột đa dạng, hợp lý vừa chiều khẩu vị, vừa tiếp năng lượng bền bỉ cho cả cơ thể.",
    multi: false,
  },
  {
    key: "veggie",
    stepNum: "BƯỚC 3",
    title: "Ăn kèm (Rau củ)",
    subtitle:
      "Rau củ tươi mới mỗi ngày, sẵn sàng 'tưới mát' và thanh lọc tâm trí (Chọn tối đa 5 món ăn kèm).",
    multi: true,
  },
  {
    key: "sauce",
    stepNum: "BƯỚC 4",
    title: "Xốt (Signature)",
    subtitle:
      "Linh hồn của bữa tiệc ngon-lành. Đổi gió với xốt mới mỗi ngày chính là thú vui của bữa ăn healthy tại Soumaki.",
    multi: false,
  },
];

export default function SoumakiHome({ initialData }: SoumakiHomeProps) {
  const [data] = useState<CMSData>(initialData);
  const { siteConfig, bowls, ingredients, news, testimonials } = data;

  // Language toggle (VI / EN)
  const [lang, setLang] = useState<"vi" | "en">("vi");

  // Menu Filter States
  const [selectedCategory, setSelectedCategory] = useState<"Tất cả" | BowlCategory>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxCalorieFilter, setMaxCalorieFilter] = useState<number>(700);

  // Build Your Own Bowl States
  const [activeStep, setActiveStep] = useState<IngredientStep>("protein");
  const [selectedProteins, setSelectedProteins] = useState<string[]>(() => {
    const first = ingredients.find((i) => i.step === "protein");
    return first ? [first.id] : [];
  });
  const [selectedCarb, setSelectedCarb] = useState<string>(() => {
    const first = ingredients.find((i) => i.step === "carb");
    return first ? first.id : "";
  });
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>(() => {
    return ingredients
      .filter((i) => i.step === "veggie")
      .slice(0, 3)
      .map((i) => i.id);
  });
  const [selectedSauce, setSelectedSauce] = useState<string>(() => {
    const first = ingredients.find((i) => i.step === "sauce");
    return first ? first.id : "";
  });

  // Cart & Checkout Drawer
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // News Modal
  const [activeNews, setActiveNews] = useState<NewsPost | null>(null);

  // Checkout Form
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState<"Giao hàng" | "Ăn tại chỗ" | "Catering">("Giao hàng");
  const [note, setNote] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Filtered Bowls
  const filteredBowls = useMemo(() => {
    return bowls.filter((bowl) => {
      const matchCat = selectedCategory === "Tất cả" || bowl.category === selectedCategory;
      const matchSearch =
        bowl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bowl.ingredients.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bowl.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCal = bowl.calories <= maxCalorieFilter;
      return matchCat && matchSearch && matchCal;
    });
  }, [bowls, selectedCategory, searchQuery, maxCalorieFilter]);

  // Calculate Custom Bowl Macros & Price
  const customBowlSummary = useMemo(() => {
    const chosenIds = new Set([
      ...selectedProteins,
      ...(selectedCarb ? [selectedCarb] : []),
      ...selectedVeggies,
      ...(selectedSauce ? [selectedSauce] : []),
    ]);
    const chosenItems = ingredients.filter((ing) => chosenIds.has(ing.id));

    const totals = chosenItems.reduce(
      (acc, item) => ({
        calories: acc.calories + Number(item.calories || 0),
        protein: +(acc.protein + Number(item.protein || 0)).toFixed(1),
        carbs: +(acc.carbs + Number(item.carbs || 0)).toFixed(1),
        fat: +(acc.fat + Number(item.fat || 0)).toFixed(1),
        price: acc.price + Number(item.price || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 }
    );

    return {
      items: chosenItems,
      ...totals,
    };
  }, [ingredients, selectedProteins, selectedCarb, selectedVeggies, selectedSauce]);

  const toggleIngredient = (ing: BowlIngredient) => {
    if (ing.step === "protein") {
      setSelectedProteins((prev) =>
        prev.includes(ing.id) ? prev.filter((id) => id !== ing.id) : [...prev, ing.id]
      );
    } else if (ing.step === "carb") {
      setSelectedCarb((prev) => (prev === ing.id ? "" : ing.id));
    } else if (ing.step === "veggie") {
      setSelectedVeggies((prev) => {
        if (prev.includes(ing.id)) return prev.filter((id) => id !== ing.id);
        if (prev.length >= 5) {
          showToast("Bạn có thể chọn tối đa 5 món ăn kèm!");
          return prev;
        }
        return [...prev, ing.id];
      });
    } else if (ing.step === "sauce") {
      setSelectedSauce((prev) => (prev === ing.id ? "" : ing.id));
    }
  };

  const isIngredientSelected = (ing: BowlIngredient) => {
    if (ing.step === "protein") return selectedProteins.includes(ing.id);
    if (ing.step === "carb") return selectedCarb === ing.id;
    if (ing.step === "veggie") return selectedVeggies.includes(ing.id);
    if (ing.step === "sauce") return selectedSauce === ing.id;
    return false;
  };

  const resetCustomBowl = () => {
    setSelectedProteins([]);
    setSelectedCarb("");
    setSelectedVeggies([]);
    setSelectedSauce("");
    showToast("Đã làm mới tô tự chọn!");
  };

  // Add Pre-made Bowl to Cart
  const addSouMadeToCart = (bowl: MenuBowl) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === bowl.id);
      if (existing) {
        return prev.map((i) => (i.id === bowl.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: bowl.id,
          name: `${bowl.code} - ${bowl.name}`,
          type: "sou-made",
          details: bowl.ingredients,
          calories: bowl.calories,
          protein: bowl.protein,
          carbs: bowl.carbs,
          fat: bowl.fat,
          price: bowl.price,
          quantity: 1,
        },
      ];
    });
    showToast(`Đã thêm "${bowl.code} - ${bowl.name}" vào giỏ hàng!`);
  };

  // Add Custom Built Bowl to Cart
  const addCustomBowlToCart = () => {
    if (customBowlSummary.items.length === 0) {
      showToast("Vui lòng chọn ít nhất 1 nguyên liệu cho tô của bạn!");
      return;
    }
    const details = customBowlSummary.items.map((i) => i.name).join(", ");
    const newItem: OrderCartItem = {
      id: `custom-${Date.now()}`,
      name: "Tô Healthy Tự Chọn (Build Your Bowl)",
      type: "custom-bowl",
      details,
      calories: customBowlSummary.calories,
      protein: customBowlSummary.protein,
      carbs: customBowlSummary.carbs,
      fat: customBowlSummary.fat,
      price: customBowlSummary.price,
      quantity: 1,
    };
    setCart((prev) => [...prev, newItem]);
    showToast(`Đã thêm Tô Tự Chọn (${customBowlSummary.calories} Calo) vào giỏ!`);
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotals = useMemo(() => {
    return cart.reduce(
      (acc, item) => ({
        count: acc.count + item.quantity,
        calories: acc.calories + item.calories * item.quantity,
        protein: +(acc.protein + item.protein * item.quantity).toFixed(1),
        carbs: +(acc.carbs + item.carbs * item.quantity).toFixed(1),
        fat: +(acc.fat + item.fat * item.quantity).toFixed(1),
        price: acc.price + item.price * item.quantity,
      }),
      { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 }
    );
  }, [cart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      showToast("Vui lòng nhập Họ tên và Số điện thoại!");
      return;
    }
    setIsSubmittingOrder(true);
    try {
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          order: {
            id: orderId,
            customerName,
            phone,
            address: address || "Nhận tại cửa hàng",
            serviceType,
            note,
            items: cart,
            totalCalories: cartTotals.calories,
            totalPrice: cartTotals.price,
            status: "Mới",
            createdAt,
          },
        }),
      });
      if (res.ok) {
        setOrderSuccessId(orderId);
        setCart([]);
        setCustomerName("");
        setPhone("");
        setAddress("");
        setNote("");
      } else {
        showToast("Có lỗi xảy ra khi gửi đơn, vui lòng thử lại.");
      }
    } catch {
      showToast("Không thể kết nối máy chủ.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  return (
    <div className="min-h-screen bg-cream text-plum flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-cream px-5 py-3.5 rounded-2xl shadow-2xl border border-sun/30 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-sun shrink-0" />
          <span className="font-medium text-sm">{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP MARQUEE BAR (Like Unlimited Elements Marquee on Soumaki) */}
      <div className="bg-plum text-cream py-2.5 overflow-hidden border-b border-plum/10 text-xs sm:text-sm font-medium tracking-wide">
        <div className="animate-marquee">
          {[0, 1, 2, 3].map((idx) => (
            <span key={idx} className="mx-8 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-emeraldSou" />
              {siteConfig.marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* 2. STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-plum/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-plum text-cream flex items-center justify-center font-display font-extrabold text-xl group-hover:bg-emeraldSou transition-colors">
              S
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-plum block leading-none">
                {siteConfig.brandName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-plum/60 font-semibold">
                Healthy Soulmate
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-plum/85">
            <a href="#build-bowl" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Tính calories" : "Calorie Calculator"}
            </a>
            <a href="#menu" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Thực đơn" : "Sou-made Menu"}
            </a>
            <a href="#services" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Dịch vụ" : "Services"}
            </a>
            <a href="#about" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Về chúng tôi" : "Our Mission"}
            </a>
            <a href="#blogs" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Blogs" : "News"}
            </a>
            <a href="#stores" className="hover:text-coral transition-colors">
              {lang === "vi" ? "Cửa hàng" : "Stores"}
            </a>
          </nav>

          {/* Right Actions: Language, CMS Link, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher (Polylang style) */}
            <button
              onClick={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
              className="px-3 py-1.5 rounded-full border border-plum/20 text-xs font-bold uppercase hover:bg-plum hover:text-cream transition-colors"
              title="Chuyển ngôn ngữ VI / EN"
            >
              {lang === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}
            </button>

            {/* Quick Link to CMS Admin */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cream-light border border-plum/20 text-plum text-xs sm:text-sm font-bold hover:bg-sun transition-colors"
            >
              <Settings className="w-4 h-4 text-coral" />
              <span className="hidden sm:inline">Quản trị CMS</span>
              <span className="sm:hidden">CMS</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => {
                setOrderSuccessId(null);
                setIsCartOpen(true);
              }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-plum-light transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-sun" />
              <span>{lang === "vi" ? "Đặt món" : "Order"}</span>
              {cartTotals.count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-coral text-white text-xs font-extrabold">
                  {cartTotals.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-10 pb-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint text-plum text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emeraldSou" />
                {siteConfig.heroBadge}
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-plum tracking-tight leading-[1.05]">
                {siteConfig.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-plum/80 max-w-2xl leading-relaxed">
                {siteConfig.heroSubtitle}
              </p>

              {/* Key Highlights */}
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="px-3.5 py-1.5 rounded-xl bg-cream-light border border-plum/10 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-coral" /> Kiểm soát Calo & Macro chuẩn xác
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-cream-light border border-plum/10 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emeraldSou" /> Đạm nấu chậm Sous-vide 4 giờ
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-cream-light border border-plum/10 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emeraldSou" /> Rau củ tươi mới mỗi ngày
                </span>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <a
                  href="#build-bowl"
                  className="px-7 py-4 rounded-full bg-plum text-cream font-bold text-sm sm:text-base hover:bg-coral transition-all shadow-lg flex items-center gap-2.5"
                >
                  <span>Tự tạo Bowl & Tính Calo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#menu"
                  className="px-7 py-4 rounded-full bg-sun text-plum font-bold text-sm sm:text-base hover:bg-mint transition-all"
                >
                  Khám phá Sou-made Bowls
                </a>
              </div>
            </div>

            {/* Right Interactive Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-cream-light rounded-[2rem] p-6 sm:p-7 border-2 border-plum/10 shadow-xl">
                <div className="absolute -top-4 -right-3 bg-sun text-plum font-display font-extrabold text-xs uppercase px-4 py-2 rounded-full shadow-md border border-plum/15 rotate-3">
                  ✨ Best-Seller Bowl
                </div>

                {bowls[0] && (
                  <>
                    <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-5">
                      <img
                        src={bowls[0].image}
                        alt={bowls[0].name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-plum text-cream text-xs font-extrabold">
                          TÔ {bowls[0].code}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emeraldSou text-white text-xs font-extrabold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> {bowls[0].calories} CALORIES
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-extrabold text-plum">
                      {bowls[0].name}
                    </h3>
                    <p className="text-sm text-plum/70 mt-1 line-clamp-2">
                      {bowls[0].ingredients}
                    </p>

                    {/* Macro Pills */}
                    <div className="grid grid-cols-3 gap-2.5 my-4">
                      <div className="bg-mint/60 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-plum/70 block">
                          PROTEIN
                        </span>
                        <span className="font-display font-extrabold text-base text-plum">
                          {bowls[0].protein}g
                        </span>
                      </div>
                      <div className="bg-sun/60 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-plum/70 block">
                          CARBS
                        </span>
                        <span className="font-display font-extrabold text-base text-plum">
                          {bowls[0].carbs}g
                        </span>
                      </div>
                      <div className="bg-coral/20 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-plum/70 block">
                          FAT
                        </span>
                        <span className="font-display font-extrabold text-base text-plum">
                          {bowls[0].fat}g
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-plum/10">
                      <span className="font-display text-2xl font-extrabold text-plum">
                        {formatVND(bowls[0].price)}
                      </span>
                      <button
                        onClick={() => addSouMadeToCart(bowls[0])}
                        className="px-5 py-2.5 rounded-full bg-plum text-cream text-xs sm:text-sm font-bold hover:bg-emeraldSou transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Đặt phần ăn này
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DỊCH VỤ CỦA SOUMAKI (3 Signature Cards) */}
      <section id="services" className="py-14 bg-cream-light/60 border-y border-plum/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-emeraldSou mb-2">
              {siteConfig.servicesHeading}
            </h5>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-plum">
              Trọn vẹn trải nghiệm healthy mọi lúc, mọi nơi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {siteConfig.services.map((srv, idx) => {
              const bgClass =
                srv.bgColor === "mint"
                  ? "bg-mint text-plum"
                  : srv.bgColor === "sun"
                  ? "bg-sun text-plum"
                  : "bg-coral text-white";
              const IconComp = idx === 0 ? Utensils : idx === 1 ? Truck : Users;

              return (
                <div
                  key={srv.id}
                  className={`${bgClass} rounded-[2rem] p-8 flex flex-col justify-between transition-transform hover:-translate-y-1.5 shadow-md`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-black/10">
                        {srv.badge}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                        <IconComp className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="font-display text-3xl font-extrabold mb-3">
                      {srv.title}
                    </h3>
                    <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-8">
                      {srv.description}
                    </p>
                  </div>

                  <div>
                    <a
                      href={srv.ctaLink}
                      className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-colors ${
                        srv.bgColor === "coral"
                          ? "bg-plum text-cream hover:bg-cream hover:text-plum"
                          : "bg-plum text-cream hover:bg-plum-light"
                      }`}
                    >
                      <span>{srv.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. BUILD YOUR OWN HEALTHY BOWL & CALORIE CALCULATOR */}
      <section id="build-bowl" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-coral mb-2">
              {siteConfig.builderSubtitle}
            </h5>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-plum mb-3">
              {siteConfig.builderTitle}
            </h2>
            <p className="text-base sm:text-lg font-medium text-plum/75">
              {siteConfig.builderTagline}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: 4 Steps Selector */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STEP_META.map((st) => {
                  const isActive = activeStep === st.key;
                  const countSelected =
                    st.key === "protein"
                      ? selectedProteins.length
                      : st.key === "carb"
                      ? selectedCarb
                        ? 1
                        : 0
                      : st.key === "veggie"
                      ? selectedVeggies.length
                      : selectedSauce
                      ? 1
                      : 0;

                  return (
                    <button
                      key={st.key}
                      onClick={() => setActiveStep(st.key)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all ${
                        isActive
                          ? "bg-plum text-cream border-plum shadow-lg"
                          : "bg-cream-light text-plum border-plum/10 hover:border-plum/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isActive ? "text-sun" : "text-plum/60"
                          }`}
                        >
                          {st.stepNum}
                        </span>
                        {countSelected > 0 && (
                          <span
                            className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                              isActive ? "bg-emeraldSou text-white" : "bg-mint text-plum"
                            }`}
                          >
                            Đã chọn {countSelected}
                          </span>
                        )}
                      </div>
                      <div className="font-display font-extrabold text-sm sm:text-base">
                        {st.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Description */}
              {STEP_META.map(
                (st) =>
                  st.key === activeStep && (
                    <div
                      key={st.key}
                      className="bg-cream-light rounded-3xl p-6 sm:p-8 border border-plum/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-plum/10">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-widest text-emeraldSou">
                            {st.stepNum} • {st.multi ? "CHỌN NHIỀU MÓN" : "CHỌN 1 MÓN"}
                          </span>
                          <h3 className="font-display text-2xl font-extrabold text-plum mt-0.5">
                            {st.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-plum/70 max-w-md">
                          {st.subtitle}
                        </p>
                      </div>

                      {/* Ingredients Grid for Current Step */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ingredients
                          .filter((ing) => ing.step === st.key)
                          .map((ing) => {
                            const selected = isIngredientSelected(ing);
                            return (
                              <div
                                key={ing.id}
                                onClick={() => toggleIngredient(ing)}
                                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                                  selected
                                    ? "bg-mint/40 border-plum shadow-md"
                                    : "bg-cream-pure border-plum/10 hover:border-plum/30"
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-2xl">{ing.emoji || "🥗"}</span>
                                      <div>
                                        <h4 className="font-display font-bold text-base text-plum leading-snug">
                                          {ing.name}
                                        </h4>
                                        {ing.badge && (
                                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-sun text-plum text-[10px] font-extrabold uppercase">
                                            {ing.badge}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                        selected
                                          ? "bg-plum text-cream border-plum"
                                          : "border-plum/30"
                                      }`}
                                    >
                                      {selected && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                  </div>

                                  <p className="text-xs text-plum/70 mb-3 leading-relaxed">
                                    {ing.description}
                                  </p>
                                </div>

                                <div className="pt-2.5 border-t border-plum/10 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 font-bold text-plum/80">
                                    <span className="px-2 py-0.5 rounded-md bg-plum/10 text-plum">
                                      {ing.calories} kcal
                                    </span>
                                    <span>P: {ing.protein}g</span>
                                    <span>C: {ing.carbs}g</span>
                                    <span>F: {ing.fat}g</span>
                                  </div>
                                  <span className="font-display font-extrabold text-sm text-plum">
                                    +{formatVND(ing.price)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Next Step Navigation */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-plum/10">
                        <button
                          onClick={resetCustomBowl}
                          className="text-xs font-bold text-plum/70 hover:text-coral flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Chọn lại từ đầu
                        </button>
                        <div className="flex gap-2">
                          {activeStep !== "sauce" && (
                            <button
                              onClick={() => {
                                const order: IngredientStep[] = [
                                  "protein",
                                  "carb",
                                  "veggie",
                                  "sauce",
                                ];
                                const nextIdx = order.indexOf(activeStep) + 1;
                                if (nextIdx < order.length) setActiveStep(order[nextIdx]);
                              }}
                              className="px-5 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou transition-colors flex items-center gap-1.5"
                            >
                              <span>Bước tiếp theo</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>

            {/* Right 4 Cols: Sticky Live Nutrition & Calorie Calculator Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-plum text-cream rounded-[2rem] p-6 sm:p-7 shadow-2xl border border-plum-light">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-cream/15">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-sun block">
                      BẢNG DINH DƯỠNG TRỰC TIẾP
                    </span>
                    <h3 className="font-display text-xl font-extrabold">
                      Tô Healthy Của Bạn
                    </h3>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-2xl bg-emeraldSou text-white text-right">
                    <span className="font-display font-extrabold text-xl block leading-none">
                      {customBowlSummary.calories}
                    </span>
                    <span className="text-[10px] font-bold uppercase">CALORIES</span>
                  </div>
                </div>

                {/* Macro Progress Bars */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-cream/10 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-mint block">
                      PROTEIN (ĐẠM)
                    </span>
                    <span className="font-display font-extrabold text-lg text-white">
                      {customBowlSummary.protein}g
                    </span>
                  </div>
                  <div className="bg-cream/10 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-sun block">
                      CARBS (TINH BỘT)
                    </span>
                    <span className="font-display font-extrabold text-lg text-white">
                      {customBowlSummary.carbs}g
                    </span>
                  </div>
                  <div className="bg-cream/10 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-coral block">
                      FAT (CHẤT BÉO)
                    </span>
                    <span className="font-display font-extrabold text-lg text-white">
                      {customBowlSummary.fat}g
                    </span>
                  </div>
                </div>

                {/* Selected Ingredients List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mb-5">
                  {customBowlSummary.items.length === 0 ? (
                    <div className="text-center py-6 text-cream/60 text-xs border border-dashed border-cream/20 rounded-2xl">
                      Chọn nguyên liệu ở khung bên trái để tính toán lượng Calo & dinh dưỡng
                    </div>
                  ) : (
                    customBowlSummary.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-cream/10 px-3.5 py-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{item.emoji}</span>
                          <span className="font-semibold truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sun font-bold">{item.calories} kcal</span>
                          <button
                            onClick={() => toggleIngredient(item)}
                            className="text-cream/50 hover:text-coral"
                            title="Bỏ nguyên liệu"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Price & Add to Cart */}
                <div className="pt-4 border-t border-cream/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cream/75">Tổng cộng dự kiến:</span>
                    <span className="font-display text-2xl font-extrabold text-sun">
                      {formatVND(customBowlSummary.price)}
                    </span>
                  </div>
                  <button
                    onClick={addCustomBowlToCart}
                    className="w-full py-3.5 rounded-full bg-emeraldSou hover:bg-sun hover:text-plum text-white font-display font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Tô Tự Chọn Vào Giỏ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOU-MADE BOWLS (Menu with JetSmartFilters-style Filter) */}
      <section id="menu" className="py-16 lg:py-24 bg-cream-light border-t border-plum/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h5 className="text-xs font-extrabold uppercase tracking-widest text-emeraldSou mb-2">
                HOẶC CHỌN PHẦN ĂN THIẾT KẾ SẴN TRONG MENU
              </h5>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-plum">
                Sou-made bowls
              </h2>
            </div>

            {/* Search & Max Calorie Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-plum/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món, mã B01, cá hồi, bò..."
                  className="pl-9 pr-4 py-2.5 rounded-full bg-cream border border-plum/20 text-xs sm:text-sm text-plum placeholder:text-plum/45 focus:outline-none focus:border-plum"
                />
              </div>
              <div className="flex items-center gap-2 bg-cream px-4 py-2 rounded-full border border-plum/20 text-xs font-bold">
                <span>Tối đa: {maxCalorieFilter} kcal</span>
                <input
                  type="range"
                  min={400}
                  max={700}
                  step={20}
                  value={maxCalorieFilter}
                  onChange={(e) => setMaxCalorieFilter(Number(e.target.value))}
                  className="w-20 accent-plum cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills (DỰA VÀO NHU CẦU) */}
          <div className="flex flex-wrap items-center gap-2.5 mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-plum/60 mr-2">
              DỰA VÀO NHU CẦU:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? "bg-plum text-cream shadow-md"
                      : "bg-cream text-plum border border-plum/15 hover:bg-mint/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Bowls Grid */}
          {filteredBowls.length === 0 ? (
            <div className="text-center py-16 bg-cream rounded-3xl border border-plum/10">
              <p className="font-display text-lg font-bold text-plum/70">
                Không tìm thấy phần ăn phù hợp với bộ lọc hiện tại.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Tất cả");
                  setSearchQuery("");
                  setMaxCalorieFilter(700);
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-plum text-cream text-xs font-bold"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredBowls.map((bowl) => (
                <div
                  key={bowl.id}
                  className="bg-cream-pure rounded-[2rem] overflow-hidden border border-plum/10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Bowl Image & Top Badges */}
                    <div className="relative h-56 overflow-hidden bg-cream">
                      <img
                        src={bowl.image}
                        alt={bowl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-plum text-cream text-xs font-extrabold tracking-wide">
                          TÔ {bowl.code}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-sun text-plum text-xs font-extrabold">
                          {bowl.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 px-3.5 py-1 rounded-full bg-plum/90 backdrop-blur-sm text-sun text-xs font-extrabold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {bowl.calories} CALORIES
                      </div>
                    </div>

                    {/* Bowl Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-extrabold text-plum mb-1.5">
                        {bowl.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-plum/70 leading-relaxed min-h-[2.5rem]">
                        {bowl.ingredients}
                      </p>

                      {/* Macro Row (PROTEIN | CARBS | FAT) */}
                      <div className="grid grid-cols-3 gap-2 my-4 pt-4 border-t border-plum/10 text-center">
                        <div className="bg-mint/40 rounded-xl py-2 px-1">
                          <span className="text-[10px] font-extrabold text-plum/60 block">
                            PROTEIN
                          </span>
                          <span className="font-display font-extrabold text-sm text-plum">
                            {bowl.protein}g
                          </span>
                        </div>
                        <div className="bg-sun/40 rounded-xl py-2 px-1">
                          <span className="text-[10px] font-extrabold text-plum/60 block">
                            CARBS
                          </span>
                          <span className="font-display font-extrabold text-sm text-plum">
                            {bowl.carbs}g
                          </span>
                        </div>
                        <div className="bg-coral/15 rounded-xl py-2 px-1">
                          <span className="text-[10px] font-extrabold text-plum/60 block">
                            FAT
                          </span>
                          <span className="font-display font-extrabold text-sm text-plum">
                            {bowl.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-plum/50 block">
                        Giá phần ăn
                      </span>
                      <span className="font-display text-xl font-extrabold text-plum">
                        {formatVND(bowl.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addSouMadeToCart(bowl)}
                      className="px-5 py-2.5 rounded-full bg-plum text-cream text-xs font-bold hover:bg-emeraldSou transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tải phần ăn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. BANNER CÁ NHÂN HÓA ("Còn đắn đo? Để Soumaki lo.") */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-plum text-cream rounded-[2.5rem] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-2xl">
              <span className="px-3.5 py-1 rounded-full bg-sun text-plum text-xs font-extrabold uppercase">
                CÁ NHÂN HÓA BỮA ĂN HEALTHY
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight">
                Còn đắn đo? Để Soumaki lo.
              </h2>
              <p className="text-cream/80 text-sm sm:text-base">
                Bạn muốn tăng cơ, giảm mỡ hay giữ dáng? Chỉ cần chọn nhóm thực đơn phù hợp hoặc tự điều chỉnh từng gram Protein, Carbs và Fat theo đúng mục tiêu cơ thể bạn.
              </p>
            </div>
            <a
              href="#build-bowl"
              className="px-8 py-4 rounded-full bg-sun text-plum font-display font-extrabold text-sm sm:text-base hover:bg-mint transition-colors shrink-0 flex items-center gap-2"
            >
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. MỚI! TIN TỨC & SỰ KIỆN (#blogs) */}
      <section id="blogs" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h5 className="text-xs font-extrabold uppercase tracking-widest text-coral mb-2">
                TIN TỨC & SỰ KIỆN
              </h5>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-plum">
                Chuyện nhà Soumaki
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((post) => (
              <div
                key={post.id}
                className="bg-cream-light rounded-[2rem] overflow-hidden border border-plum/10 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-coral text-white text-xs font-extrabold uppercase">
                      {post.badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-plum/50 block mb-1.5">
                      {post.date}
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-plum mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-plum/75 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setActiveNews(post)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-plum hover:text-coral uppercase tracking-wider"
                  >
                    <span>Đọc thêm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SỨ MỆNH CỦA CHÚNG TÔI (#about) */}
      <section id="about" className="py-16 lg:py-24 bg-mint/40 border-y border-plum/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-plum text-cream text-xs font-extrabold uppercase tracking-widest">
            {siteConfig.missionBadge}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-plum leading-tight">
            {siteConfig.missionTitle}
          </h2>
          <p className="text-base sm:text-lg text-plum/80 max-w-3xl mx-auto leading-relaxed">
            {siteConfig.missionDescription}
          </p>
          <blockquote className="bg-cream-light p-6 sm:p-8 rounded-3xl border border-plum/10 max-w-2xl mx-auto shadow-sm">
            <p className="font-display text-lg sm:text-xl font-bold italic text-plum">
              “{siteConfig.missionQuote}”
            </p>
          </blockquote>
        </div>
      </section>

      {/* 10. KHÁCH HÀNG NÓI GÌ VỀ SOUMAKI? (#reviews) */}
      <section id="reviews" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-emeraldSou mb-2">
              {siteConfig.reviewsBadge}
            </h5>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-plum">
              {siteConfig.reviewsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((rev) => (
              <div
                key={rev.id}
                className="bg-cream-light rounded-3xl p-6 sm:p-7 border border-plum/10 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sun">
                      {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-4 h-4 fill-coral text-coral"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cream border border-plum/10 text-plum/70">
                      {rev.source}
                    </span>
                  </div>
                  <p className="text-sm text-plum/85 leading-relaxed mb-6">
                    “{rev.comment}”
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-plum/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-plum text-cream font-display font-bold text-sm flex items-center justify-center">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-plum">
                        {rev.customerName}
                      </h4>
                      <span className="text-[11px] text-plum/55">{rev.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CỬA HÀNG & FOOTER (#stores, #contact) */}
      <footer id="stores" className="bg-plum text-cream pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stores Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-14 border-b border-cream/15">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sun">
                MỜI BẠN ĐẾN DÙNG BỮA!
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold">
                Hệ thống cửa hàng {siteConfig.brandName}
              </h3>
              <p className="text-sm text-cream/75 leading-relaxed">
                Bạn có câu hỏi hoặc cần đặt tiệc Catering cho doanh nghiệp? Liên hệ ngay với {siteConfig.brandName} nhé!
              </p>
              <div className="space-y-2 pt-2 text-sm">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sun" />
                  <span>{siteConfig.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sun" />
                  <span>{siteConfig.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-sun" />
                  <span>{siteConfig.openHours}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {siteConfig.stores.map((st) => (
                <div
                  key={st.id}
                  className="bg-cream/10 rounded-3xl p-6 border border-cream/15 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-sun text-plum flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h4 className="font-display text-lg font-extrabold text-white mb-2">
                      {st.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-cream/80 leading-relaxed mb-4">
                      {st.address}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-cream/10 text-xs text-sun font-bold flex items-center justify-between">
                    <span>🕒 {st.hours}</span>
                    <span>📞 {st.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/65">
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-lg text-white">
                {siteConfig.brandName}
              </span>
              <span>•</span>
              <span>{siteConfig.foundedYear}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href={siteConfig.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sun transition-colors font-bold"
              >
                Facebook
              </a>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sun transition-colors font-bold"
              >
                Instagram
              </a>
              <Link
                href="/admin"
                className="text-sun hover:underline font-bold flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" /> Trang quản trị CMS (/admin)
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* NEWS READER MODAL */}
      {activeNews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-pure text-plum max-w-2xl w-full rounded-[2rem] overflow-hidden shadow-2xl border border-plum/15">
            <div className="relative h-64">
              <img
                src={activeNews.image}
                alt={activeNews.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveNews(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-plum text-cream flex items-center justify-center hover:bg-coral transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="absolute bottom-4 left-4 px-3.5 py-1 rounded-full bg-coral text-white text-xs font-extrabold">
                {activeNews.badge} • {activeNews.date}
              </span>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-plum">
                {activeNews.title}
              </h3>
              <p className="text-sm sm:text-base text-plum/85 leading-relaxed whitespace-pre-line">
                {activeNews.content || activeNews.excerpt}
              </p>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveNews(null)}
                  className="px-6 py-2.5 rounded-full bg-plum text-cream text-xs font-bold"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER CART & ORDER DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-cream-pure text-plum w-full max-w-lg h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 bg-plum text-cream flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-sun" />
                <div>
                  <h3 className="font-display font-extrabold text-lg leading-none">
                    Giỏ Phần Ăn Healthy
                  </h3>
                  <span className="text-xs text-cream/70">
                    Tổng dinh dưỡng: {cartTotals.calories} kcal (P: {cartTotals.protein}g • C:{" "}
                    {cartTotals.carbs}g • F: {cartTotals.fat}g)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center hover:bg-coral transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 space-y-6">
              {orderSuccessId ? (
                <div className="bg-mint/50 border-2 border-emeraldSou rounded-3xl p-8 text-center space-y-4 my-8">
                  <CheckCircle2 className="w-14 h-14 text-emeraldSou mx-auto" />
                  <h4 className="font-display text-2xl font-extrabold text-plum">
                    Đặt món thành công!
                  </h4>
                  <p className="text-sm text-plum/80">
                    Mã đơn hàng của bạn là{" "}
                    <span className="font-extrabold text-plum underline">{orderSuccessId}</span>.
                    Đơn hàng đã được lưu trực tiếp vào hệ thống CMS quản trị!
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/admin"
                      className="px-5 py-2.5 rounded-full bg-plum text-cream text-xs font-bold"
                    >
                      Xem đơn trong CMS (/admin)
                    </Link>
                    <button
                      onClick={() => {
                        setOrderSuccessId(null);
                        setIsCartOpen(false);
                      }}
                      className="px-5 py-2.5 rounded-full bg-cream border border-plum/20 text-xs font-bold"
                    >
                      Tiếp tục xem menu
                    </button>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto text-2xl">
                    🥗
                  </div>
                  <p className="font-display font-bold text-plum/70">
                    Giỏ hàng của bạn đang trống
                  </p>
                  <p className="text-xs text-plum/60 max-w-xs mx-auto">
                    Hãy tự tạo một tô healthy theo ý thích hoặc chọn các phần ăn Sou-made có sẵn trong menu nhé!
                  </p>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-cream-light rounded-2xl p-4 border border-plum/10 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                item.type === "custom-bowl"
                                  ? "bg-emeraldSou text-white"
                                  : "bg-sun text-plum"
                              }`}
                            >
                              {item.type === "custom-bowl" ? "Tự chọn" : "Sou-made"} •{" "}
                              {item.calories} kcal
                            </span>
                            <h4 className="font-display font-extrabold text-sm text-plum mt-1">
                              {item.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => updateCartQty(item.id, -item.quantity)}
                            className="text-plum/40 hover:text-coral"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-plum/70 leading-relaxed">{item.details}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-plum/10">
                          <span className="font-display font-extrabold text-sm text-plum">
                            {formatVND(item.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="w-7 h-7 rounded-full bg-cream border border-plum/20 flex items-center justify-center"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-extrabold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="w-7 h-7 rounded-full bg-plum text-cream flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-plum/15">
                    <h4 className="font-display font-extrabold text-base text-plum">
                      Thông tin đặt món
                    </h4>

                    <div className="grid grid-cols-3 gap-2">
                      {(["Giao hàng", "Ăn tại chỗ", "Catering"] as const).map((type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setServiceType(type)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                            serviceType === type
                              ? "bg-plum text-cream border-plum"
                              : "bg-cream text-plum border-plum/15"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Họ và tên của bạn *"
                        className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm focus:outline-none focus:border-plum"
                      />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số điện thoại *"
                        className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm focus:outline-none focus:border-plum"
                      />
                    </div>

                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={
                        serviceType === "Ăn tại chỗ"
                          ? "Chi nhánh muốn ghé (VD: 42 Lý Tự Trọng, Q1)"
                          : "Địa chỉ giao hàng chi tiết"
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm focus:outline-none focus:border-plum"
                    />

                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú cho bếp (VD: Ít xốt, không hành, giao lúc 12h...)"
                      className="w-full px-4 py-2.5 rounded-xl bg-cream border border-plum/20 text-sm focus:outline-none focus:border-plum"
                    />

                    <div className="bg-mint/40 rounded-2xl p-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-plum/80">
                        <span>Tổng năng lượng bữa ăn:</span>
                        <span>{cartTotals.calories} CALORIES</span>
                      </div>
                      <div className="flex justify-between text-base font-display font-extrabold text-plum">
                        <span>Tổng thanh toán:</span>
                        <span>{formatVND(cartTotals.price)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full py-4 rounded-full bg-plum text-cream font-display font-extrabold text-sm hover:bg-emeraldSou transition-colors shadow-lg"
                    >
                      {isSubmittingOrder ? "Đang gửi đơn..." : "Xác Nhận Đặt Món Ngay"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
