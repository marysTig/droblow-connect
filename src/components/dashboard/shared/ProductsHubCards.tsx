import { Link, useRouterState } from "@tanstack/react-router";
import { 
  Building, 
  Home, 
  Percent, 
  MessageCircle, 
  ShieldCheck, 
  ChevronLeft, 
  PlusCircle, 
  ShoppingBag, 
  Truck, 
  Tag, 
  Package2,
  ArrowUpRight
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ProductsHubCards() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();

  const isImmobilierActive = pathname.startsWith("/dashboard/immobilier");
  const isProductsActive = pathname.startsWith("/dashboard/products");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8" dir="rtl">
      
      {/* Immobilier Card */}
      <div 
        className={`relative overflow-hidden rounded-[2rem] border transition-all duration-500 group ${
          isImmobilierActive 
            ? "border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/20 scale-[1.01]" 
            : "border-border/50 hover:border-emerald-500/30 hover:shadow-lg opacity-90 hover:opacity-100"
        }`}
      >
        {/* Background with Gradient and Image */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-900/95 to-emerald-950/90 z-0" />
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-105 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full min-h-[300px]">
          {/* Top Badge */}
          <div className="flex items-center w-fit gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-md">
            <Home className="w-3.5 h-3.5" />
            <span>جديد في Droblow</span>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">بيع الشقق</h2>
            <p className="text-emerald-50/80 text-sm sm:text-base font-medium">
              بِع واربح عمولتك
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span dir="ltr">40,000 دج عمولة</span>
            </div>
            <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>تواصل مباشر</span>
            </div>
            <div className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>إعلانات موثوقة</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              to="/dashboard/immobilier"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] flex-1 sm:flex-none min-w-[140px]"
            >
              <span>اكتشف الشقق</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Products Card */}
      <div 
        className={`relative overflow-hidden rounded-[2rem] border transition-all duration-500 group ${
          isProductsActive 
            ? "border-violet-500/50 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/20 scale-[1.01]" 
            : "border-border/50 hover:border-violet-500/30 hover:shadow-lg opacity-90 hover:opacity-100"
        }`}
      >
        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-[#0a0514] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-[#0a0514] to-[#0a0514] z-0" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/20 blur-[100px] rounded-full z-0" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-fuchsia-600/10 blur-[80px] rounded-full z-0" />

        {/* Abstract decor elements (simulating the products) */}
        <div className="absolute -left-10 top-10 opacity-30 transform -rotate-12 transition-transform duration-700 group-hover:rotate-0">
          <Package2 className="w-40 h-40 text-violet-500/30" />
        </div>
        <div className="absolute left-20 bottom-10 opacity-20 transform rotate-12 transition-transform duration-700 group-hover:rotate-45">
          <ShoppingBag className="w-32 h-32 text-fuchsia-500/30" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full min-h-[300px]">
          {/* Top Badge */}
          <div className="flex items-center w-fit gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-md">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>تسوق الآن</span>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">المنتجات</h2>
            <p className="text-violet-100/80 text-sm sm:text-base font-medium">
              تسوق آلاف المنتجات بأفضل الأسعار
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            <div className="flex items-center gap-1.5 border border-violet-500/30 bg-violet-500/10 backdrop-blur-md text-violet-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <Truck className="w-3.5 h-3.5 text-violet-400" />
              <span>توصيل سريع</span>
            </div>
            <div className="flex items-center gap-1.5 border border-violet-500/30 bg-violet-500/10 backdrop-blur-md text-violet-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>أفضل الأسعار</span>
            </div>
            <div className="flex items-center gap-1.5 border border-violet-500/30 bg-violet-500/10 backdrop-blur-md text-violet-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <Package2 className="w-3.5 h-3.5 text-violet-400" />
              <span>آلاف المنتجات</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              to="/dashboard/products"
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] w-fit min-w-[160px]"
            >
              <span>تصفح المنتجات</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
