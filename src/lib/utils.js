import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
 return twMerge(clsx(inputs));
}

export const isIframe =
 typeof window !== "undefined" && typeof window.self !== "undefined" && window.self !== window.top;
