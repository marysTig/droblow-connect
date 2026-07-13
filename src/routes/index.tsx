import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShoppingBag, Rocket, Wallet, TrendingUp, Package, Users, ShieldCheck, Sparkles, Facebook, Instagram, Star } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { PRODUCTS, STATS, TESTIMONIALS, FAQS, formatDZD } from "@/lib/demo-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ProductsPreview />
      <Testimonials />
      <FAQ />
      <CTABand />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#products" className="hover:text-foreground transition-colors">Products</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm" className="gradient-brand text-brand-foreground shadow-brand hover:opacity-95">
            <Link to="/register">Become an Affiliate <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-success/20 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-xs font-medium text-success mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Now onboarding affiliates in all 58 wilayas
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary">
            Sell without stock. <br />
            <span className="text-gradient-brand">Earn from every delivered order.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Droblow Affiliate and start selling physical products across Algeria. We handle inventory, shipping and delivery — you promote and earn.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gradient-brand text-brand-foreground shadow-brand h-12 px-7 text-base">
              <Link to="/register">Become an Affiliate <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base border-2">
              <a href="#products"><ShoppingBag className="mr-2 h-5 w-5" /> Browse Products</a>
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Free forever</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Payout in 48h</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No stock needed</span>
          </div>
        </div>

        <HeroDashboardMock />
      </div>
    </section>
  );
}

function HeroDashboardMock() {
  return (
    <div className="mt-16 relative mx-auto max-w-5xl">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand/40 via-success/30 to-brand/40 blur-2xl opacity-60" />
      <div className="relative glass rounded-3xl border shadow-glow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { label: "Available balance", value: "84,500 DZD", icon: Wallet, tint: "text-success" },
            { label: "Delivered orders", value: "128", icon: Package, tint: "text-primary" },
            { label: "This month earnings", value: "+18.4%", icon: TrendingUp, tint: "text-success" },
          ].map((s) => (
            <div key={s.label} className="p-6 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent">
                <s.icon className={`h-6 w-6 ${s.tint}`} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  const items = [
    { label: "Active Affiliates", value: STATS.activeAffiliates.toLocaleString() + "+" },
    { label: "Products", value: STATS.products.toLocaleString() },
    { label: "Orders Delivered", value: STATS.ordersDelivered.toLocaleString() },
    { label: "Commissions Paid", value: formatDZD(STATS.commissionsPaid) },
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
  const steps = [
    { icon: Users, title: "Create your account", desc: "Sign up free in less than 60 seconds." },
    { icon: ShoppingBag, title: "Choose products", desc: "Browse the catalog and pick winning items." },
    { icon: Rocket, title: "Publish on social media", desc: "Post on Facebook, TikTok, Instagram, WhatsApp." },
    { icon: Package, title: "Receive customer orders", desc: "Collect the customer info via DM or comments." },
    { icon: ShieldCheck, title: "Create the order in Droblow", desc: "Fill the simple order form. We confirm & ship." },
    { icon: Wallet, title: "Earn your commission", desc: "Balance unlocks the second the order is delivered." },
  ];
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-widest text-success">How it works</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary">From your phone to your wallet in 6 steps</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="group relative rounded-2xl border bg-card p-7 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="absolute top-5 right-5 text-5xl font-bold text-muted/60">0{i + 1}</div>
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand shadow-brand">
                <s.icon className="h-6 w-6 text-brand-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsPreview() {
  return (
    <section id="products" className="py-24 bg-gradient-to-b from-background to-accent/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-success">Catalog</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary">Winning products, ready to sell</h2>
          </div>
          <Button asChild variant="outline"><Link to="/register">See all {PRODUCTS.length}+ products <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.slice(0, 6).map((p) => (
            <div key={p.id} className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[11px] font-semibold">In stock</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Min</div>
                    <div className="text-sm font-semibold">{formatDZD(p.minPrice)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sell</div>
                    <div className="text-sm font-semibold">{formatDZD(p.suggestedPrice)}</div>
                  </div>
                  <div className="rounded-lg gradient-brand p-2 text-brand-foreground">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Profit</div>
                    <div className="text-sm font-bold">{formatDZD(p.commission)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="text-sm font-semibold uppercase tracking-widest text-success">Testimonials</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary">Loved by affiliates across Algeria</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border bg-card p-7 hover:shadow-lg transition-all">
              <div className="flex gap-1 text-brand">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full" />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="py-24 bg-accent/30">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold uppercase tracking-widest text-success">FAQ</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary">Frequently asked questions</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
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
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl gradient-navy p-12 md:p-16 text-center shadow-lg">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-success/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-navy-foreground">Ready to start earning?</h2>
            <p className="mt-4 text-lg text-navy-foreground/70 max-w-xl mx-auto">Create your free account and get access to the full catalog in under a minute.</p>
            <Button asChild size="lg" className="mt-8 gradient-brand text-brand-foreground shadow-brand h-12 px-8 text-base">
              <Link to="/register">Get started free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">The affiliate platform for physical products in Algeria. Sell without stock. Earn on every delivery.</p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-muted hover:bg-accent transition-colors"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-muted hover:bg-accent transition-colors"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Platform</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#how" className="hover:text-foreground">How it works</a></li>
            <li><a href="#products" className="hover:text-foreground">Products</a></li>
            <li><Link to="/register" className="hover:text-foreground">Sign up</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">About</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 Droblow Affiliate. Made in Algeria.
      </div>
    </footer>
  );
}
