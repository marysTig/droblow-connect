import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseProductName(name: string) {
  try {
    const parsed = JSON.parse(name);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Ignore, not valid JSON
  }
  return null;
}

export function formatProductName(name: string) {
  const parsed = parseProductName(name);
  if (parsed) {
    return parsed.map((p: any) => `${p.name} (x${p.qty})`).join(" + ");
  }
  return name;
}
