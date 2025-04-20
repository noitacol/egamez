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

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param start Başlangıç tarihi
 * @param end Bitiş tarihi
 * @returns Gün farkı
 */
export const daysBetween = (start: Date, end: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // Bir günün milisaniye cinsinden değeri
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / oneDay);
};

/**
 * Fiyatı formatlayarak para birimi ile birlikte gösterir
 * @param price Fiyat değeri
 * @param currency Para birimi (varsayılan: TL)
 * @returns Formatlanmış fiyat
 */
export const formatPrice = (price: number, currency: string = 'TL'): string => {
  if (price === 0) return 'Ücretsiz';
  
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency === 'TL' ? 'TRY' : currency,
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * İndirim yüzdesini hesaplar
 * @param originalPrice Orijinal fiyat
 * @param discountPrice İndirimli fiyat
 * @returns İndirim yüzdesi (0-100 arası)
 */
export const calculateDiscountPercentage = (originalPrice: number, discountPrice: number): number => {
  if (originalPrice <= 0 || discountPrice >= originalPrice) return 0;
  
  const discountPercentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return Math.min(discountPercentage, 100); // Max %100 indirim olabilir
};

/**
 * Kaynak platforma göre platform adını döndürür
 * @param source Platform adı ('epic', 'steam', 'gamerpower' vs.)
 * @returns Platform adı
 */
export const sourcePlatformIcon = (source: string): string => {
  const sourceLower = source?.toLowerCase() || '';
  
  if (sourceLower === 'epic') {
    return 'Epic Games';
  } else if (sourceLower === 'steam') {
    return 'Steam';
  } else if (sourceLower === 'gamerpower') {
    return 'GamerPower';
  } else {
    return 'Diğer'; // Varsayılan değer
  }
}; 