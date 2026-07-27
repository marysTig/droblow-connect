import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type DeliveryType = "home" | "desk";

export interface ShippingRate {
  wilaya_id: string;
  wilaya_name: string;
  home_delivery: number;
  desk_delivery: number;
  is_available: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string | null;
  subcategories: string[] | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  images: string[] | null;
  price: number;
  category: string;
  subcategory: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  id_commande_review: string | null;
  affiliate_id: string | null;
  affiliate_name: string | null;
  product_id: string | null;
  product_name: string;
  quantity: number;
  selling_price: number;
  commission: number;
  customer_name: string;
  phone: string;
  wilaya: string;
  commune: string | null;
  address?: string;
  delivery_type: DeliveryType | null;
  delivery_price: number;
  status: OrderStatus;
  cancellation_reason: string | null;
  created_at: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  wilaya: string | null;
  commune: string | null;
  payout_method: string | null;
  account_number: string | null;
  status: "active" | "pending" | "suspended";
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  joined: string;
}

export interface Withdrawal {
  id: string;
  affiliate_id: string | null;
  amount: number;
  method: "CCP" | "BaridiMob" | "Bank transfer" | "Flixy";
  account_number: string | null;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  text: string;
  avatar: string | null;
  rating: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface PlatformStats {
  active_affiliates: number;
  products_count: number;
  orders_delivered: number;
  commissions_paid: number;
}

export interface EarningsChart {
  month: string;
  year: number;
  earnings: number;
  orders: number;
}

export type NotificationType = "product_launch" | "withdrawal_update" | "commission_unlocked" | "order_update";

export interface Notification {
  id: string;
  affiliate_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  affiliate_id: string | null;
  affiliate_name: string | null;
  affiliate_email: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  admin_reply: string | null;
  messages?: { role: "admin" | "affiliate"; content: string; created_at: string }[];
  created_at: string;
  updated_at: string;
}
