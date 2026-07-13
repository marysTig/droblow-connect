import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 md:p-12">
        <Link to="/"><Logo /></Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-primary tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8 space-y-4">{children}</div>
            <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden gradient-navy">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-20 -left-10 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-success/40 blur-3xl" />
        </div>
        <div className="relative h-full flex flex-col justify-between p-12 text-navy-foreground">
          <div />
          <div>
            <div className="text-4xl font-bold leading-tight max-w-md">
              "Zero stock, zero shipping headaches. I just create the order and get paid on delivery."
            </div>
            <div className="mt-6 flex items-center gap-3">
              <img src="https://i.pravatar.cc/60?img=32" className="h-11 w-11 rounded-full ring-2 ring-brand/60" alt="" />
              <div>
                <div className="font-semibold">Amel K.</div>
                <div className="text-sm text-navy-foreground/70">Affiliate · Oran</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-navy-foreground/50">© 2026 Droblow Affiliate</div>
        </div>
      </div>
    </div>
  );
}
