import logo from "@/assets/droblow-logo.png.asset.json";

export const BRAND_LOGO = logo.url;

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  minPrice: number;
  suggestedPrice: number;
  commission: number;
  stock: number;
  category: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  commission: number;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  status: OrderStatus;
  createdAt: string;
}

export const WILAYAS = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif",
  "Tlemcen", "Béjaïa", "Tizi Ouzou", "Djelfa", "Skikda", "Chlef", "Biskra",
  "Ouargla", "Mostaganem", "Bordj Bou Arréridj", "Tiaret", "Médéa",
];

// Realistic images (Unsplash CDN)
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Earbuds Pro", description: "Bluetooth 5.3, ANC, 30h battery life.", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=70", minPrice: 3200, suggestedPrice: 4500, commission: 800, stock: 148, category: "Electronics" },
  { id: "p2", name: "Smart Watch Ultra", description: "AMOLED display, heart rate, GPS.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=70", minPrice: 5500, suggestedPrice: 7900, commission: 1400, stock: 92, category: "Electronics" },
  { id: "p3", name: "Portable Blender 500ml", description: "Rechargeable USB-C, 6 blades.", image: "https://images.unsplash.com/photo-1610088441520-4352457e7095?w=600&auto=format&fit=crop&q=70", minPrice: 2400, suggestedPrice: 3600, commission: 700, stock: 210, category: "Home" },
  { id: "p4", name: "LED Ring Light 26cm", description: "3 modes, tripod & phone holder.", image: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&auto=format&fit=crop&q=70", minPrice: 1900, suggestedPrice: 2900, commission: 600, stock: 175, category: "Accessories" },
  { id: "p5", name: "Massage Gun Pro", description: "6 heads, deep tissue therapy.", image: "https://images.unsplash.com/photo-1616279969722-d81a24d67e05?w=600&auto=format&fit=crop&q=70", minPrice: 4200, suggestedPrice: 6200, commission: 1100, stock: 65, category: "Health" },
  { id: "p6", name: "Air Fryer 5L Digital", description: "Touch screen, 8 presets.", image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=70", minPrice: 8900, suggestedPrice: 12500, commission: 2200, stock: 42, category: "Home" },
  { id: "p7", name: "Kids Educational Tablet", description: "7-inch, offline learning, parental control.", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=70", minPrice: 3800, suggestedPrice: 5500, commission: 950, stock: 118, category: "Kids" },
  { id: "p8", name: "Car Vacuum Cleaner", description: "12V, HEPA filter, LED light.", image: "https://images.unsplash.com/photo-1621570075289-2eb0d6c8b6a3?w=600&auto=format&fit=crop&q=70", minPrice: 2100, suggestedPrice: 3200, commission: 650, stock: 190, category: "Auto" },
  { id: "p9", name: "Silk Hair Straightener", description: "Ceramic plates, 5 heat levels.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=70", minPrice: 2800, suggestedPrice: 4200, commission: 850, stock: 133, category: "Beauty" },
];

const CUSTOMERS = [
  ["Amine Bouzid", "0555 12 34 56"], ["Sarah Benali", "0661 45 78 90"],
  ["Karim Haddad", "0770 33 22 11"], ["Yasmine Cherif", "0554 88 99 00"],
  ["Reda Meziane", "0699 11 22 33"], ["Nadia Boumediene", "0770 55 66 77"],
  ["Salim Ait Ali", "0555 99 88 77"], ["Lina Boudiaf", "0661 22 33 44"],
];

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "delivered", "delivered", "cancelled"];

export const ORDERS: Order[] = Array.from({ length: 24 }).map((_, i) => {
  const p = PRODUCTS[i % PRODUCTS.length];
  const [name, phone] = CUSTOMERS[i % CUSTOMERS.length];
  const qty = (i % 3) + 1;
  const price = p.suggestedPrice + (i % 4 === 0 ? 200 : 0);
  const date = new Date(Date.now() - i * 86400000 * 0.7);
  return {
    id: `DR-${(10245 - i).toString()}`,
    productId: p.id, productName: p.name, quantity: qty,
    sellingPrice: price, commission: p.commission * qty,
    customerName: name, phone, wilaya: WILAYAS[i % WILAYAS.length],
    commune: ["Centre", "El Harrach", "Bab Ezzouar", "Rouiba"][i % 4],
    status: STATUSES[i % STATUSES.length],
    createdAt: date.toISOString(),
  };
});

export const STATS = {
  activeAffiliates: 2847,
  products: 156,
  ordersDelivered: 42890,
  commissionsPaid: 18_450_000, // DZD
};

export const EARNINGS_CHART = [
  { month: "Jan", earnings: 45000, orders: 62 },
  { month: "Feb", earnings: 62000, orders: 84 },
  { month: "Mar", earnings: 71000, orders: 98 },
  { month: "Apr", earnings: 68000, orders: 91 },
  { month: "May", earnings: 89000, orders: 118 },
  { month: "Jun", earnings: 104000, orders: 142 },
  { month: "Jul", earnings: 128000, orders: 176 },
];

export const TESTIMONIALS = [
  { name: "Yacine M.", role: "Affiliate · Alger", text: "I earned 180,000 DZD last month working from my phone. Droblow ships fast and I focus on content.", avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Amel K.", role: "Affiliate · Oran", text: "Zero stock, zero shipping headaches. I just create the order and get paid on delivery.", avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Rafik B.", role: "Affiliate · Constantine", text: "Best affiliate platform in Algeria. Payouts are always on time.", avatar: "https://i.pravatar.cc/80?img=52" },
];

export const FAQS = [
  { q: "How much does it cost to join?", a: "Joining Droblow Affiliate is 100% free. No subscription, no hidden fees." },
  { q: "When do I get paid?", a: "Commissions are unlocked automatically once your customer receives the order. Withdrawals are processed within 48 hours." },
  { q: "Do I need to buy stock?", a: "Never. Droblow owns and ships every product. You only promote and take orders." },
  { q: "Do I need affiliate links?", a: "No. You collect customer info via DM, then create the order manually inside the platform." },
  { q: "Which wilayas do you deliver to?", a: "All 58 Algerian wilayas via our partner shipping companies." },
];

export const AFFILIATES = Array.from({ length: 12 }).map((_, i) => ({
  id: `AF-${1200 + i}`,
  name: CUSTOMERS[i % CUSTOMERS.length][0],
  email: `affiliate${i + 1}@droblow.dz`,
  orders: 40 + ((i * 17) % 220),
  earnings: 12000 + ((i * 8300) % 260000),
  status: i % 5 === 0 ? "pending" : "active",
  joined: new Date(Date.now() - i * 12 * 86400000).toISOString(),
}));

export const WITHDRAWALS = Array.from({ length: 8 }).map((_, i) => ({
  id: `WD-${5010 + i}`,
  amount: 8000 + i * 4500,
  method: ["CCP", "BaridiMob", "Bank transfer"][i % 3],
  status: ["pending", "approved", "approved", "rejected"][i % 4],
  requestedAt: new Date(Date.now() - i * 3 * 86400000).toISOString(),
}));

export function formatDZD(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(n)) + " DZD";
}
