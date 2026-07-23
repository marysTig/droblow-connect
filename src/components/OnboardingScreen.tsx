import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SpringCarousel } from "./ui/SpringCarousel";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";
import { Globe, Rocket, ShoppingBag, ShieldCheck, UserPlus } from "lucide-react";

export function OnboardingScreen() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    // Only show if the user hasn't seen it yet
    const hasSeenOnboarding = localStorage.getItem("droblow_onboarded");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("droblow_onboarded", "true");
    setOpen(false);
  };

  const carouselItems = [
    {
      id: 0,
      title: t("onboarding_step0_title"),
      description: t("onboarding_step0_desc"),
      icon: <UserPlus className="h-4 w-4" />,
    },
    {
      id: 1,
      title: t("onboarding_step1_title"),
      description: t("onboarding_step1_desc"),
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: 2,
      title: t("onboarding_step2_title"),
      description: t("onboarding_step2_desc"),
      icon: <Rocket className="h-4 w-4" />,
    },
    {
      id: 3,
      title: t("onboarding_step3_title"),
      description: t("onboarding_step3_desc"),
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      id: 4,
      title: t("onboarding_step4_title"),
      description: t("onboarding_step4_desc"),
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const isLastStep = activeIndex === carouselItems.length - 1;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && isLastStep && handleClose()}>
      <DialogContent 
        className="max-w-md bg-card/95 backdrop-blur-xl border border-border/50 p-8 rounded-3xl overflow-hidden flex flex-col items-center gap-6 shadow-glow"
        onInteractOutside={(e) => {
          if (!isLastStep) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!isLastStep) e.preventDefault();
        }}
      >
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-success/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center gap-4 w-full relative z-10">
          <Logo />
          
          <div className="flex items-center gap-3 mt-4 w-full justify-center">
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              size="sm"
              onClick={() => setLang("ar")}
              className={`rounded-full px-6 font-semibold transition-all ${lang === "ar" ? "gradient-brand text-brand-foreground shadow-brand border-0" : "hover:bg-muted"}`}
            >
              العربية
            </Button>
            <Button
              variant={lang === "fr" ? "default" : "outline"}
              size="sm"
              onClick={() => setLang("fr")}
              className={`rounded-full px-6 font-semibold transition-all ${lang === "fr" ? "gradient-brand text-brand-foreground shadow-brand border-0" : "hover:bg-muted"}`}
            >
              Français
            </Button>
          </div>
        </div>

        <div className="w-full flex justify-center pb-4 relative z-10">
          <SpringCarousel
            ref={carouselRef}
            items={carouselItems}
            baseWidth={320}
            loop={false}
            autoplay={false}
            onActiveIndexChange={setActiveIndex}
          />
        </div>

        <div className="w-full relative z-10">
          {!isLastStep ? (
            <Button onClick={handleNext} className="w-full rounded-xl py-6 text-lg font-bold">
              {lang === "ar" ? "التالي" : "Suivant"}
            </Button>
          ) : (
            <Button onClick={handleClose} className="w-full rounded-xl py-6 text-lg font-bold gradient-brand text-brand-foreground shadow-brand">
              {lang === "ar" ? "ابدأ الآن" : "Commencer"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
