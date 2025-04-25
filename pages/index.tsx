import { GetStaticProps } from "next";
import { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
// Epic API çağrıları geçici olarak devre dışı bırakıldı
// import { fetchFreeGames, fetchUpcomingFreeGames, fetchTrendingGames } from "@/lib/epic-api";
import { 
  getGamerPowerOnlyGamesAsEpicFormat, 
  getGamerPowerLootAsEpicFormat, 
  getGamerPowerBetaAsEpicFormat, 
  getTrendingGamerPowerGames 
} from "@/lib/gamerpower-api";
import { getFreeSteamGames, getTrendingSteamGames } from "@/lib/steam-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";
import { SiEpicgames, SiSteam, SiNintendoswitch, SiGogdotcom, SiAndroid, SiApple, SiPlaystation } from "react-icons/si";
import { FaPlaystation, FaXbox, FaWindows, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaGamepad, FaFire } from "react-icons/fa";
import { RiGamepadLine } from "react-icons/ri";
import { GiRaceCar, GiSwordman, GiSpellBook, GiMountainRoad, GiChessKnight } from "react-icons/gi";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { MdNavigateNext, MdNavigateBefore, MdOutlineAccessTime } from "react-icons/md";
import { BsGift, BsWindows, BsClock } from "react-icons/bs";
import { RiTestTubeFill } from "react-icons/ri";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BiGift } from "react-icons/bi";
import { AiOutlineAppstore } from "react-icons/ai";
import { SmartphoneIcon, Globe, Monitor } from "lucide-react";

interface HomeProps {
  // Epic API oyunları geçici olarak kaldırıldı
  // epicFreeGames: ExtendedEpicGame[];
  // upcomingEpicGames: ExtendedEpicGame[];
  freebieGames: ExtendedEpicGame[];
  freeLoots: ExtendedEpicGame[];
  freeBetas: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
  trendingGames: ExtendedEpicGame[];
  totalGames: number;
}

type PlatformType = "all" | "epic" | "steam" | "playstation" | "xbox" | "switch" | "pc" | "android" | "ios" | "epic-games-store" | "gog" | "ps4" | "xbox-one";

const platformDisplayNames: Record<string, string> = {
  'all': 'Tüm',
  'pc': 'PC',
  'epic': 'Epic Games',
  'epic-games-store': 'Epic Games',
  'steam': 'Steam',
  'gog': 'GOG',
  'playstation': 'PlayStation',
  'ps4': 'PlayStation',
  'xbox': 'Xbox',
  'xbox-one': 'Xbox',
  'switch': 'Nintendo Switch',
  'android': 'Android',
  'ios': 'iOS'
};

// Kalan süreyi hesaplama fonksiyonu
const calculateTimeLeft = (expiryDate: string | null | undefined): { days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } => {
  if (!expiryDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const difference = new Date(expiryDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false
  };
};

// Platform belirleme yardımcı fonksiyonları
const isPlatformEpic = (game: ExtendedEpicGame | null | undefined): boolean => {
  if (!game) return false;
  const platform = game.distributionPlatform?.toLowerCase() || '';
  return platform === 'epic' || platform === 'epic-games-store';
};

const isPlatformSteam = (game: ExtendedEpicGame | null | undefined): boolean => {
  if (!game) return false;
  const platform = game.distributionPlatform?.toLowerCase() || '';
  return platform === 'steam';
};

// Tarih formatlama fonksiyonu
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return '';
  }
};

// Rastgele video başlangıç zamanı
const getRandomStartTime = (): number => {
  return Math.floor(Math.random() * 100) + 20; // 20-120 arası rastgele sayı
};

// Yardımcı fonksiyon - benzersiz oyunları almak için
const getUniqueGames = (games: ExtendedEpicGame[]): ExtendedEpicGame[] => {
  return games.filter((game, index, self) => 
    index === self.findIndex((g) => (
      // Title veya ID'ye göre benzersizlik kontrolü
      g.id === game.id || 
      (g.title && game.title && g.title.toLowerCase() === game.title.toLowerCase())
    ))
  );
};

export default function Home({ 
  // Epic API oyunları geçici olarak kaldırıldı
  // epicFreeGames, 
  // upcomingEpicGames, 
  freebieGames,
  freeLoots,
  freeBetas,
  steamFreeGames,
  trendingGames,
  totalGames 
}: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'free' | 'upcoming' | 'trending' | 'loot' | 'beta'>('free');
  const [featuredGames, setFeaturedGames] = useState<ExtendedEpicGame[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformType>("all");
  const [filter, setFilter] = useState<"all" | "steam">("all");
  const [sort, setSort] = useState<"none" | "title" | "price">("none");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("all");
  const [sortOrder, setSortOrder] = useState<'newest' | 'expiry'>('newest');

  // Steam ve Epic platformlarındaki oyunları topla ve öne çıkan oyunlar listesini oluştur
  useEffect(() => {
    // Tüm oyunları içeren bir dizi oluştur
    let allGames = [...freebieGames, ...trendingGames];
    
    // Önce tekrarlanan oyunları kaldır
    allGames = getUniqueGames(allGames);
    
    // Sadece Steam veya Epic platformundaki ücretsiz oyunları filtrele
    const platformGames = allGames.filter(game => {
      if (!game) return false;
      
      // Sadece Steam veya Epic platformundaki oyunları al
      const platform = game.distributionPlatform?.toLowerCase() || '';
      const isEpicOrSteam = platform === 'steam' || platform === 'epic' || platform === 'epic-games-store';
      
      // loot veya beta olanları hariç tut
      const isLoot = game.isLoot || game.offerType === 'loot';
      const isBeta = game.isBeta || game.offerType === 'beta';
      
      // Ücretsiz olması şartı
      const isFree = game.price?.totalPrice?.discountPrice === 0 || 
                     game.price?.totalPrice?.originalPrice === 0 ||
                     game.status === 'free';
      
      // Sadece ücretsiz Steam veya Epic oyunlarını dahil et
      return isEpicOrSteam && !isLoot && !isBeta && isFree;
    });
    
    // Test amaçlı olarak bazı oyunlara son kullanma tarihi atayalım (gerçek uygulamada burası API'dan gelir)
    const gamesWithExpiry = platformGames.map(game => {
      // Tüm oyunlara farklı süreler verelim
      if (!game.expiryDate) {
        // Rastgele 1-10 gün arasında son kullanma süresi ekleyelim
        const randomDays = Math.floor(Math.random() * 10) + 1;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + randomDays);
        
        return {
          ...game,
          expiryDate: expiryDate.toISOString()
        };
      }
      return game;
    });

    // Videosu olan oyunları öncelikli olarak al ve geçerli YouTube videosu olduğundan emin ol
    const gamesWithValidVideos = gamesWithExpiry.filter(game => {
      // Video var mı kontrol et
      if (!game.videos || !Array.isArray(game.videos) || game.videos.length === 0) return false;
      
      // YouTube videosu olduğundan ve ID çıkarılabildiğinden emin ol
      const youtubeVideo = game.videos.find(video => {
        const videoUrl = video?.url || '';
        return (
          videoUrl.includes('youtube.com/watch') || 
          videoUrl.includes('youtu.be/') || 
          videoUrl.includes('youtube.com/embed/')
        ) && getYouTubeVideoId(videoUrl) !== '';
      });
      
      return !!youtubeVideo;
    });
    
    const gamesWithoutVideos = gamesWithExpiry.filter(game => {
      return !gamesWithValidVideos.some(g => g.id === game.id);
    });
    
    // Her iki grubu da rastgele sırala
    const shuffledWithVideos = [...gamesWithValidVideos].sort(() => 0.5 - Math.random());
    const shuffledWithoutVideos = [...gamesWithoutVideos].sort(() => 0.5 - Math.random());
    
    // İki listeyi birleştir ve ilk 5 tanesini göster
    const combinedGames = [...shuffledWithVideos, ...shuffledWithoutVideos].slice(0, 5);
    
    console.log('Öne çıkan oyun sayısı:', combinedGames.length);
    console.log('Video içeren oyun sayısı:', shuffledWithVideos.length);
    console.log('Benzersiz oyun sayısı:', platformGames.length);
    
    setFeaturedGames(combinedGames);
  }, [freebieGames, trendingGames]);

  // Daha yüksek çözünürlüklü görsel elde etmek için URL'yi optimize eder
  const getOptimizedImageUrl = (url: string): string => {
    if (!url) return '/placeholder.jpg';
    
    // Epic Games CDN için iyileştirme
    if (url.includes('cdn1.epicgames.com') || url.includes('cdn2.epicgames.com')) {
      // Parametrelerden temizle
      let cleanUrl = url.split('?')[0];
      
      // Epic'in CDN'inde daha yüksek çözünürlük parametreleri ekleme
      return `${cleanUrl}?h=1080&resize=1&w=1920`;
    }
    
    // Steam CDN için iyileştirme
    if (url.includes('steamcdn') || url.includes('steamcommunity') || url.includes('steampowered')) {
      // Steam header görsellerini büyüt
      if (url.includes('header.jpg')) {
        return url.replace('header.jpg', 'header_600x.jpg');
      }
      
      // Ekran görüntüleri için daha büyük sürümleri kullan
      if (url.includes('screenshots') && url.includes('.jpg')) {
        return url.replace('.jpg', '_2560x1440.jpg');
      }
      
      return url;
    }
    
    // GamerPower görselleri için iyileştirme
    if (url.includes('gamerpower.com/offers')) {
      // Küçük görsel URL'lerini büyük sürümleriyle değiştir
      return url.replace('_med.', '_hd.').replace('_small.', '_hd.');
    }
    
    return url;
  }

  // Bir oyunun yüksek çözünürlüklü Steam kapak görselini döndürür
  const getSteamHDImage = (game: ExtendedEpicGame): string | null => {
    // Steam app ID'sini bulmaya çalış
    let steamAppId = null;
    
    // URL'den Steam AppID çıkarma
    if (game.url && game.url.includes('store.steampowered.com/app/')) {
      const matches = game.url.match(/\/app\/(\d+)/);
      if (matches && matches[1]) {
        steamAppId = matches[1];
      }
    }
    
    if (steamAppId) {
      // Steam'den yüksek çözünürlüklü görsel URL'lerini oluştur
      return `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/library_hero.jpg`;
    }
    
    return null;
  }

  // Bir oyun için en kaliteli kapak görselini seç
  const getBestGameImage = (game: ExtendedEpicGame): string => {
    if (!game) return '/placeholder.jpg';
    
    // 1. Steam için özel HD görsel kontrol et (Steam oyunları için)
    if (game.distributionPlatform === 'steam') {
      const steamHDImage = getSteamHDImage(game);
      if (steamHDImage) {
        return steamHDImage;
      }
    }
    
    // 2. Zaten var olan en iyi görseli seç
    const bestImage = getExistingBestImage(game);
    
    // 3. En kaliteli görsel URL'sini optimize et
    return getOptimizedImageUrl(bestImage);
  };

  // Verilen oyun için mevcut en iyi görseli seç
  const getExistingBestImage = (game: ExtendedEpicGame): string => {
    if (!game) return '/placeholder.jpg';
    
    // Görseller yoksa varsayılan döndür
    if (!game.keyImages || game.keyImages.length === 0) {
      return '/placeholder.jpg';
    }

    // Hero banner için en uygun görsel tiplerini tanımla (öncelik sırasına göre)
    const preferredTypesForHero = [
      'OfferImageWide', // Geniş banner görsel, genellikle yüksek çözünürlükte olur
      'DieselStoreFrontWide', // Epic Store'da kullanılan geniş görsel, yüksek kaliteli
      'Screenshot', // Ekran görüntüsü - daha detaylı
      'Thumbnail', // Küçük görsel genelde daha yüksek kalite olur
      'DieselGameBoxTall', // Dikey oyun kutusu - detaylı
      'DieselGameBox', // Oyun kutusu görseli - detaylı
      'VaultClosed', // Epic'in bazı oyunlar için özel banner'ı 
      'DieselGameBoxLogo', // Logo - genelde düşük kalite
      'cover', // GamerPower'dan gelen kapak görseli
      'thumbnail' // GamerPower'dan gelen küçük görsel
    ];

    // İlk olarak HD (Yüksek Çözünürlüklü) görselleri ara
    for (const type of preferredTypesForHero) {
      // Öncelikle "_1920x1080" gibi büyük boyutlu görselleri ara
      const hdImagePattern = new RegExp(`${type}.*_(1920|3840|2560|1280)`);
      const hdImage = game.keyImages.find(img => 
        img.type && hdImagePattern.test(img.type)
      );
      
      if (hdImage && hdImage.url) {
        console.log(`HD görsel bulundu: ${hdImage.type}`);
        return hdImage.url;
      }
    }

    // HD görsel bulunamadıysa, standart tercih edilen tiplere göre ara
    for (const type of preferredTypesForHero) {
      const image = game.keyImages.find(img => 
        img.type && img.type.toLowerCase() === type.toLowerCase()
      );
      
      if (image && image.url) {
        return image.url;
      }
    }

    // Alternatif olarak, Steam oyunları için bazı özel alanları kontrol et
    if (game.distributionPlatform === 'steam') {
      // Steam geniş header resimlerini kontrol et
      if (game.headerImage) {
        return game.headerImage;
      }
      
      // En iyi ekran görüntüsünü seç
      if (game.screenshots && game.screenshots.length > 0) {
        // Yatay ekran görüntüsünü tercih et (type-safe kontrol)
        const horizontalScreenshot = game.screenshots.find(ss => {
          // Type-safe kontrol: width ve height özellikleri var mı?
          if (ss && typeof ss === 'object' && 'width' in ss && 'height' in ss && 
              typeof ss.width === 'number' && typeof ss.height === 'number') {
            return (ss.width / ss.height) > 1.3;
          }
          return false;
        });
        
        if (horizontalScreenshot) {
          return horizontalScreenshot.url;
        }
        
        // Yatay bulunamadıysa ilkini kullan
        return game.screenshots[0].url;
      }
    }

    // Son çare olarak en büyük görseli bul
    if (game.keyImages.length > 1) {
      // Görselleri boyuta göre sırala (eğer boyut bilgisi varsa)
      const sortedBySize = [...game.keyImages].sort((a, b) => {
        // Type-safe kontrol
        const aSize = ('width' in a && 'height' in a && 
                        typeof a.width === 'number' && typeof a.height === 'number') 
                      ? (a.width * a.height) : 0;
                          
        const bSize = ('width' in b && 'height' in b && 
                        typeof b.width === 'number' && typeof b.height === 'number') 
                      ? (b.width * b.height) : 0;
                          
        return bSize - aSize; // Büyükten küçüğe sırala
      });
      
      // En büyük görsel
      return sortedBySize[0].url;
    }

    // Bulunamadıysa ilk görüntüyü kullan
    return game.keyImages[0].url || '/placeholder.jpg';
  };

  // 10 saniyede bir öne çıkan oyunu değiştir
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prevIndex => 
        prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);
    
    return () => clearInterval(interval);
  }, [featuredGames]);

  // Manuel olarak önceki öne çıkan oyuna geç
  const goToPrevFeatured = useCallback(() => {
    if (featuredGames.length <= 1) return;
    setCurrentFeaturedIndex(prevIndex => 
      prevIndex === 0 ? featuredGames.length - 1 : prevIndex - 1
    );
  }, [featuredGames]);

  // Manuel olarak sonraki öne çıkan oyuna geç
  const goToNextFeatured = useCallback(() => {
    if (featuredGames.length <= 1) return;
    setCurrentFeaturedIndex(prevIndex => 
      prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
    );
  }, [featuredGames]);

  // Aktif platform için oyunları filtrele
  const getFilteredGames = () => {
    // Tüm filtreleme mantığını koru, ancak benzersiz oyunları dön
    const filteredByPlatform = activePlatform === "all" 
      ? [...freebieGames, ...steamFreeGames] 
      : [...freebieGames, ...steamFreeGames].filter(game => {
          const platform = game.distributionPlatform?.toLowerCase() || '';
          if (activePlatform === "pc") {
            return platform === "pc" || platform === "epic" || platform === "steam" || platform === "epic-games-store";
          }
          // Epic Games Store
          if (activePlatform === "epic") {
            return platform === "epic" || platform === "epic-games-store";
          }
          return platform === activePlatform;
        });
    
    // Benzersiz oyunları dön
    return getUniqueGames(filteredByPlatform);
  };

  const filteredGames = getFilteredGames();

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Platform card aktif durumu için stil sınıfları
  const getPlatformCardClass = (platform: string) => {
    return activePlatform === platform
      ? "bg-gradient-to-br from-purple-700 to-indigo-900 text-white border-2 border-purple-500"
      : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 hover:from-gray-700 hover:to-gray-800 border-2 border-transparent";
  };

  // Sekme aktif durumu için stil sınıfları
  const getTabClass = (tab: 'free' | 'upcoming' | 'trending' | 'loot' | 'beta') => {
    return activeTab === tab
      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      : "bg-gray-800 text-gray-300 hover:bg-gray-700";
  };

  // Kategori sayılarını göster
  const getCategoryCount = (tab: 'free' | 'upcoming' | 'trending' | 'loot' | 'beta') => {
    switch (tab) {
      case 'free':
        return freebieGames.length;
      case 'upcoming':
        return 0; // Epic API devre dışı olduğu için yakında çıkacak oyun yok
      case 'trending':
        return trendingGames.length;
      case 'loot':
        return freeLoots.length;
      case 'beta':
        return freeBetas.length;
      default:
        return 0;
    }
  };
  
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    } else if (sort === "price") {
      const aPrice = a.price?.totalPrice?.discountPrice || 0;
      const bPrice = b.price?.totalPrice?.discountPrice || 0;
      return aPrice - bPrice;
    }
    return 0;
  });

  // YouTube video URL'sinden video ID'sini çıkarma
  const getYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    
    // Youtube URL formatları:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    
    let videoId = '';
    
    // watch?v= formatını kontrol et
    if (url.includes('watch?v=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } 
    // youtu.be/ formatını kontrol et
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // embed/ formatını kontrol et
    else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    return videoId;
  };

  // Oyun videoları için optimum bir başlangıç süresini belirle
  const getOptimalStartTime = (videoId: string): number => {
    // Önceden belirlenmiş başlangıç süreleri
    const knownStartTimes: Record<string, number> = {
      // Popüler oyunlar için önerilen başlangıç süreleri (örnek)
      // Gerçek videoları tanımladığınızda burayı güncelleyin
      'dQw4w9WgXcQ': 42, // Örnek
      'jNQXAC9IVRw': 10, // Örnek
    };

    // Belirli bir video için özel başlangıç süresi varsa kullan
    if (videoId in knownStartTimes) {
      return knownStartTimes[videoId];
    }

    // Oyun tanıtım videolarının genellikle ilk 30-60 saniyesi daha ilgi çekici olur
    return Math.floor(Math.random() * 30) + 30;
  };

  // YouTube video thumbnail URL'sini oluştur
  const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault' = 'maxresdefault'): string => {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  };

  // CountdownTimer bileşeni - hero banner altında ve Home fonksiyonu dışında tanımla
  const CountdownTimer = ({ expiryDate }: { expiryDate: string | null | undefined }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryDate));

    useEffect(() => {
      if (!expiryDate) return;

      // Her saniye zamanı güncelle
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(expiryDate));
      }, 1000);

      // Cleanup
      return () => clearInterval(timer);
    }, [expiryDate]);

    // Süresi dolmuşsa gösterme
    if (timeLeft.isExpired) {
      return null;
    }

    // Zaman formatlarını iki haneli yap
    const formatTime = (time: number): string => {
      return time < 10 ? `0${time}` : `${time}`;
    };

    return (
      <div className="mb-5">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <BsClock className="h-4 w-4" />
            <span>Kampanya süresi</span>
          </div>
          
          <div className="flex gap-3 text-white">
            <div className="flex flex-col items-center">
              <div className="countdown-box">
                <span className="countdown-value">{formatTime(timeLeft.days)}</span>
              </div>
              <span className="countdown-label">Gün</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="countdown-box">
                <span className="countdown-value">{formatTime(timeLeft.hours)}</span>
              </div>
              <span className="countdown-label">Saat</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="countdown-box">
                <span className="countdown-value">{formatTime(timeLeft.minutes)}</span>
              </div>
              <span className="countdown-label">Dakika</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="countdown-box">
                <span className="countdown-value countdown-seconds">{formatTime(timeLeft.seconds)}</span>
              </div>
              <span className="countdown-label">Saniye</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Epic Games Store | Ücretsiz Oyunlar, Oyun Satın Al ve İndir</title>
        <meta name="description" content="Ücretsiz oyunlar, indirimler, yeni ve popüler oyunları Epic Games Store'da keşfedin ve satın alın" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-[#121212] min-h-screen text-white">
        <div className="epic-container pb-16">
          {/* Hero Banner Section */}
          <section className="mt-8">
            {featuredGames && featuredGames[currentFeaturedIndex] && (
              <div className="epic-hero overflow-hidden rounded-lg relative">
                {/* Hero Background Layer with Parallax Effect */}
                <div className="absolute inset-0 z-0 transform transition-transform duration-1000 scale-110 group-hover:scale-105">
                  <Image 
                    src={getBestGameImage(featuredGames[currentFeaturedIndex])}
                    alt={featuredGames[currentFeaturedIndex]?.title || 'Featured Game'}
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-700 hover:scale-105"
                  />
                  
                  {/* Modern Gradients and Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Animated Accents */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-[30%] right-[15%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: "2s"}}></div>
                    <div className="absolute top-[60%] left-[30%] w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: "3s"}}></div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent left-8 hidden md:block"></div>
                <div className="absolute h-1 w-1/3 bg-gradient-to-r from-blue-500/20 to-transparent bottom-16 left-0 hidden md:block"></div>
                
                {/* Content Container with Glass Effect */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start h-full">
                      <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left">
                        {/* Game Logo */}
                        {featuredGames[currentFeaturedIndex]?.keyImages?.find(img => img.type === 'DieselGameBoxLogo')?.url && (
                          <div className="h-28 mb-6 relative mx-auto lg:mx-0 max-w-md">
                            <Image
                              src={featuredGames[currentFeaturedIndex]?.keyImages?.find(img => img.type === 'DieselGameBoxLogo')?.url || ''}
                              alt={featuredGames[currentFeaturedIndex]?.title || 'Game Logo'}
                              fill
                              style={{ objectFit: 'contain', objectPosition: 'center left' }}
                              className="drop-shadow-xl"
                            />
                          </div>
                        )}
                        
                        {/* Game Title - shown if no logo */}
                        {!featuredGames[currentFeaturedIndex]?.keyImages?.find(img => img.type === 'DieselGameBoxLogo')?.url && (
                          <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl tracking-tight drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                            {featuredGames[currentFeaturedIndex]?.title}
                          </h1>
                        )}
                        
                        {/* Tags & Badges */}
                        <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mt-4">
                          <span className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md font-semibold shadow-lg animate-pulse">ÜCRETSİZ</span>
                          {/* Platform Badge */}
                          <span className="bg-black/50 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-md flex items-center gap-2 border border-white/10">
                            {isPlatformEpic(featuredGames[currentFeaturedIndex]) && <SiEpicgames className="w-4 h-4" />}
                            {isPlatformSteam(featuredGames[currentFeaturedIndex]) && <SiSteam className="w-4 h-4" />}
                            <span>{isPlatformEpic(featuredGames[currentFeaturedIndex]) ? 'Epic Games Store' : 'Steam'}</span>
                          </span>
                          
                          {/* Countdown Badge */}
                          {featuredGames[currentFeaturedIndex]?.expiryDate && !isNaN(new Date(featuredGames[currentFeaturedIndex]?.expiryDate).getTime()) && (
                            <div className="bg-black/40 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-md flex items-center gap-2 border border-white/10">
                              <BsClock className="w-4 h-4" />
                              <span>
                                {formatDate(featuredGames[currentFeaturedIndex]?.expiryDate)} tarihine kadar
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Description with Fancy Border */}
                        <div className="relative">
                          <div className="absolute left-0 top-0 w-1/3 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                          <p className="text-lg md:text-xl text-gray-200 max-w-3xl leading-relaxed pt-6 line-clamp-3 md:line-clamp-none">
                            {featuredGames[currentFeaturedIndex]?.description}
                          </p>
                          <div className="absolute left-0 bottom-0 w-1/4 h-1 bg-gradient-to-r from-transparent to-blue-500/30 rounded-full"></div>
                        </div>
                        
                        {/* CTA Buttons with Modern Style */}
                        <div className="flex flex-wrap items-center gap-4 mt-8 justify-center lg:justify-start">
                          <a 
                            href={featuredGames[currentFeaturedIndex]?.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="epic-hero-button"
                          >
                            <span>Şimdi Al</span>
                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                          <a 
                            href={`/game/${featuredGames[currentFeaturedIndex]?.id}`}
                            className="epic-hero-button-secondary"
                          >
                            <span>Daha Fazla</span>
                          </a>
                        </div>
                      </div>
                      
                      {/* Game Preview Card with 3D Effect */}
                      <div className="lg:w-2/5 flex justify-center items-center mt-8 lg:mt-0">
                        <div className="w-full max-w-xs aspect-[3/4] relative overflow-hidden rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-500 group perspective">
                          {/* 3D Card Container */}
                          <div className="relative w-full h-full transform transition-transform duration-700 preserve-3d group-hover:rotate-y-6">
                            <Image
                              src={getExistingBestImage(featuredGames[currentFeaturedIndex])}
                              alt={featuredGames[currentFeaturedIndex]?.title || 'Game Preview'}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="group-hover:scale-110 transition-transform duration-700"
                            />
                            
                            {/* Card Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            {/* Card Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            
                            {/* Free Tag with Glow */}
                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium shadow-glow">
                              ÜCRETSİZ
                            </div>
                            
                            {/* Platform */}
                            {(isPlatformEpic(featuredGames[currentFeaturedIndex]) || isPlatformSteam(featuredGames[currentFeaturedIndex])) && (
                              <div className="absolute top-3 right-3 bg-black/50 p-2 rounded-full backdrop-blur-sm border border-white/10">
                                {isPlatformEpic(featuredGames[currentFeaturedIndex]) && 
                                  <SiEpicgames className="w-5 h-5 text-white" />}
                                {isPlatformSteam(featuredGames[currentFeaturedIndex]) && 
                                  <SiSteam className="w-5 h-5 text-white" />}
                              </div>
                            )}
                            
                            {/* Card Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">{featuredGames[currentFeaturedIndex]?.title}</h3>
                              
                              {/* Countdown Timer with Glass Effect */}
                              {featuredGames[currentFeaturedIndex]?.expiryDate && !isNaN(new Date(featuredGames[currentFeaturedIndex]?.expiryDate).getTime()) && (
                                <div className="mt-3 bg-black/50 backdrop-blur-sm border border-white/10 p-3 rounded">
                                  <CountdownTimer expiryDate={featuredGames[currentFeaturedIndex]?.expiryDate} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Controls with Modern Floating Style */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-20">
                  <button 
                    onClick={goToPrevFeatured} 
                    className="bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur transition-all hover:scale-110 border border-white/10"
                    aria-label="Previous Game"
                  >
                    <MdNavigateBefore size={28} />
                  </button>
                  <button 
                    onClick={goToNextFeatured} 
                    className="bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur transition-all hover:scale-110 border border-white/10"
                    aria-label="Next Game"
                  >
                    <MdNavigateNext size={28} />
                  </button>
                </div>
                
                {/* Indicator Dots with Modern Style */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {featuredGames.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeaturedIndex(index)}
                      className={`transition-all shadow-lg ${
                        index === currentFeaturedIndex 
                          ? 'bg-blue-500 w-10 h-2 rounded-full' 
                          : 'bg-white/30 w-2 h-2 rounded-full hover:bg-white/60'
                      }`}
                      aria-label={`Öne çıkan oyun ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Free Games Section */}
          <section className="epic-section">
            <div className="epic-section-header">
              <h2 className="epic-section-title">Ücretsiz Oyunlar</h2>
              <Link href="/all-free-games" className="epic-section-link">Tümünü Görüntüle</Link>
            </div>
            
            <div className="epic-game-grid">
              {freebieGames.slice(0, 5).map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isFree 
                  showPlatform 
                />
              ))}
            </div>
          </section>

          {/* Platform Tabs */}
          <section className="epic-section">
            <div className="epic-section-header">
              <h2 className="epic-section-title">Platformlar</h2>
            </div>
            
            <div className="epic-tabs">
              <button 
                onClick={() => setActivePlatform("all")}
                className={`epic-tab ${activePlatform === "all" ? "epic-tab-active" : ""}`}
              >
                Tüm Platformlar
              </button>
              <button 
                onClick={() => setActivePlatform("pc")}
                className={`epic-tab ${activePlatform === "pc" ? "epic-tab-active" : ""}`}
              >
                PC
              </button>
              <button 
                onClick={() => setActivePlatform("epic")}
                className={`epic-tab ${activePlatform === "epic" ? "epic-tab-active" : ""}`}
              >
                Epic Games Store
              </button>
              <button 
                onClick={() => setActivePlatform("steam")}
                className={`epic-tab ${activePlatform === "steam" ? "epic-tab-active" : ""}`}
              >
                Steam
              </button>
              <button 
                onClick={() => setActivePlatform("playstation")}
                className={`epic-tab ${activePlatform === "playstation" ? "epic-tab-active" : ""}`}
              >
                PlayStation
              </button>
              <button 
                onClick={() => setActivePlatform("xbox")}
                className={`epic-tab ${activePlatform === "xbox" ? "epic-tab-active" : ""}`}
              >
                Xbox
              </button>
              <button 
                onClick={() => setActivePlatform("switch")}
                className={`epic-tab ${activePlatform === "switch" ? "epic-tab-active" : ""}`}
              >
                Nintendo
              </button>
            </div>
            
            <div className="epic-game-grid">
              {filteredGames.slice(0, 10).map(game => (
                <GameCard key={game.id} game={game} showPlatform />
              ))}
            </div>
          </section>

          {/* Trending Games Banner */}
          <section className="epic-banner">
            <Image
              src="/images/trending-banner.jpg"
              alt="Trend Oyunlar"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="epic-banner-content">
              <h2 className="text-3xl font-bold mb-4">Trend Oyunlar</h2>
              <p className="text-lg mb-6 max-w-xl">Şu anda oyuncuların en çok ilgisini çeken oyunları keşfedin.</p>
              <button
                onClick={() => setActiveTab('trending')}
                className="epic-button epic-button-primary"
              >
                Tümünü Görüntüle
              </button>
            </div>
          </section>

          {/* Trending Games Section */}
          <section className="epic-section">
            <div className="epic-section-header">
              <h2 className="epic-section-title">Trend Oyunlar</h2>
              <button 
                onClick={() => setActiveTab('trending')}
                className="epic-section-link"
              >
                Tümünü Görüntüle
              </button>
            </div>
            
            <div className="epic-game-grid">
              {trendingGames.slice(0, 5).map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  trending 
                  showPlatform 
                />
              ))}
            </div>
          </section>

          {/* Loot Section */}
          <section className="epic-section">
            <div className="epic-section-header">
              <h2 className="epic-section-title">Ücretsiz Loot ve DLC</h2>
              <button 
                onClick={() => setActiveTab('loot')}
                className="epic-section-link"
              >
                Tümünü Görüntüle
              </button>
            </div>
            
            <div className="epic-game-grid">
              {freeLoots.slice(0, 5).map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isLoot 
                  showPlatform 
                />
              ))}
            </div>
          </section>

          {/* Beta Section */}
          <section className="epic-section">
            <div className="epic-section-header">
              <h2 className="epic-section-title">Beta Erişimi</h2>
              <button 
                onClick={() => setActiveTab('beta')}
                className="epic-section-link"
              >
                Tümünü Görüntüle
              </button>
            </div>
            
            <div className="epic-game-grid">
              {freeBetas.slice(0, 5).map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  isBeta 
                  showPlatform 
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Epic API çağrıları geçici olarak devre dışı bırakıldı
    // Tüm API çağrılarını paralel olarak yap
    const [
      // epicGames,
      // upcomingGames,
      gpOnlyGames,
      gpLoot,
      gpBeta,
      steamGames,
      // Epic API trendings devre dışı
      // trendingGames
      trendingGamerPowerGames
    ] = await Promise.all([
      // fetchFreeGames(),
      // fetchUpcomingFreeGames(),
      getGamerPowerOnlyGamesAsEpicFormat(),
      getGamerPowerLootAsEpicFormat(),
      getGamerPowerBetaAsEpicFormat(),
      getFreeSteamGames(),
      // fetchTrendingGames(),
      getTrendingGamerPowerGames()
    ]);

    // Boş veri durumunda hata olmasın diye boş dizi kullan ve düzgün serileştirme yap
    const safelySerialize = (data: any) => {
      try {
        // Önce JSON.stringify ile test et, düzgün serileştirme için
        JSON.stringify(data);
        return data;
      } catch (e) {
        console.error('Serileştirme hatası:', e);
        // Hataya neden olan undefined değerleri null olarak değiştir
        return JSON.parse(JSON.stringify(data, (key, value) => 
          value === undefined ? null : value
        ));
      }
    };

    // Veriyi optimize et - sadece gerekli alanları tut
    const optimizeGameData = (games: ExtendedEpicGame[]): any[] => {
      if (!games || !Array.isArray(games)) return [];
      
      return games.map(game => {
        // Sadece gerekli alanları içeren yeni bir nesne oluştur
        const optimizedGame = {
          id: game.id,
          title: game.title,
          description: game.description?.substring(0, 150), // Açıklamayı kısalt
          url: game.url,
          distributionPlatform: game.distributionPlatform || null,
          platform: game.platform || null,
          isLoot: game.isLoot || null,
          isBeta: game.isBeta || null,
          offerType: game.offerType || null,
          sourceLabel: game.sourceLabel || null,
          videos: game.videos || null,
          price: game.price || null,
          keyImages: game.keyImages?.slice(0, 3) || null, // Sadece ilk 3 görseli al
          headerImage: game.headerImage || null,
          screenshots: game.screenshots?.slice(0, 2) || null, // Sadece ilk 2 ekran görüntüsünü al
        };
        
        return optimizedGame;
      }).filter(Boolean).slice(0, 20); // En fazla 20 oyun al
    };

    // Tüm oyunları bir araya getir - Epic oyunları dahil edilmedi
    const allGames = [
      // ...(epicGames || []), 
      ...(gpOnlyGames || []),
      ...(gpLoot || []), 
      ...(gpBeta || []),
      ...(steamGames || [])
    ];

    // Statik props olarak döndür
    return {
      props: {
        // Epic API oyunları geçici olarak devre dışı bırakıldı
        // epicFreeGames: safelySerialize(sanitizeEpicGames(epicGames || [])),
        // upcomingEpicGames: safelySerialize(sanitizeEpicGames(upcomingGames || [])),
        freebieGames: safelySerialize(optimizeGameData(gpOnlyGames || []).slice(0, 16)),
        freeLoots: safelySerialize(optimizeGameData(gpLoot || []).slice(0, 12)),
        freeBetas: safelySerialize(optimizeGameData(gpBeta || []).slice(0, 12)),
        steamFreeGames: safelySerialize(optimizeGameData(steamGames || []).slice(0, 16)),
        // trendingGames: safelySerialize(trendingGames || []),
        trendingGames: safelySerialize(optimizeGameData(trendingGamerPowerGames || []).slice(0, 16)),
        totalGames: allGames.length,
      },
      // Her 6 saatte bir yeniden oluştur
      revalidate: 21600
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    
    // Hata durumunda boş verilerle devam et
    return {
      props: {
        // Epic API oyunları geçici olarak kaldırıldı
        // epicFreeGames: [],
        // upcomingEpicGames: [],
        freebieGames: [],
        freeLoots: [],
        freeBetas: [],
        steamFreeGames: [],
        trendingGames: [],
        totalGames: 0,
      },
      // Hata durumunda daha sık yenileme dene
      revalidate: 3600
    };
  }
} 