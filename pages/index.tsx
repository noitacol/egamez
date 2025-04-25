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
  const [activePlatform, setActivePlatform] = useState<"all" | "epic" | "steam" | "playstation" | "xbox" | "switch" | "pc" | "android" | "ios">("all");
  const [filter, setFilter] = useState<"all" | "steam">("all");
  const [sort, setSort] = useState<"none" | "title" | "price">("none");

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

  // Oyun videoları için rastgele bir başlangıç süresini belirle
  const getRandomStartTime = (): number => {
    // Oyun tanıtım videolarının genellikle ilk 20-120 saniyesi daha ilgi çekici olur
    // 20-120 saniye arasında rastgele bir süre belirle
    return Math.floor(Math.random() * 100) + 20;
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
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeVideoId(featuredGames[currentFeaturedIndex]?.videos?.[0]?.url)}&controls=0&showinfo=0&rel=0&modestbranding=1&start=${getRandomStartTime()}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="absolute w-[300%] h-[300%] top-[-100%] left-[-100%] opacity-70"
                    loading="lazy"
                    style={{ pointerEvents: 'none' }}
                  ></iframe>
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
        <section className="modern-section container mx-auto px-4 py-10 lg:py-16">
          <h2 className="modern-section-title">
            Platformlar
          </h2>
          
          {/* Mobile için yatay kaydırılabilir menü */}
          <div className="flex md:hidden overflow-x-auto scrollbar-hide pb-4 -mx-1 space-x-2">
            <button 
              onClick={() => setActivePlatform("all")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "all" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Tüm platformlar için filtrele"
            >
              <AiOutlineAppstore className="text-2xl mb-1" />
              <span className="text-sm">Tümü</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("epic")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "epic" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Epic Games için filtrele"
            >
              <SiEpicgames className="text-2xl mb-1" />
              <span className="text-sm">Epic</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("steam")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "steam" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Steam için filtrele"
            >
              <SiSteam className="text-2xl mb-1" />
              <span className="text-sm">Steam</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("pc")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "pc" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="PC için filtrele"
            >
              <BsWindows className="text-2xl mb-1" />
              <span className="text-sm">PC</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("playstation")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "playstation" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="PlayStation için filtrele"
            >
              <SiPlaystation className="text-2xl mb-1" />
              <span className="text-sm">PlayStation</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("xbox")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "xbox" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Xbox için filtrele"
            >
              <FaXbox className="text-2xl mb-1" />
              <span className="text-sm">Xbox</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("switch")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "switch" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Nintendo Switch için filtrele"
            >
              <SiNintendoswitch className="text-2xl mb-1" />
              <span className="text-sm">Switch</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("android")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "android" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Android için filtrele"
            >
              <SiAndroid className="text-2xl mb-1" />
              <span className="text-sm">Android</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("ios")}
              className={`platform-button min-w-[90px] p-3 ${
                activePlatform === "ios" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="iOS için filtrele"
            >
              <SiApple className="text-2xl mb-1" />
              <span className="text-sm">iOS</span>
            </button>
          </div>
          
          {/* Tablet ve Desktop için Grid Layout */}
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
            <button 
              onClick={() => setActivePlatform("all")}
              className={`platform-button p-4 ${
                activePlatform === "all" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Tüm platformlar için filtrele"
            >
              <AiOutlineAppstore className="text-3xl mb-2" />
              <span>Tümü</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("epic")}
              className={`platform-button p-4 ${
                activePlatform === "epic" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Epic Games için filtrele"
            >
              <SiEpicgames className="text-3xl mb-2" />
              <span>Epic</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("steam")}
              className={`platform-button p-4 ${
                activePlatform === "steam" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Steam için filtrele"
            >
              <SiSteam className="text-3xl mb-2" />
              <span>Steam</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("pc")}
              className={`platform-button p-4 ${
                activePlatform === "pc" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="PC için filtrele"
            >
              <BsWindows className="text-3xl mb-2" />
              <span>PC</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("playstation")}
              className={`platform-button p-4 ${
                activePlatform === "playstation" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="PlayStation için filtrele"
            >
              <SiPlaystation className="text-3xl mb-2" />
              <span>PlayStation</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("xbox")}
              className={`platform-button p-4 ${
                activePlatform === "xbox" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Xbox için filtrele"
            >
              <FaXbox className="text-3xl mb-2" />
              <span className="text-sm">Xbox</span>
            </button>
            
            <button 
              onClick={() => setActivePlatform("switch")}
              className={`platform-button p-4 ${
                activePlatform === "switch" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Nintendo Switch için filtrele"
            >
              <SiNintendoswitch className="text-3xl mb-2" />
              <span className="text-sm">Switch</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("android")}
              className={`platform-button p-4 ${
                activePlatform === "android" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="Android için filtrele"
            >
              <SiAndroid className="text-3xl mb-2" />
              <span className="text-sm">Android</span>
            </button>
            
            <button
              onClick={() => setActivePlatform("ios")}
              className={`platform-button p-4 ${
                activePlatform === "ios" ? "platform-button-active" : "platform-button-inactive"
              }`}
              aria-label="iOS için filtrele"
            >
              <SiApple className="text-3xl mb-2" />
              <span className="text-sm">iOS</span>
            </button>
          </div>
        </section>

        {/* Game Categories */}
        <section className="modern-section container mx-auto px-4 py-10 lg:py-16">
          <h2 className="modern-section-title">
            <FaGamepad className="inline-block mr-2" />
            Oyun Kategorileri
          </h2>
          
          {/* Game Categories Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className={`tab-button ${activeTab === 'free' ? 'tab-button-active' : 'tab-button-inactive'}`}
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
              className={`tab-button ${activeTab === 'trending' ? 'tab-button-active' : 'tab-button-inactive'}`}
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
              className={`tab-button ${activeTab === 'loot' ? 'tab-button-active' : 'tab-button-inactive'}`}
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
              className={`tab-button ${activeTab === 'beta' ? 'tab-button-active' : 'tab-button-inactive'}`}
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

          {/* Sorting Controls */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
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