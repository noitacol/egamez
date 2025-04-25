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
} from "@/lib/gamerpower-api";
import { getFreeSteamGames } from "@/lib/steam-api";
import FreeGamesList from "@/components/FreeGamesList";
import GameCard from "@/components/GameCard";
import { ExtendedEpicGame } from "@/lib/types";
import { SiEpicgames, SiSteam, SiNintendoswitch, SiGogdotcom, SiAndroid, SiApple, SiPlaystation, SiBox } from "react-icons/si";
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
import { GiftIcon } from "lucide-react";
import { sourcePlatformIcon } from "../lib/utils";

interface HomeProps {
  // Epic API oyunları geçici olarak kaldırıldı
  // epicFreeGames: ExtendedEpicGame[];
  // upcomingEpicGames: ExtendedEpicGame[];
  freebieGames: ExtendedEpicGame[];
  freeLoots: ExtendedEpicGame[];
  freeBetas: ExtendedEpicGame[];
  steamFreeGames: ExtendedEpicGame[];
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
  // Oyun tanıtım videolarının çoğunda ilk 20 saniye intro/logo olabilir,
  // 20-120 saniye arası genellikle oyun videoları için ideal oynanış kısmıdır
  return Math.floor(Math.random() * 100) + 20;
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
  
  // Ücretsiz oyunlar sliderı için state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [freeGamesForSlider, setFreeGamesForSlider] = useState<ExtendedEpicGame[]>([]);
  const sliderItemsCount = 3; // Bir sayfada görüntülenecek oyun sayısı

  // Site her yüklendiğinde en üste scroll yapmak için
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Steam ve Epic platformlarındaki oyunları topla ve öne çıkan oyunlar listesini oluştur
  useEffect(() => {
    // Tüm oyunları içeren bir dizi oluştur
    let allGames = [...freebieGames, ...steamFreeGames];
    
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
  }, [freebieGames, steamFreeGames]);

  // Ücretsiz oyunlar sliderı için otomatik geçiş
  useEffect(() => {
    const autoSlideInterval = setInterval(() => {
      if (freeGamesForSlider.length > sliderItemsCount) {
        setCurrentSlideIndex(prev => 
          prev >= Math.ceil(freeGamesForSlider.length / sliderItemsCount) - 1 ? 0 : prev + 1
        );
      }
    }, 10000); // 10 saniyede bir
    
    return () => clearInterval(autoSlideInterval);
  }, [freeGamesForSlider.length]);
  
  // Ücretsiz oyunlar ve Steam oyunlarını birleştir ve benzersiz olanları al
  useEffect(() => {
    const combinedFreeGames = getUniqueGames([...freebieGames, ...steamFreeGames]);
    setFreeGamesForSlider(combinedFreeGames);
  }, [freebieGames, steamFreeGames]);
  
  // Slider navigasyon fonksiyonları
  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => 
      prev >= Math.ceil(freeGamesForSlider.length / sliderItemsCount) - 1 ? 0 : prev + 1
    );
  };
  
  const goToPrevSlide = () => {
    setCurrentSlideIndex(prev => 
      prev <= 0 ? Math.ceil(freeGamesForSlider.length / sliderItemsCount) - 1 : prev - 1
    );
  };

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
        return 0; // trendingGames state removed
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

      <main className="bg-[#121212] min-h-screen text-white scroll-smooth">
        <div className="epic-container pb-16 pt-4">
          {/* Hero Banner Section */}
          <section className="mt-0">
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
                  
                  {/* YouTube Video Layer */}
                  {featuredGames[currentFeaturedIndex]?.videos?.[0]?.url && (
                    <div className="absolute inset-0 z-0">
                      {(() => {
                        const videoUrl = featuredGames[currentFeaturedIndex]?.videos?.[0]?.url || '';
                        const videoId = getYouTubeVideoId(videoUrl);
                        
                        if (!videoId) return null;
                        
                        const randomStartTime = getRandomStartTime();
                        
                        return (
                          <iframe 
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&start=${randomStartTime}&modestbranding=1`}
                            className="w-full h-full object-cover pointer-events-none opacity-60"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            title={featuredGames[currentFeaturedIndex]?.title || 'Game Trailer'}
                          />
                        );
                      })()}
                    </div>
                  )}
                  
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

          {/* Ücretsiz Oyunlar Slider */}
          <section className="mt-16">
            <div className="game-slider-container">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <GiftIcon className="h-8 w-8 text-red-500" />
                Ücretsiz Oyunlar
              </h2>
              
              <div className="slider-navigation">
                <button 
                  onClick={goToPrevSlide} 
                  className="slider-arrow"
                  aria-label="Önceki oyunlar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={goToNextSlide} 
                  className="slider-arrow"
                  aria-label="Sonraki oyunlar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-hidden">
                <div 
                  className="game-slider"
                  style={{ 
                    transform: `translateX(-${currentSlideIndex * (100 / sliderItemsCount)}%)`,
                  }}
                >
                  {freeGamesForSlider.map((game) => (
                    <div key={game.id} className="game-slide">
                      <div className="game-slide-image">
                        <img 
                          src={game.keyImages?.[0]?.url || getBestGameImage(game)} 
                          alt={game.title} 
                          className="w-full h-full object-cover"
                          loading="lazy" 
                        />
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          ÜCRETSİZ
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      </div>
                      <div className="game-slide-content">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={sourcePlatformIcon(game.platform || '')} 
                            alt={game.platform || 'Platform'} 
                            className="w-5 h-5" 
                          />
                          <span className="text-xs text-gray-400">{game.platform || 'Bilinmeyen Platform'}</span>
                        </div>
                        <h3 className="game-slide-title">{game.title}</h3>
                        <p className="game-slide-description">{game.description?.substring(0, 100) || 'Bu oyunu kaçırma! Sınırlı süre için ücretsiz.'}</p>
                        <Link href={`/game/${game.id}`}>
                          <a className="game-slide-button">
                            İncele
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                          </a>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="slider-dots">
                {Array.from({ length: Math.ceil(freeGamesForSlider.length / sliderItemsCount) }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`slider-dot ${currentSlideIndex === index ? 'slider-dot-active' : ''}`}
                    onClick={() => setCurrentSlideIndex(index)}
                    aria-label={`Sayfa ${index + 1}`}
                    role="button"
                    tabIndex={0}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Platform Tabs */}
          <section className="mt-12 modern-section">
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                {activePlatform === "all" ? "Tüm Platformlar" : activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1)}
              </h2>
              
              <div className="platform-scroll-container">
                <button 
                  className={`platform-button ${activePlatform === "all" ? "active" : ""}`}
                  onClick={() => setActivePlatform("all")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M21 13V11C21 7.183 17.817 4 14 4H10C6.183 4 3 7.183 3 11V13C2.45 13 2 13.45 2 14V19C2 19.55 2.45 20 3 20H9C9.55 20 10 19.55 10 19V14C10 13.45 9.55 13 9 13V11C9 10.2044 9.31607 9.44129 9.87868 8.87868C10.4413 8.31607 11.2044 8 12 8C12.7956 8 13.5587 8.31607 14.1213 8.87868C14.6839 9.44129 15 10.2044 15 11V13C14.45 13 14 13.45 14 14V19C14 19.55 14.45 20 15 20H21C21.55 20 22 19.55 22 19V14C22 13.45 21.55 13 21 13Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Tümü</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "pc" ? "active" : ""}`}
                  onClick={() => setActivePlatform("pc")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M20 18C21.1 18 22 17.1 22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">PC</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "epic" ? "active" : ""}`}
                  onClick={() => setActivePlatform("epic")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M12 1L21 6.5V17.5L12 23L3 17.5V6.5L12 1ZM12 3.311L5 7.65311V16.3469L12 20.689L19 16.3469V7.65311L12 3.311ZM6.5 9H11.5V11H8.5V13H11.5V15H6.5V9ZM12.5 9H17.5V15H14.5V13H15.5V11H12.5V9Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Epic</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "steam" ? "active" : ""}`}
                  onClick={() => setActivePlatform("steam")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12.71 5.29L16.47 9.05C16.61 9.19 16.74 9.34 16.86 9.5C17.81 10.92 17.5 12.93 16.09 13.88C16 13.95 15.91 14.01 15.81 14.07L15.92 14.18L17.5 19.11L13.35 17.13C12.12 18.33 10.25 18.7 8.59 17.83C6.93 16.95 6.05 15.2 6.25 13.43L3.06 12.14L5.5 9.6C5.74 7.21 7.62 5.35 10.02 5.13L12.71 5.29Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Steam</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "playstation" ? "active" : ""}`}
                  onClick={() => setActivePlatform("playstation")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M9.5 7.5V16.5H7.5V7.5H9.5ZM16.5 7.5V16.5H14.5V7.5H16.5ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">PlayStation</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "xbox" ? "active" : ""}`}
                  onClick={() => setActivePlatform("xbox")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M5.42596 19.0839C7.32396 20.5739 9.63396 21.4259 12.023 21.4259C14.413 21.4259 16.723 20.5739 18.622 19.0839C17.368 19.6139 14.914 19.0299 12 16.1399C9.09896 19.0299 6.67796 19.5899 5.42596 19.0839ZM12 4.56995C10.81 2.85195 8.91096 1.90595 6.92896 2.02295C5.63796 2.09595 4.38396 2.58495 3.36796 3.42695C2.85996 3.84595 2.40796 4.33795 2.02896 4.89095C3.75296 3.19695 7.81996 5.36995 11.999 9.56095C16.18 5.36995 20.249 3.19795 21.971 4.89095C20.592 2.99795 18.487 1.80895 16.187 1.67595C14.67 1.59195 13.14 1.98595 11.874 2.78095C12.841 3.33995 13.717 4.06095 14.476 4.90095C13.717 4.44595 12.881 4.18795 12.021 4.14895C12.014 4.14895 12.007 4.14795 12 4.14795V4.56995Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Xbox</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "switch" ? "active" : ""}`}
                  onClick={() => setActivePlatform("switch")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M14.5 2.5C16.5 2.5 18.5 3.5 20 5L16 9H13.5V6.5L17.5 2.5C16.5 2 15.5 2 14.5 2C11 2 8 4 6.5 7.5C5 11 5.5 15 8 18L6.5 19.5C3 16 2 10.5 4 6C6 1.5 10 0 14.5 2.5ZM9.5 6C10.6 6 11.5 6.9 11.5 8C11.5 9.1 10.6 10 9.5 10C8.4 10 7.5 9.1 7.5 8C7.5 6.9 8.4 6 9.5 6ZM16 14.5L19.5 11C18.5 9.5 17 8.5 15.5 8.5C14 8.5 13 9 11.5 10.5C10 12 9.5 13.5 9.5 15C9.5 16.5 10 18 11.5 19.5C13 21 14.5 22 16 22C17.5 22 19 21.5 20.5 20L17 16.5V14.5H16Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Switch</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "android" ? "active" : ""}`}
                  onClick={() => setActivePlatform("android")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M17.523 15.3414C17.523 16.0004 16.9794 16.5334 16.314 16.5334C15.6486 16.5334 15.105 16.0004 15.105 15.3414C15.105 14.6824 15.6486 14.1494 16.314 14.1494C16.9794 14.1494 17.523 14.6824 17.523 15.3414ZM8.67 14.1494C8.0046 14.1494 7.461 14.6824 7.461 15.3414C7.461 16.0004 8.0046 16.5334 8.67 16.5334C9.3354 16.5334 9.879 16.0004 9.879 15.3414C9.879 14.6824 9.3354 14.1494 8.67 14.1494ZM16.656 9.50138L18.3074 6.59938C18.4014 6.45538 18.3634 6.27338 18.2194 6.17938C18.0754 6.08538 17.8934 6.12338 17.7994 6.26738L16.1304 9.19538C14.7024 8.66938 13.1694 8.37738 11.484 8.37738C9.79859 8.37738 8.26559 8.66938 6.83759 9.19538L5.16859 6.26738C5.07459 6.12338 4.89259 6.08538 4.74859 6.17938C4.60459 6.27338 4.56659 6.45538 4.66059 6.59938L6.31199 9.50138C3.17999 11.043 1.00719 13.9214 0.955395 17.2214H22.0274C21.9756 13.9214 19.788 11.043 16.656 9.50138ZM2.38139 19.5734C2.38139 20.5854 3.19999 21.4034 4.21199 21.4034H5.30139V24.8174C5.30139 25.7234 6.03059 26.4534 6.93659 26.4534C7.84259 26.4534 8.57179 25.7234 8.57179 24.8174V21.4034H14.4114V24.8174C14.4114 25.7234 15.1406 26.4534 16.0466 26.4534C16.9526 26.4534 17.6818 25.7234 17.6818 24.8174V21.4034H18.7712C19.7832 21.4034 20.6018 20.5854 20.6018 19.5734V19.2854H2.38139V19.5734Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">Android</span>
                </button>
                
                <button 
                  className={`platform-button ${activePlatform === "ios" ? "active" : ""}`}
                  onClick={() => setActivePlatform("ios")}
                >
                  <div className="platform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                      <path d="M16.4405 2.01172C16.3755 2.01972 16.2455 2.03572 16.0605 2.05172C14.6405 2.16072 13.3395 2.91972 12.4495 3.92872C11.5595 4.93772 10.9705 6.33072 11.1805 7.77072C11.2205 7.83072 11.3095 7.88972 11.4095 7.88972C13.0195 7.91972 14.7205 7.05072 15.6405 5.91972C16.5605 4.78872 17.0405 3.35872 16.8705 2.01172C16.7405 2.01172 16.6105 2.00372 16.4405 2.01172ZM20.1595 17.8217C20.1595 17.8297 20.1595 17.8377 20.1595 17.8457C19.9295 18.4657 19.6495 19.0557 19.3095 19.6157C18.7695 20.4957 18.0995 21.2957 17.0895 21.3057C16.1995 21.3157 15.8795 20.7557 14.7995 20.7557C13.7195 20.7557 13.3595 21.2957 12.5295 21.3057C11.5595 21.3157 10.8095 20.4257 10.2695 19.5457C9.09951 17.6657 8.18951 14.0057 9.39951 11.5057C9.99951 10.2557 11.1695 9.43572 12.4695 9.42572C13.3995 9.41572 14.2695 10.0357 14.8495 10.0357C15.4295 10.0357 16.4695 9.30572 17.5795 9.45572C18.1895 9.48572 19.3795 9.70572 20.1195 10.6757C20.0495 10.7257 18.7695 11.4857 18.7795 13.1157C18.8095 15.0857 20.4195 15.7157 20.4595 15.7357C20.4495 15.7457 20.1795 16.6257 19.6395 17.5057C19.1695 18.2657 18.6595 19.0257 17.8695 19.0557C17.1095 19.0857 16.8095 18.5657 16.0295 18.5657C15.2495 18.5657 14.9095 19.0557 14.1895 19.0557C13.4695 19.0557 12.9995 18.3657 12.4695 17.5057C12.0895 16.9057 11.7695 16.1057 11.5795 15.1957C11.5495 15.1557 11.5195 15.1157 11.4895 15.0757L11.3995 14.9557C10.9905 14.4087 10.6696 13.7929 10.4495 13.1357V13.1157C10.1095 12.1657 9.95951 11.2157 9.95951 10.2657C9.95951 8.52572 10.5695 6.93572 11.6795 5.81572C12.5695 4.92572 13.8695 4.32572 15.1995 4.26572C16.2195 4.25572 17.1695 4.69572 17.9095 5.21572C18.6495 5.73572 19.2495 6.42572 19.6095 7.22572C19.7295 7.50572 19.8095 7.75572 19.8695 8.00572C19.8395 8.05572 19.4095 9.45572 20.1595 11.4357C20.9095 13.4157 22.0895 13.6057 22.0895 13.6057C22.0795 13.6557 21.9695 14.6457 21.4295 15.8057C21.0295 16.6857 20.5995 17.3157 20.1595 17.8217Z"/>
                    </svg>
                  </div>
                  <span className="platform-name">iOS</span>
                </button>
              </div>
            </div>
          </section>

          {/* Platform Tabs */}
          <section className="mt-12 modern-section">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-300 to-purple-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-500">
                  <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd" />
                </svg>
                {activePlatform === "all" 
                  ? "Tüm Platformlar" 
                  : activePlatform === "pc" 
                    ? "PC Oyunları"
                    : activePlatform === "epic" 
                      ? "Epic Games" 
                      : activePlatform === "steam" 
                        ? "Steam" 
                        : activePlatform === "playstation" 
                          ? "PlayStation" 
                          : activePlatform === "xbox" 
                            ? "Xbox" 
                            : activePlatform === "switch" 
                              ? "Nintendo Switch"
                              : activePlatform === "android"
                                ? "Android"
                                : activePlatform === "ios"
                                  ? "iOS"
                                  : "Tüm Platformlar"}
              </h2>
            </div>
            
            <div className="platform-scroll-container w-full overflow-x-auto pb-4 mb-8">
              <button 
                onClick={() => setActivePlatform("all")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "all" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Tüm platformlar"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M21 13V11C21 7.183 17.817 4 14 4H10C6.183 4 3 7.183 3 11V13C2.45 13 2 13.45 2 14V19C2 19.55 2.45 20 3 20H9C9.55 20 10 19.55 10 19V14C10 13.45 9.55 13 9 13V11C9 10.2044 9.31607 9.44129 9.87868 8.87868C10.4413 8.31607 11.2044 8 12 8C12.7956 8 13.5587 8.31607 14.1213 8.87868C14.6839 9.44129 15 10.2044 15 11V13C14.45 13 14 13.45 14 14V19C14 19.55 14.45 20 15 20H21C21.55 20 22 19.55 22 19V14C22 13.45 21.55 13 21 13Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Tümü</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("pc")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "pc" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="PC oyunları"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20 18C21.1 18 22 17.1 22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">PC</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("epic")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "epic" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Epic Games"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 1L21 6.5V17.5L12 23L3 17.5V6.5L12 1ZM12 3.311L5 7.65311V16.3469L12 20.689L19 16.3469V7.65311L12 3.311ZM6.5 9H11.5V11H8.5V13H11.5V15H6.5V9ZM12.5 9H17.5V15H14.5V13H15.5V11H12.5V9Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Epic</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("steam")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "steam" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Steam"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12.71 5.29L16.47 9.05C16.61 9.19 16.74 9.34 16.86 9.5C17.81 10.92 17.5 12.93 16.09 13.88C16 13.95 15.91 14.01 15.81 14.07L15.92 14.18L17.5 19.11L13.35 17.13C12.12 18.33 10.25 18.7 8.59 17.83C6.93 16.95 6.05 15.2 6.25 13.43L3.06 12.14L5.5 9.6C5.74 7.21 7.62 5.35 10.02 5.13L12.71 5.29Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Steam</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("playstation")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "playstation" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="PlayStation"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M9.5 7.5V16.5H7.5V7.5H9.5ZM16.5 7.5V16.5H14.5V7.5H16.5ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">PlayStation</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("xbox")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "xbox" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Xbox"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M5.42596 19.0839C7.32396 20.5739 9.63396 21.4259 12.023 21.4259C14.413 21.4259 16.723 20.5739 18.622 19.0839C17.368 19.6139 14.914 19.0299 12 16.1399C9.09896 19.0299 6.67796 19.5899 5.42596 19.0839ZM12 4.56995C10.81 2.85195 8.91096 1.90595 6.92896 2.02295C5.63796 2.09595 4.38396 2.58495 3.36796 3.42695C2.85996 3.84595 2.40796 4.33795 2.02896 4.89095C3.75296 3.19695 7.81996 5.36995 11.999 9.56095C16.18 5.36995 20.249 3.19795 21.971 4.89095C20.592 2.99795 18.487 1.80895 16.187 1.67595C14.67 1.59195 13.14 1.98595 11.874 2.78095C12.841 3.33995 13.717 4.06095 14.476 4.90095C13.717 4.44595 12.881 4.18795 12.021 4.14895C12.014 4.14895 12.007 4.14795 12 4.14795V4.56995Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Xbox</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("switch")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "switch" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Nintendo Switch"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M14.5 2.5C16.5 2.5 18.5 3.5 20 5L16 9H13.5V6.5L17.5 2.5C16.5 2 15.5 2 14.5 2C11 2 8 4 6.5 7.5C5 11 5.5 15 8 18L6.5 19.5C3 16 2 10.5 4 6C6 1.5 10 0 14.5 2.5ZM9.5 6C10.6 6 11.5 6.9 11.5 8C11.5 9.1 10.6 10 9.5 10C8.4 10 7.5 9.1 7.5 8C7.5 6.9 8.4 6 9.5 6ZM16 14.5L19.5 11C18.5 9.5 17 8.5 15.5 8.5C14 8.5 13 9 11.5 10.5C10 12 9.5 13.5 9.5 15C9.5 16.5 10 18 11.5 19.5C13 21 14.5 22 16 22C17.5 22 19 21.5 20.5 20L17 16.5V14.5H16Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Switch</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("android")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "android" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="Android"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.523 15.3414C17.523 16.0004 16.9794 16.5334 16.314 16.5334C15.6486 16.5334 15.105 16.0004 15.105 15.3414C15.105 14.6824 15.6486 14.1494 16.314 14.1494C16.9794 14.1494 17.523 14.6824 17.523 15.3414ZM8.67 14.1494C8.0046 14.1494 7.461 14.6824 7.461 15.3414C7.461 16.0004 8.0046 16.5334 8.67 16.5334C9.3354 16.5334 9.879 16.0004 9.879 15.3414C9.879 14.6824 9.3354 14.1494 8.67 14.1494ZM16.656 9.50138L18.3074 6.59938C18.4014 6.45538 18.3634 6.27338 18.2194 6.17938C18.0754 6.08538 17.8934 6.12338 17.7994 6.26738L16.1304 9.19538C14.7024 8.66938 13.1694 8.37738 11.484 8.37738C9.79859 8.37738 8.26559 8.66938 6.83759 9.19538L5.16859 6.26738C5.07459 6.12338 4.89259 6.08538 4.74859 6.17938C4.60459 6.27338 4.56659 6.45538 4.66059 6.59938L6.31199 9.50138C3.17999 11.043 1.00719 13.9214 0.955395 17.2214H22.0274C21.9756 13.9214 19.788 11.043 16.656 9.50138ZM2.38139 19.5734C2.38139 20.5854 3.19999 21.4034 4.21199 21.4034H5.30139V24.8174C5.30139 25.7234 6.03059 26.4534 6.93659 26.4534C7.84259 26.4534 8.57179 25.7234 8.57179 24.8174V21.4034H14.4114V24.8174C14.4114 25.7234 15.1406 26.4534 16.0466 26.4534C16.9526 26.4534 17.6818 25.7234 17.6818 24.8174V21.4034H18.7712C19.7832 21.4034 20.6018 20.5854 20.6018 19.5734V19.2854H2.38139V19.5734Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">Android</span>
              </button>
              
              <button 
                onClick={() => setActivePlatform("ios")}
                className={`platform-button shadow-lg transition-all duration-300 flex flex-col items-center px-4 py-2 rounded-xl ${activePlatform === "ios" ? "active bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}
                aria-label="iOS"
              >
                <span className="platform-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M16.4405 2.01172C16.3755 2.01972 16.2455 2.03572 16.0605 2.05172C14.6405 2.16072 13.3395 2.91972 12.4495 3.92872C11.5595 4.93772 10.9705 6.33072 11.1805 7.77072C11.2205 7.83072 11.3095 7.88972 11.4095 7.88972C13.0195 7.91972 14.7205 7.05072 15.6405 5.91972C16.5605 4.78872 17.0405 3.35872 16.8705 2.01172C16.7405 2.01172 16.6105 2.00372 16.4405 2.01172ZM20.1595 17.8217C20.1595 17.8297 20.1595 17.8377 20.1595 17.8457C19.9295 18.4657 19.6495 19.0557 19.3095 19.6157C18.7695 20.4957 18.0995 21.2957 17.0895 21.3057C16.1995 21.3157 15.8795 20.7557 14.7995 20.7557C13.7195 20.7557 13.3595 21.2957 12.5295 21.3057C11.5595 21.3157 10.8095 20.4257 10.2695 19.5457C9.09951 17.6657 8.18951 14.0057 9.39951 11.5057C9.99951 10.2557 11.1695 9.43572 12.4695 9.42572C13.3995 9.41572 14.2695 10.0357 14.8495 10.0357C15.4295 10.0357 16.4695 9.30572 17.5795 9.45572C18.1895 9.48572 19.3795 9.70572 20.1195 10.6757C20.0495 10.7257 18.7695 11.4857 18.7795 13.1157C18.8095 15.0857 20.4195 15.7157 20.4595 15.7357C20.4495 15.7457 20.1795 16.6257 19.6395 17.5057C19.1695 18.2657 18.6595 19.0257 17.8695 19.0557C17.1095 19.0857 16.8095 18.5657 16.0295 18.5657C15.2495 18.5657 14.9095 19.0557 14.1895 19.0557C13.4695 19.0557 12.9995 18.3657 12.4695 17.5057C12.0895 16.9057 11.7695 16.1057 11.5795 15.1957C11.5495 15.1557 11.5195 15.1157 11.4895 15.0757L11.3995 14.9557C10.9905 14.4087 10.6696 13.7929 10.4495 13.1357V13.1157C10.1095 12.1657 9.95951 11.2157 9.95951 10.2657C9.95951 8.52572 10.5695 6.93572 11.6795 5.81572C12.5695 4.92572 13.8695 4.32572 15.1995 4.26572C16.2195 4.25572 17.1695 4.69572 17.9095 5.21572C18.6495 5.73572 19.2495 6.42572 19.6095 7.22572C19.7295 7.50572 19.8095 7.75572 19.8695 8.00572C19.8395 8.05572 19.4095 9.45572 20.1595 11.4357C20.9095 13.4157 22.0895 13.6057 22.0895 13.6057C22.0795 13.6557 21.9695 14.6457 21.4295 15.8057C21.0295 16.6857 20.5995 17.3157 20.1595 17.8217Z"/>
                  </svg>
                </span>
                <span className="platform-name mt-1 font-medium text-sm">iOS</span>
              </button>
            </div>

            {filteredGames.length > 0 ? (
              <div className="game-grid">
                {filteredGames.slice(0, 9).map(game => (
                  <div key={game.id} className="game-card-featured">
                    <div className="game-card-featured-image">
                      <img 
                        src={getBestGameImage(game)} 
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="game-card-featured-content">
                      <h3 className="game-card-featured-title">{game.title}</h3>
                      <p className="game-card-featured-description">
                        {game.description?.substring(0, 100) || 'Bu oyunu hemen ücretsiz alabilirsiniz!'}{game.description && game.description.length > 100 ? '...' : ''}
                      </p>
                      <a href={game.url || `/game/${game.id}`} target="_blank" rel="noopener noreferrer" className="game-card-featured-button">
                        Mağazada Gör
                        <svg className="w-4 h-4 ml-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Oyun Bulunamadı</h3>
                <p className="text-gray-400 text-center max-w-md">Bu platform için şu anda ücretsiz oyun bulunmuyor. Başka bir platform seçmeyi veya daha sonra tekrar kontrol etmeyi deneyin.</p>
                <button 
                  onClick={() => setActivePlatform("all")}
                  className="mt-6 btn-primary"
                >
                  Tüm Platformlara Dön
                </button>
              </div>
            )}
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
            
            <div className="game-grid">
              {freeLoots.slice(0, 3).map(game => (
                <div key={game.id} className="game-card-featured">
                  <div className="game-card-featured-image">
                    <img 
                      src={getBestGameImage(game)} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="game-card-featured-content">
                    <h3 className="game-card-featured-title">{game.title}</h3>
                    <p className="game-card-featured-description">
                      {game.description?.substring(0, 100) || 'Bu oyunu hemen ücretsiz alabilirsiniz!'}{game.description && game.description.length > 100 ? '...' : ''}
                    </p>
                    <a href={game.url || `/game/${game.id}`} target="_blank" rel="noopener noreferrer" className="game-card-featured-button">
                      Mağazada Gör
                      <svg className="w-4 h-4 ml-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
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
            
            <div className="game-grid">
              {freeBetas.slice(0, 3).map(game => (
                <div key={game.id} className="game-card-featured">
                  <div className="game-card-featured-image">
                    <img 
                      src={getBestGameImage(game)} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="game-card-featured-content">
                    <h3 className="game-card-featured-title">{game.title}</h3>
                    <p className="game-card-featured-description">
                      {game.description?.substring(0, 100) || 'Bu oyunu hemen ücretsiz alabilirsiniz!'}{game.description && game.description.length > 100 ? '...' : ''}
                    </p>
                    <a href={game.url || `/game/${game.id}`} target="_blank" rel="noopener noreferrer" className="game-card-featured-button">
                      Mağazada Gör
                      <svg className="w-4 h-4 ml-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
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
    ] = await Promise.all([
      // fetchFreeGames(),
      // fetchUpcomingFreeGames(),
      getGamerPowerOnlyGamesAsEpicFormat(),
      getGamerPowerLootAsEpicFormat(),
      getGamerPowerBetaAsEpicFormat(),
      getFreeSteamGames(),
      // fetchTrendingGames(),
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
        totalGames: 0,
      },
      // Hata durumunda daha sık yenileme dene
      revalidate: 3600
    };
  }
} 