import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Check, ShoppingBag, Rocket, Wallet, TrendingUp,
  Package, Users, ShieldCheck, Sparkles, Facebook, Instagram, Star, Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useProducts, useTestimonials, usePlatformStats, formatDZD, useCategories } from "@/lib/queries";
import { FAQS } from "@/lib/demo-data";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <CategoriesCarousel />
      <ProductsPreview />
      <Testimonials />
      <FAQ />
      <CTABand />
      <SiteFooter />
    </div>
  );
}


function Hero() {
  const { t } = useI18n();
  const [, setVantaEffect] = useState<any>(null);
  const myRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: any;
    const initVanta = async () => {
      if (!effect && myRef.current) {
        try {
          const THREE = await import("three");
          (window as any).THREE = THREE;
          // @ts-ignore
          const vantaModule = await import("vanta/dist/vanta.globe.min");
          let GLOBE = vantaModule.default;
          if (typeof GLOBE === "object" && GLOBE !== null && typeof GLOBE.default === "function") GLOBE = GLOBE.default;
          if (typeof GLOBE !== "function") GLOBE = (window as any).VANTA?.GLOBE;
          if (typeof GLOBE === "function") {
            effect = GLOBE({
              el: myRef.current, THREE, mouseControls: true, touchControls: true,
              gyroControls: false, minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
              color: 0xa855f7, color2: 0x10b981, backgroundColor: 0x020817,
            });
            setVantaEffect(effect);
          }
        } catch (e) { console.error("Vanta failed:", e); }
      }
    };
    initVanta();
    return () => { if (effect) effect.destroy(); };
  }, []);

  return (
    <section className="relative overflow-hidden gradient-hero min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 -z-10 opacity-40 bg-background/20 pointer-events-none">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-success/20 blur-3xl" />
      </div>
      <div ref={myRef} className="absolute inset-y-0 right-0 z-0 pointer-events-auto" style={{ left: '-300px', width: 'calc(100% + 300px)' }} />
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center -translate-y-[100px]">
        <div className="max-w-2xl text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]" dir="auto">
            {t("hero_title1")} <br />
            <span className="text-gradient-brand">{t("hero_title2")}</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl lg:text-[26px] leading-relaxed text-white max-w-2xl" dir="auto">{t("hero_desc")}</p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="gradient-brand text-brand-foreground shadow-brand h-14 px-8 text-lg font-bold">
              <Link to="/register">{t("hero_cta_primary")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2">
              <a href="#products"><ShoppingBag className="mr-2 h-5 w-5" />{t("hero_cta_secondary")}</a>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-7 text-base md:text-lg font-medium text-white">
            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-success" /> {t("hero_feat1")}</span>
            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-success" /> {t("hero_feat2")}</span>
            <span className="inline-flex items-center gap-2"><Check className="h-5 w-5 text-success" /> {t("hero_feat3")}</span>
          </div>
        </div>
        <div className="w-full" />
      </div>
    </section>
  );
}

function StatsBar() {
  const { t } = useI18n();
  const { data: stats } = usePlatformStats();
  const items = [
    { label: t("stats_affiliates"), value: stats ? stats.active_affiliates.toLocaleString() + "+" : "—" },
    { label: t("stats_products"), value: stats ? stats.products_count.toLocaleString() : "—" },
    { label: t("stats_delivered"), value: stats ? stats.orders_delivered.toLocaleString() : "—" },
    { label: t("stats_commissions"), value: stats ? formatDZD(stats.commissions_paid) : "—" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gradient-brand">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: Users, title: t("how_step1_title"), desc: t("how_step1_desc") },
    { icon: ShoppingBag, title: t("how_step2_title"), desc: t("how_step2_desc") },
    { icon: Rocket, title: t("how_step3_title"), desc: t("how_step3_desc") },
    { icon: Package, title: t("how_step4_title"), desc: t("how_step4_desc") },
    { icon: ShieldCheck, title: t("how_step5_title"), desc: t("how_step5_desc") },
    { icon: Wallet, title: t("how_step6_title"), desc: t("how_step6_desc") },
  ];
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-success" dir="auto">{t("how_label")}</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary" dir="auto">{t("how_title")}</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="group relative rounded-2xl border bg-card p-7 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute top-5 right-5 text-5xl font-bold text-muted-foreground/40">0{i + 1}</div>
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand shadow-brand">
                <s.icon className="h-6 w-6 text-brand-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold" dir="auto">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesCarousel() {
  const { t } = useI18n();
  const { data: dbCategories = [], isLoading } = useCategories();
  
  if (isLoading) return null;
  
  // Fallback items if db is completely empty
  const fallbackCategories = [
    { id: '1', name: 'Electronics', image: null },
    { id: '2', name: 'Home', image: null },
    { id: '3', name: 'Beauty', image: null },
    { id: '4', name: 'Health', image: null },
    { id: '5', name: 'Sports', image: null },
    { id: '6', name: 'Toys', image: null },
  ];
  
  const categories = dbCategories.length > 0 ? dbCategories : fallbackCategories;
  
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1500px] px-6 mb-12">
         <div className="text-sm font-semibold uppercase tracking-widest text-success" dir="auto">{t("categories_label") || "Catégories"}</div>
         <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary" dir="auto">{t("categories_title") || "Parcourir par catégorie"}</h2>
      </div>
      
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-8 md:-ml-12 py-8">
            {categories.map((cat, i) => (
              <CarouselItem key={cat.id || i} className="pl-8 md:pl-12 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <div className="flex flex-col items-center group cursor-pointer h-full">
                  <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-card border-none shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 group-hover:-translate-y-2">
                     <div className="absolute inset-0 rounded-full bg-success/20 group-hover:bg-success/30 transition-colors duration-300 z-0" />
                     
                     <img 
                       src={cat.image || "/category-placeholder.png"} 
                       alt={cat.name} 
                       className="absolute z-10 w-[75%] h-[75%] object-contain rounded-full drop-shadow-xl transition-transform duration-300 group-hover:scale-110" 
                     />
                  </div>
                  <h3 
                    className="mt-6 text-center font-bold text-sm md:text-base max-w-[150px] leading-tight break-words" 
                    dir="auto" 
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {cat.name}
                  </h3>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-2 lg:-left-6 h-12 w-12 shadow-md border-border bg-card text-foreground" />
          <CarouselNext className="hidden md:flex -right-2 lg:-right-6 h-12 w-12 shadow-md border-border bg-card text-foreground" />
        </Carousel>
      </div>
    </section>
  );
}

function ProductsPreview() {
  const { t } = useI18n();
  const { data: products = [], isLoading } = useProducts();
  return (
    <section id="products" className="py-24 bg-gradient-to-b from-background to-accent/40">
      <div className="mx-auto max-w-[1500px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 max-w-7xl mx-auto">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-success">{t("products_label")}</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary" dir="auto">{t("products_title")}</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/register">{t("products_see_all")} {products.length}+ <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="product-grid">{[...Array(6)].map((_, i) => <div key={i} className="product-card animate-pulse" />)}</div>
        ) : (
          <div className="product-grid">
            {products.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/product/$productId"
                params={{ productId: p.id }}
                className="product-card"
                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
              >
                <div className="product-card-image-wrapper">
                  <img src={p.image} alt={p.name} loading="lazy" className="product-card-image" />
                </div>
                <div className="product-card-content">
                  <h3 className="product-card-title" dir="auto">{p.name}</h3>
                  <div className="product-card-price-row">
                    {p.is_active ? (
                      <div className="product-card-price">{formatDZD(p.price)}</div>
                    ) : (
                      <div className="text-sm font-bold text-destructive">{t("product_card_out_of_stock")}</div>
                    )}
                    <button
                      className="product-card-favorite"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-6 w-6" />
                    </button>
                  </div>
                  {p.is_active ? (
                    <span className="product-card-btn">{t("product_card_view")}</span>
                  ) : (
                    <span className="product-card-btn bg-destructive/10 text-destructive shadow-none" style={{ backgroundImage: 'none' }}>
                      {t("product_card_unavailable")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useI18n();
  const { data: testimonials = [], isLoading } = useTestimonials();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="text-sm font-semibold uppercase tracking-widest text-success">{t("testimonials_label")}</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary" dir="auto">{t("testimonials_title")}</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl border bg-card h-48 animate-pulse" />)}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("testimonials_empty")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t2) => (
              <div key={t2.id} className="rounded-2xl border bg-card p-7 hover:shadow-lg transition-all">
                <div className="flex gap-1 text-brand">
                  {[...Array(t2.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground leading-relaxed">"{t2.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  {t2.avatar && <img src={t2.avatar} alt={t2.name} className="h-10 w-10 rounded-full" />}
                  <div>
                    <div className="text-sm font-semibold">{t2.name}</div>
                    <div className="text-xs text-muted-foreground">{t2.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQ() {
  const { t, lang } = useI18n();
  const currentFaqs = FAQS[lang as keyof typeof FAQS] || FAQS.ar;

  return (
    <section id="faq" className="py-24 bg-accent/30">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-widest text-success">{t("faq_label")}</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary" dir="auto">{t("faq_title")}</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {currentFaqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border bg-card px-5 data-[state=open]:shadow-md">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTABand() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl gradient-navy p-12 md:p-16 text-center shadow-lg">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-success/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-navy-foreground" dir="auto">{t("cta_title")}</h2>
            <p className="mt-4 text-lg text-navy-foreground/70 max-w-xl mx-auto">{t("cta_desc")}</p>
            <Button asChild size="lg" className="mt-8 gradient-brand text-brand-foreground shadow-brand h-12 px-8 text-base">
              <Link to="/register">{t("cta_button")} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


