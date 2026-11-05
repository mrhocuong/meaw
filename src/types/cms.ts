export type BowlCategory = "Ít calo" | "Cân bằng" | "Giàu đạm" | "Chay";

export interface MenuBowl {
  id: string;
  code: string;
  name: string;
  category: BowlCategory;
  ingredients: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image: string;
  featured?: boolean;
}

export type IngredientStep = "protein" | "carb" | "veggie" | "sauce";

export interface BowlIngredient {
  id: string;
  name: string;
  step: IngredientStep;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  badge?: string;
  emoji: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgColor: "mint" | "sun" | "coral";
  badge: string;
}

export interface NewsPost {
  id: string;
  badge: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  date: string;
  source: "Customer from Google" | "Customer from GrabFood" | "Customer from ShopeeFood";
  rating: number;
  comment: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
}

export interface SiteConfig {
  brandName: string;
  marqueeText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  servicesHeading: string;
  services: ServiceItem[];
  builderSubtitle: string;
  builderTitle: string;
  builderTagline: string;
  missionBadge: string;
  missionTitle: string;
  missionDescription: string;
  missionQuote: string;
  reviewsBadge: string;
  reviewsTitle: string;
  contactEmail: string;
  contactPhone: string;
  openHours: string;
  facebookUrl: string;
  instagramUrl: string;
  foundedYear: string;
  stores: StoreLocation[];
}

export interface OrderCartItem {
  id: string;
  name: string;
  type: "sou-made" | "custom-bowl";
  details: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  quantity: number;
}

export type OrderStatus = "Mới" | "Đang chuẩn bị" | "Đang giao" | "Hoàn thành" | "Đã hủy";

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  serviceType: "Giao hàng" | "Ăn tại chỗ" | "Catering";
  note: string;
  items: OrderCartItem[];
  totalCalories: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CMSData {
  siteConfig: SiteConfig;
  bowls: MenuBowl[];
  ingredients: BowlIngredient[];
  news: NewsPost[];
  testimonials: Testimonial[];
  orders: Order[];
}
