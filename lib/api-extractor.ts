import axios from 'axios';
import { JSDOM } from 'jsdom';

/**
 * SteamDB'den geçici ücretsiz oyunları almak için web kazıma işlevi
 */
export async function scrapeSteamDBFreePromotions(): Promise<{ appId: number, name: string, endDate: string }[]> {
  try {
    // SteamDB'nin Free Promotions sayfasını al
    const response = await axios.get('https://steamdb.info/upcoming/free/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Free promotions tablosundaki satırları seç
    const tableRows = document.querySelectorAll('table.table-promotions tr');
    const promotions: { appId: number, name: string, endDate: string }[] = [];
    
    tableRows.forEach((row: Element, index: number) => {
      // Header'ı atla
      if (index === 0) return;
      
      const cells = row.querySelectorAll('td');
      if (cells.length >= 3) {
        // AppID'yi al (href'ten çıkarılacak)
        const appLink = cells[0].querySelector('a');
        const appUrl = appLink?.getAttribute('href') || '';
        const appIdMatch = appUrl.match(/\/app\/(\d+)\//);
        const appId = appIdMatch ? parseInt(appIdMatch[1]) : 0;
        
        // Oyun adını al
        const name = cells[0].textContent?.trim() || '';
        
        // Bitiş tarihini al ve ISO formatına dönüştür
        const endDateText = cells[2].textContent?.trim() || '';
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // Varsayılan olarak 7 gün
        
        // Tarih metnini işlemeye çalış
        if (endDateText) {
          const dateParts = endDateText.split(' ');
          if (dateParts.length >= 2) {
            const day = parseInt(dateParts[0]);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames.indexOf(dateParts[1].substring(0, 3));
            
            if (!isNaN(day) && month !== -1) {
              endDate = new Date();
              endDate.setDate(day);
              endDate.setMonth(month);
            }
          }
        }
        
        if (appId > 0 && name) {
          promotions.push({
            appId,
            name,
            endDate: endDate.toISOString()
          });
        }
      }
    });
    
    return promotions;
  } catch (error) {
    console.error('Error scraping SteamDB Free Promotions:', error);
    return [];
  }
}

/**
 * Steam mağazasında geçici olarak ücretsiz oyunları aramak için
 */
export async function searchSteamStoreForFreePromotions(): Promise<number[]> {
  try {
    // Steam Store'un spesyal teklif sayfasını al
    const response = await axios.get('https://store.steampowered.com/search/', {
      params: {
        specials: 1,
        cc: 'tr',
        l: 'turkish'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Arama sonuçlarındaki oyunları seç
    const searchResults = document.querySelectorAll('.search_result_row');
    const freePromotionAppIds: number[] = [];
    
    searchResults.forEach((result: Element) => {
      // Discount bilgisi
      const discountElement = result.querySelector('.search_discount span');
      const discountText = discountElement?.textContent?.trim() || '';
      
      // Orijinal fiyat bilgisi
      const originalPriceElement = result.querySelector('.search_price strike');
      const originalPrice = originalPriceElement?.textContent?.trim() || '';
      
      // %100 indirim ve orijinal fiyatı 0 olmayan oyunlar
      if (discountText === '-100%' && originalPrice !== '') {
        // AppID'yi al
        const appUrl = result.getAttribute('href') || '';
        const appIdMatch = appUrl.match(/\/app\/(\d+)\//);
        const appId = appIdMatch ? parseInt(appIdMatch[1]) : 0;
        
        if (appId > 0) {
          freePromotionAppIds.push(appId);
        }
      }
    });
    
    return freePromotionAppIds;
  } catch (error) {
    console.error('Error searching Steam Store for free promotions:', error);
    return [];
  }
}

/**
 * Tüm kaynaklardan geçici olarak ücretsiz olan oyunların appId'lerini getir
 */
export async function getAllTemporaryFreeAppIds(): Promise<{ appId: number, endDate: string }[]> {
  try {
    // Tüm kaynakları paralel olarak çağır
    const [steamDBPromotions, storePromotionIds] = await Promise.all([
      scrapeSteamDBFreePromotions(),
      searchSteamStoreForFreePromotions()
    ]);
    
    // SteamDB'den gelen verileri işle
    const results = [...steamDBPromotions];
    
    // Store'dan gelen verileri ekle (endDate bilgisi olmayabilir)
    storePromotionIds.forEach(appId => {
      // Eğer bu appId zaten SteamDB sonuçlarında yoksa, ekle
      if (!results.some(item => item.appId === appId)) {
        // Varsayılan olarak 7 gün sonrası için bitiş tarihi 
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        
        results.push({
          appId,
          name: `App ${appId}`, // AppID dışında isim bilgisine sahip değiliz
          endDate: endDate.toISOString()
        });
      }
    });
    
    // Manuel olarak eklenen bilinen ücretsiz oyunları ekle
    const knownFreePromotions = [
      { appId: 753660, name: 'AtmaSphere', endDate: '2023-04-23T10:00:00Z' }, // Örnek
      { appId: 1201240, name: 'POSTAL 4: No Regerts', endDate: '2023-04-30T23:59:59Z' }, // Örnek
    ];
    
    knownFreePromotions.forEach(promo => {
      if (!results.some(item => item.appId === promo.appId)) {
        results.push(promo);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error getting all temporary free app IDs:', error);
    return [];
  }
} 