import axios from 'axios';
// JSDOM artık gerekli değil, çünkü scraping yapmayacağız

/**
 * Geçici ücretsiz oyunların statik listesini döndürür.
 * SteamDB ve Steam Store scraping işlemleri kaldırıldığından
 * bu fonksiyon statik veri sağlar.
 */
export async function getAllTemporaryFreeAppIds(): Promise<{ appId: number, endDate: string }[]> {
  return getStaticFreePromotions();
}

/**
 * Statik olarak tanımlanmış geçici ücretsiz oyunların listesini döndürür
 */
function getStaticFreePromotions(): { appId: number, endDate: string }[] {
  // Bitiş tarihi için bir hafta sonrasını kullan
  const oneWeekLater = new Date();
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  const endDateString = oneWeekLater.toISOString();
  
  // Güncel ve popüler ücretsiz oyunlar
  return [
    { appId: 1172470, endDate: endDateString }, // Apex Legends
    { appId: 1938090, endDate: endDateString }, // EA SPORTS FC™ 24
    { appId: 1716740, endDate: endDateString }, // Far Cry® 6
    { appId: 2346010, endDate: endDateString }, // Palworld
    { appId: 2689000, endDate: endDateString }, // Once Human
    { appId: 1716450, endDate: endDateString }, // CONCORD
    { appId: 2089020, endDate: endDateString }, // StarGlave
    { appId: 2788830, endDate: endDateString }, // Stormlight
    { appId: 753660, endDate: endDateString },  // AtmaSphere
    { appId: 1201240, endDate: endDateString }, // POSTAL 4: No Regerts
  ];
} 