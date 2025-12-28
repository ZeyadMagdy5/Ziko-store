import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function convertArabicToEnglish(str) {
  if (!str) return str;
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, function (w) {
    return arabicNumbers.indexOf(w);
  });
}

export function getUserKey() {
  let key = localStorage.getItem('userKey');
  if (!key) {
    key = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('userKey', key);
  }
  return key;
}
