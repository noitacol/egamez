import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind sınıflarını birleştirmek için yardımcı fonksiyon
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Belirtilen tarihle şu anki zaman arasındaki farkı hesaplayarak geri sayım bilgisini döndürür
 * @param targetDate Hedef tarih
 * @returns Kalan gün, saat, dakika ve saniye bilgilerini içeren nesne
 */
export const calculateTimeLeft = (targetDate: Date) => {
  const difference = targetDate.getTime() - Date.now();
  
  // Eğer hedef tarih geçmişse sıfır döndür
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}; 