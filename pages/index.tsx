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
    // Tüm oyunları içeren bir dizi oluştur - sadece gerçek oyunları al (loot ve beta olmayanlar)
    const allGames = [...freebieGames, ...trendingGames];
    
    // Sadece Steam veya Epic platformundaki oyunları filtrele
    const platformGames = allGames.filter(game => {
      if (!game) return false;
      
      // Sadece Steam veya Epic platformundaki oyunları al
      const platform = game.distributionPlatform?.toLowerCase() || '';
      
      // loot veya beta olanları hariç tut
      const isLoot = game.isLoot || game.offerType === 'loot';
      const isBeta = game.isBeta || game.offerType === 'beta';
      
      // Sadece gerçek oyunları dahil et (loot ve beta olmayanlar)
      return (platform === 'steam' || platform === 'epic' || platform === 'pc') && !isLoot && !isBeta;
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
    
    // İki listeyi birleştir ve ilk 5 tanesini göster (10 yerine 5 yaparak veri boyutunu azaltıyoruz)
    const combinedGames = [...shuffledWithVideos, ...shuffledWithoutVideos].slice(0, 5);
    
    console.log('Öne çıkan oyun sayısı:', combinedGames.length);
    console.log('Video içeren oyun sayısı:', shuffledWithVideos.length);
    
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
    let games: ExtendedEpicGame[] = [];

    // İlk olarak sekme bazında oyunları seç
    if (activeTab === 'free') {
      games = [...freebieGames];
    } else if (activeTab === 'upcoming') {
      // Şimdilik hiç yakında çıkacak oyun göstermeyelim çünkü epic oyunları kaldırıldı
      games = [];
    } else if (activeTab === 'trending') {
      games = [...trendingGames];
    } else if (activeTab === 'loot') {
      games = [...freeLoots];
    } else if (activeTab === 'beta') {
      games = [...freeBetas];
    }

    // Null ve undefined oyunları temizle
    games = games.filter(game => game && game.title);

    // Sonra platform bazında filtrele
    if (activePlatform !== 'all') {
      return games.filter(game => {
        // Oyun null veya undefined ise filtrele
        if (!game) {
          return false;
        }

        const platform = game.distributionPlatform?.toLowerCase() || '';
        const platformName = game.platform?.toLowerCase() || '';
        
        switch (activePlatform) {
          case 'steam':
            return platform.includes('steam') || platformName.includes('steam');
          case 'playstation':
            return platformName.includes('playstation') || platformName.includes('ps4') || platformName.includes('ps5');
          case 'xbox':
            return platformName.includes('xbox');
          case 'switch':
            return platformName.includes('switch');
          case 'pc':
            return platformName.includes('pc') || platformName.includes('windows');
          case 'android':
            return platformName.includes('android');
          case 'ios':
            return platformName.includes('ios') || platformName.includes('apple');
          default:
            return true;
        }
      });
    }

    return games;
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
        <title>FRPG Gaming - Ücretsiz Oyunları Keşfedin</title>
        <meta name="description" content="Tüm platformlardaki ücretsiz oyunları keşfedin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
        {/* Hero Banner */}
        {featuredGames && 
         featuredGames[currentFeaturedIndex] && 
         featuredGames[currentFeaturedIndex]?.videos && 
         Array.isArray(featuredGames[currentFeaturedIndex]?.videos) && 
         featuredGames[currentFeaturedIndex]?.videos.length > 0 ? (
          <section className="hero-banner-qamico relative h-[650px] md:h-[700px] w-full overflow-hidden mb-12">
            <div className="absolute inset-0 z-10 bg-black/50"></div>
            
            {/* Dekoratif Çizgiler */}
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              <div className="absolute left-1/4 w-[1px] h-full opacity-20 bg-gradient-to-b from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute right-1/4 w-[1px] h-full opacity-20 bg-gradient-to-b from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute top-1/3 w-full h-[1px] opacity-20 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute bottom-1/3 w-full h-[1px] opacity-20 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
            </div>

            {/* Arkaplan Video ve Resim */}
            <div className="absolute inset-0 z-0 bg-gray-900">
              {/* Arkaplan Resmi */}
              <div className="absolute inset-0">
                <Image
                  src={getBestGameImage(featuredGames[currentFeaturedIndex] || {})}
                  alt={featuredGames[currentFeaturedIndex]?.title || 'Öne Çıkan Oyun'}
                  layout="fill"
                  objectFit="cover"
                  className="opacity-40"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/50 to-gray-900/80"></div>
              </div>
              
              {/* Video (eğer varsa) */}
              <div className="relative w-full h-full overflow-hidden">
                {featuredGames[currentFeaturedIndex]?.videos?.[0]?.url && getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url) ? (
                  <>
                    {/* Özel yüksek kaliteli thumbnail resmi - video yüklenene kadar gösterilir */}
                    <div className="absolute inset-0 bg-black">
                      <Image 
                        src={getYouTubeThumbnail(getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url))}
                        alt={featuredGames[currentFeaturedIndex]?.title || 'Oyun videosu'} 
                        layout="fill"
                        objectFit="cover"
                        className="opacity-70"
                        priority
                      />
                    </div>
                    
                    {/* YouTube video iframe */}
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url)}&controls=0&showinfo=0&rel=0&modestbranding=1&start=${getOptimalStartTime(getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url))}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="absolute w-[300%] md:w-[180%] lg:w-[130%] h-[300%] md:h-[180%] lg:h-[130%] top-[-100%] md:top-[-40%] lg:top-[-15%] left-[-100%] md:left-[-40%] lg:left-[-15%] opacity-70"
                      loading="lazy"
                      style={{ pointerEvents: 'none' }}
                    ></iframe>
                  </>
                ) : null}
              </div>
            </div>

            {/* İçerik */}
            <div className="relative z-20 container mx-auto flex flex-col items-center justify-center h-full px-4">
              <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto">
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="qamico-hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4">
                    <span className="text-outline-qamico">{featuredGames[currentFeaturedIndex]?.title?.split(' ')?.[0] || ''}</span>
                    <span className="block mt-1 text-white">{featuredGames[currentFeaturedIndex]?.title?.split(' ')?.slice(1).join(' ') || ''}</span>
                  </h2>
                  
                  <p className="text-gray-200 text-lg mb-8 max-w-xl">
                    {featuredGames[currentFeaturedIndex]?.description?.slice(0, 120)}
                    {featuredGames[currentFeaturedIndex]?.description && featuredGames[currentFeaturedIndex]?.description.length > 120 ? '...' : ''}
                  </p>
                  
                  {/* Zamanlayıcı (eğer son kullanma tarihi varsa) */}
                  {featuredGames[currentFeaturedIndex]?.expiryDate && (
                    <div className="flex items-center justify-center md:justify-start mb-8 text-orange-400 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Bitiş: {featuredGames[currentFeaturedIndex]?.expiryDate ? new Date(featuredGames[currentFeaturedIndex]?.expiryDate).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a
                      href={featuredGames[currentFeaturedIndex]?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qamico-button inline-flex items-center px-8 py-3 text-lg font-medium text-white rounded-full"
                    >
                      GÖRÜNTÜLE
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
                  <div className="relative w-full max-w-md">
                    <Image
                      src={getBestGameImage(featuredGames[currentFeaturedIndex] || {})}
                      alt={featuredGames[currentFeaturedIndex]?.title || 'Öne Çıkan Oyun'}
                      width={500}
                      height={300}
                      className="rounded-lg shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Kontrolleri (Dikey) */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-3">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeaturedIndex 
                      ? 'bg-orange-500 scale-110' 
                      : 'bg-gray-400 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Özellik ${index + 1}`}
                />
              ))}
            </div>
          </section>
        ) : featuredGames && featuredGames.length > 0 ? (
          <section className="hero-banner-qamico relative h-[650px] md:h-[700px] w-full overflow-hidden mb-12">
            <div className="absolute inset-0 z-10 bg-black/50"></div>
            
            {/* Dekoratif Çizgiler */}
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              <div className="absolute left-1/4 w-[1px] h-full opacity-20 bg-gradient-to-b from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute right-1/4 w-[1px] h-full opacity-20 bg-gradient-to-b from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute top-1/3 w-full h-[1px] opacity-20 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
              <div className="absolute bottom-1/3 w-full h-[1px] opacity-20 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
            </div>
            
            {/* Arkaplan Resmi */}
            <div className="absolute inset-0 z-0">
              <div className="relative w-full h-full">
                <Image
                  src={getBestGameImage(featuredGames[currentFeaturedIndex] || {})}
                  alt={featuredGames[currentFeaturedIndex]?.title || 'Öne Çıkan Oyun'}
                  layout="fill"
                  objectFit="cover"
                  className="opacity-40"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/50 to-gray-900/80"></div>
              </div>
            </div>

            {/* İçerik */}
            <div className="relative z-20 container mx-auto flex flex-col items-center justify-center h-full px-4">
              <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto">
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="qamico-hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4">
                    <span className="text-outline-qamico">{featuredGames[currentFeaturedIndex]?.title?.split(' ')?.[0] || ''}</span>
                    <span className="block mt-1 text-white">{featuredGames[currentFeaturedIndex]?.title?.split(' ')?.slice(1).join(' ') || ''}</span>
                  </h2>
                  
                  <p className="text-gray-200 text-lg mb-8 max-w-xl">
                    {featuredGames[currentFeaturedIndex]?.description?.slice(0, 120)}
                    {featuredGames[currentFeaturedIndex]?.description && featuredGames[currentFeaturedIndex]?.description.length > 120 ? '...' : ''}
                  </p>
                  
                  {/* Zamanlayıcı (eğer son kullanma tarihi varsa) */}
                  {featuredGames[currentFeaturedIndex]?.expiryDate && (
                    <div className="flex items-center justify-center md:justify-start mb-8 text-orange-400 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Bitiş: {featuredGames[currentFeaturedIndex]?.expiryDate ? new Date(featuredGames[currentFeaturedIndex]?.expiryDate).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a
                      href={featuredGames[currentFeaturedIndex]?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qamico-button inline-flex items-center px-8 py-3 text-lg font-medium text-white rounded-full"
                    >
                      GÖRÜNTÜLE
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
                  <div className="relative w-full max-w-md shadow-2xl rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={getBestGameImage(featuredGames[currentFeaturedIndex] || {})}
                      alt={featuredGames[currentFeaturedIndex]?.title || 'Öne Çıkan Oyun'}
                      width={500}
                      height={300}
                      className="w-full h-auto rounded-lg"
                      priority
                    />
                    
                    {/* Platform badge */}
                    {featuredGames[currentFeaturedIndex]?.distributionPlatform && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {featuredGames[currentFeaturedIndex].distributionPlatform}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Kontrolleri (Dikey) */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-3">
              {featuredGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeaturedIndex 
                      ? 'bg-orange-500 scale-110' 
                      : 'bg-gray-400 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Özellik ${index + 1}`}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Platform Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">Oyun Platformları</h2>
          
          {/* Platform Selection Buttons */}
          <div className="platform-scroll-container">
            <div className="platform-buttons-container">
              <button
                onClick={() => setActivePlatform("all")}
                className={`platform-button ${activePlatform === "all" ? "active" : ""}`}
              >
                <span className="platform-icon all-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </span>
                <span className="platform-name">Tüm Platformlar</span>
              </button>
              <button
                onClick={() => setActivePlatform("pc")}
                className={`platform-button ${activePlatform === "pc" ? "active" : ""}`}
              >
                <span className="platform-icon pc-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="2" x2="9" y2="4"></line><line x1="15" y1="2" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="22"></line><line x1="15" y1="20" x2="15" y2="22"></line><line x1="20" y1="9" x2="22" y2="9"></line><line x1="20" y1="14" x2="22" y2="14"></line><line x1="2" y1="9" x2="4" y2="9"></line><line x1="2" y1="14" x2="4" y2="14"></line></svg>
                </span>
                <span className="platform-name">PC</span>
              </button>
              <button
                onClick={() => setActivePlatform("epic")}
                className={`platform-button ${activePlatform === "epic" ? "active" : ""}`}
              >
                <span className="platform-icon epic-icon">
                  <svg viewBox="0 0 256 345" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="currentColor">
                    <path d="M210.49,91.1 L136.786,91.1 L136.786,161.39 L210.49,161.39 L210.49,91.1 Z M91.1,91.1 L17.615,91.1 L17.615,161.39 L91.1,161.39 L91.1,91.1 Z M150.88,175.484 L150.88,254.01 L224.365,254.01 L224.365,175.484 L150.88,175.484 Z M31.71,175.484 L31.71,254.01 L105.195,254.01 L105.195,175.484 L31.71,175.484 Z"></path>
                  </svg>
                </span>
                <span className="platform-name">Epic Games</span>
              </button>
              <button
                onClick={() => setActivePlatform("steam")}
                className={`platform-button ${activePlatform === "steam" ? "active" : ""}`}
              >
                <span className="platform-icon steam-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C7.4,22 3.55,18.92 2.36,14.73L6.19,16.31C6.45,17.6 7.6,18.58 8.97,18.58C10.53,18.58 11.8,17.31 11.8,15.75V15.62L15.2,13.19H15.28C17.36,13.19 19.05,11.5 19.05,9.42C19.05,7.34 17.36,5.65 15.28,5.65C13.2,5.65 11.5,7.34 11.5,9.42V9.47L9.13,12.93L8.97,12.92C8.38,12.92 7.83,13.1 7.38,13.41L2,11.2C2.43,6.05 6.73,2 12,2M8.28,17.17C9.08,17.5 10,17.13 10.33,16.33C10.66,15.53 10.28,14.62 9.5,14.29L8.22,13.76C8.71,13.58 9.26,13.57 9.78,13.73C10.31,13.89 10.75,14.22 11.04,14.68C11.34,15.14 11.46,15.7 11.38,16.24C11.31,16.8 11.03,17.29 10.58,17.59C10.13,17.89 9.58,18 9.03,17.92C8.48,17.84 7.97,17.59 7.63,17.16L8.28,17.17M15.28,6.92C16.62,6.92 17.71,8.01 17.71,9.35C17.71,10.69 16.62,11.78 15.28,11.78C13.94,11.78 12.85,10.69 12.85,9.35C12.85,8.01 13.94,6.92 15.28,6.92M15.28,7.57C14.30,7.57 13.5,8.37 13.5,9.35C13.5,10.33 14.30,11.13 15.28,11.13C16.26,11.13 17.06,10.33 17.06,9.35C17.06,8.37 16.26,7.57 15.28,7.57Z" /></svg>
                </span>
                <span className="platform-name">Steam</span>
              </button>
              <button
                onClick={() => setActivePlatform("playstation")}
                className={`platform-button ${activePlatform === "playstation" ? "active" : ""}`}
              >
                <span className="platform-icon ps-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5,4.27C10.88,4.53 12.9,5.04 14,5.3C16.75,5.94 17.69,6.34 17.69,9.42C17.69,12.23 16.19,13.22 14.5,13.22C13.18,13.22 11.15,12.96 9.5,12.46V4.27M9.5,13.41C11.54,14.07 13.37,14.46 14.5,14.46C16.94,14.46 19.1,13.44 19.1,9.42C19.1,5.12 16.97,4.55 14.5,4C12.93,3.63 10.03,3.07 9.5,3L9.5,2C14.3,2 20,2.43 20,9.42C20,16.04 16.04,15.72 14.5,15.72C12.89,15.72 11.2,15.33 9.5,14.83V13.41M3.5,7.42C3.5,7.42 6.11,6.95 8,7.42V18C6.77,17.8 5.17,17.69 3.5,18V7.42M3.5,6.26V5.21C5.55,4 7.18,3.29 8,3.29V6.26C6.84,5.96 5.07,5.96 3.5,6.26M8,19.25C6.4,19.25 5.18,19.68 3.5,20.4V19.25C5.2,18.73 6.71,18.73 8,19.25M3.5,20.4V21C5.08,20.44 6.5,20 8,20V19.25" /></svg>
                </span>
                <span className="platform-name">PlayStation</span>
              </button>
              <button
                onClick={() => setActivePlatform("xbox")}
                className={`platform-button ${activePlatform === "xbox" ? "active" : ""}`}
              >
                <span className="platform-icon xbox-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.43,3.72C6.5,3.66 6.57,3.6 6.62,3.56C8.18,2.16 10,1.31 12,1.31C13.77,1.31 15.39,2 16.85,3.13C16.89,3.16 16.93,3.18 16.97,3.22C17.07,3.29 17.17,3.37 17.25,3.46C17.5,3.72 17.5,4.12 17.25,4.37L13.87,7.8C13.62,8.05 13.22,8.05 12.97,7.8C12.72,7.54 12.72,7.14 12.97,6.89L15.97,3.85C15.93,3.83 15.9,3.79 15.85,3.76C14.72,2.86 13.41,2.31 12,2.31C10.34,2.31 8.81,3.02 7.63,4.1C7.6,4.12 7.58,4.15 7.55,4.18C7.55,4.18 7.55,4.18 7.55,4.18L7.55,4.18L4.72,7.05L4.77,7.01C4.42,7.36 3.89,7.36 3.54,7.01C3.19,6.66 3.19,6.12 3.54,5.77L6.43,3.72M3,12C3,8.77 5.16,5.86 8,4.67C8.28,4.58 8.59,4.63 8.91,4.78C8.91,4.78 8.91,4.78 8.91,4.78L9.72,5.24C10.03,5.42 10.11,5.84 9.92,6.16C9.73,6.47 9.31,6.56 9,6.37L8.36,6L8.36,6C6.31,6.92 5,9.27 5,12C5,13.57 5.46,15.03 6.24,16.26L6.24,16.26C6.5,16.63 6.5,17.17 6.14,17.5C5.78,17.84 5.23,17.85 4.87,17.5C4.87,17.5 4.87,17.5 4.87,17.5C3.71,15.92 3,14.08 3,12M12,21C9.56,21 7.22,20.05 5.54,18.17C5.25,17.85 5.31,17.35 5.65,17.04C6,16.73 6.5,16.77 6.8,17.09C8.5,18.91 10.47,19.13 12,19.13C13.58,19.13 15.65,18.37 17.43,16.34C17.76,15.97 18.32,15.92 18.69,16.25C19.07,16.58 19.08,17.14 18.75,17.5C16.56,20.01 14.22,21 12,21M20.59,16.87C20.13,16.87 19.75,16.59 19.62,16.16C19.46,15.63 19.81,15.07 20.34,14.92C20.37,14.91 20.39,14.91 20.42,14.9C20.42,14.9 20.42,14.9 20.42,14.9C21.38,14.55 22,13.85 22,12C22,9.95 20.34,8.16 18.16,7.42C18.16,7.42 18.16,7.42C17.64,7.26 17.34,6.73 17.5,6.2C17.66,5.68 18.19,5.38 18.72,5.54C18.75,5.55 18.77,5.56 18.79,5.57C18.79,5.57 18.79,5.57 18.79,5.57C21.63,6.53 24,9.46 24,12C24,14.92 22.2,16.36 20.59,16.87Z" /></svg>
                </span>
                <span className="platform-name">Xbox</span>
              </button>
              <button
                onClick={() => setActivePlatform("switch")}
                className={`platform-button ${activePlatform === "switch" ? "active" : ""}`}
              >
                <span className="platform-icon switch-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.04,20.4H7.12C6.19,20.4 5.3,20 4.64,19.36C4,18.7 3.6,17.81 3.6,16.88V7.12C3.6,6.19 4,5.3 4.64,4.64C5.3,4 6.19,3.62 7.12,3.62H10.04V20.4M7.12,2A5.12,5.12 0 0,0 2,7.12V16.88C2,19.71 4.29,22 7.12,22H11.65V2H7.12M5.11,8C5.11,9.04 5.95,9.88 7,9.88C8.03,9.88 8.87,9.04 8.87,8C8.87,6.96 8.03,6.12 7,6.12C5.95,6.12 5.11,6.96 5.11,8M17.61,11C18.72,11 19.62,11.89 19.62,13C19.62,14.12 18.72,15 17.61,15C16.5,15 15.58,14.12 15.58,13C15.58,11.89 16.5,11 17.61,11M16.88,22A5.12,5.12 0 0,0 22,16.88V7.12C22,4.29 19.71,2 16.88,2H13.65V22H16.88Z" /></svg>
                </span>
                <span className="platform-name">Switch</span>
              </button>
              <button
                onClick={() => setActivePlatform("android")}
                className={`platform-button ${activePlatform === "android" ? "active" : ""}`}
              >
                <span className="platform-icon android-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.2,16.8H8.8V18.4H7.2M16.8,16.8H18.4V18.4H16.8M4,18.4H5.6V20H4M4,10.4H5.6V12H4M16,4H8A8,8 0 0,0 0,12V20A2.39,2.39 0 0,0 2.4,22.4H21.6A2.39,2.39 0 0,0 24,20V12A8,8 0 0,0 16,4M2.4,12A5.6,5.6 0 0,1 8,6.4H16A5.6,5.6 0 0,1 21.6,12V20H2.4V12M20,16.8H22.4V18.4H20M20,10.4H22.4V12H20" /></svg>
                </span>
                <span className="platform-name">Android</span>
              </button>
              <button
                onClick={() => setActivePlatform("ios")}
                className={`platform-button ${activePlatform === "ios" ? "active" : ""}`}
              >
                <span className="platform-icon ios-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,1C13.66,1 15,2.34 15,4C15,5.65 13.66,7 12,7C10.35,7 9,5.65 9,4C9,2.34 10.35,1 12,1M12,9C13.66,9 15,10.34 15,12C15,13.65 13.66,15 12,15C10.35,15 9,13.65 9,12C9,10.34 10.35,9 12,9M12,17C13.66,17 15,18.34 15,20C15,21.65 13.66,23 12,23C10.35,23 9,21.65 9,20C9,18.34 10.35,17 12,17M18,8C19.66,8 21,9.34 21,11C21,12.65 19.66,14 18,14C16.35,14 15,12.65 15,11C15,9.34 16.35,8 18,8M6,8C7.66,8 9,9.34 9,11C9,12.65 7.66,14 6,14C4.35,14 3,12.65 3,11C3,9.34 4.35,8 6,8Z" /></svg>
                </span>
                <span className="platform-name">iOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-white">
            {platformDisplayNames[activePlatform] || platformDisplayNames['all']} Oyunları
          </h2>
          
          <div className="game-grid">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Game Categories */}
        <section className="modern-section container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="modern-section-title flex items-center">
              <FaGamepad className="inline-block mr-2 text-blue-500" />
              <span>Oyun Kategorileri</span>
            </h2>
            
            {/* Sorting Controls - for desktop */}
            <div className="hidden md:flex items-center gap-2 bg-gray-800 p-1 rounded-lg shadow-inner mb-6 md:mb-0">
              <ToggleGroup type="single" value={sort} onValueChange={(value) => setSort(value as any)} className="flex">
                <ToggleGroupItem 
                  value="none" 
                  aria-label="Varsayılan Sıralama" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("none")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">Varsayılan</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="title" 
                  aria-label="İsme Göre Sırala" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("title")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">İsme Göre</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="price" 
                  aria-label="Fiyata Göre Sırala" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("price")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">Fiyata Göre</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          {/* Game Categories Buttons */}
          <div className="platform-scroll-container md:flex flex-wrap gap-3 mb-6">
            <button
              className={`tab-button platform-scroll-item ${activeTab === 'free' ? 'tab-button-active' : 'tab-button-inactive'}`}
              onClick={() => setActiveTab('free')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('free')}
            >
              <BiGift className="h-4 w-4" />
              <span>Ücretsiz Oyunlar</span>
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                {getCategoryCount('free')}
              </span>
            </button>

            <button
              className={`tab-button platform-scroll-item ${activeTab === 'trending' ? 'tab-button-active' : 'tab-button-inactive'}`}
              onClick={() => setActiveTab('trending')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('trending')}
            >
              <FaFire className="h-4 w-4" />
              <span>Trend</span>
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                {getCategoryCount('trending')}
              </span>
            </button>

            <button
              className={`tab-button platform-scroll-item ${activeTab === 'loot' ? 'tab-button-active' : 'tab-button-inactive'}`}
              onClick={() => setActiveTab('loot')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('loot')}
            >
              <BsGift className="h-4 w-4" />
              <span>Loot</span>
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                {getCategoryCount('loot')}
              </span>
            </button>

            <button
              className={`tab-button platform-scroll-item ${activeTab === 'beta' ? 'tab-button-active' : 'tab-button-inactive'}`}
              onClick={() => setActiveTab('beta')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('beta')}
            >
              <RiTestTubeFill className="h-4 w-4" />
              <span>Beta</span>
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-white/20 text-xs">
                {getCategoryCount('beta')}
              </span>
            </button>
          </div>

          {/* Sorting Controls - for mobile */}
          <div className="flex md:hidden flex-wrap justify-between gap-3 mb-6">
            <div className="flex gap-2 bg-gray-800 p-1 rounded-lg shadow-inner">
              <ToggleGroup type="single" value={sort} onValueChange={(value) => setSort(value as any)} className="flex">
                <ToggleGroupItem 
                  value="none" 
                  aria-label="Varsayılan Sıralama" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("none")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">Varsayılan</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="title" 
                  aria-label="İsme Göre Sırala" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("title")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">İsme Göre</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="price" 
                  aria-label="Fiyata Göre Sırala" 
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSort("price")}
                  className="bg-gray-700 text-xs px-3 py-1 rounded-md data-[state=on]:bg-blue-600"
                >
                  <span className="text-xs">Fiyata Göre</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Games Grid */}
          <div className="game-grid">
            {sortedGames.length > 0 ? (
              sortedGames.map((game) => (
                <GameCard 
                  key={`${game.id}-${game.title}`} 
                  game={game} 
                  isFree={activeTab === 'free'} 
                  isUpcoming={activeTab === 'upcoming'} 
                  trending={activeTab === 'trending'}
                  isLoot={activeTab === 'loot'}
                  isBeta={activeTab === 'beta'}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-lg sm:text-xl text-gray-400">Bu kategoride şu anda oyun bulunmuyor.</p>
                </div>
            )}
          </div>
        </section>
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