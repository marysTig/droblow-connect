import { BRAND_LOGO } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({ className, showText = true, size = 40 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/favicon.png"
        alt="Droblow"
        width={size}
        height={size}
        className="rounded-xl"
        style={{ width: size, height: size }}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-[18px] font-extrabold tracking-tight text-primary">
            Droblow
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
            Affiliate
          </span>
        </div>
      )}
    </div>
  );
}
