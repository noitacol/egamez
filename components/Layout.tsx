import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { IconType } from 'react-icons';
import { FiHome, FiClock, FiTag, FiList, FiTrendingUp } from 'react-icons/fi';
import { SiEpicgames, SiSteam } from 'react-icons/si';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: IconType;
  active: boolean;
}

const NavItem = ({ href, label, icon: Icon, active }: NavItemProps) => {
  const activeClass = active
    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-medium'
    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700';

  return (
    <Link href={href} className={`flex items-center px-3 py-2 rounded-md ${activeClass}`}>
      <Icon className="mr-2 h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const Layout = ({ 
  children, 
  title = 'Epic Games Ücretsiz Oyunlar', 
  description = 'Epic Games Store üzerinde ücretsiz olan oyunları takip edin'
}: LayoutProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.pathname;

  // Tema değişikliğini sadece client tarafında gerçekleştirme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-epiclight dark:bg-epicdark transition-colors duration-300">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={theme === 'dark' ? '#121212' : '#f5f5f5'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Head>
      
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-epicgray/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/"
              className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-epicblue to-epicaccent"
              tabIndex={0}
              aria-label="Ana sayfaya git"
            >
              <span className="flex items-center">
                <svg className="w-8 h-8 mr-2 text-epicblue dark:text-epicaccent" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Epic Ücretsiz
              </span>
            </Link>
            
            {/* Mobil menü butonu */}
            <div className="flex md:hidden">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Menüyü aç/kapat"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Masaüstü navigasyon */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                tabIndex={0}
                aria-label="Ana sayfaya git"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/all-free-games"
                className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                tabIndex={0}
                aria-label="Tüm ücretsiz oyunları gör"
              >
                Tüm Ücretsiz Oyunlar
              </Link>
              <Link 
                href="/upcoming"
                className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                tabIndex={0}
                aria-label="Yaklaşan ücretsiz oyunları gör"
              >
                Yakında Ücretsiz
              </Link>
              
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none ring-epicblue dark:ring-epicaccent focus:ring-2 transition-colors"
                  tabIndex={0}
                  aria-label={theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              )}
            </nav>
          </div>
          
          {/* Mobil navigasyon menüsü */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3 pt-3">
                <Link 
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                  tabIndex={0}
                  aria-label="Ana sayfaya git"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/all-free-games"
                  className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                  tabIndex={0}
                  aria-label="Tüm ücretsiz oyunları gör"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tüm Ücretsiz Oyunlar
                </Link>
                <Link 
                  href="/upcoming"
                  className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-epicaccent transition-colors font-medium"
                  tabIndex={0}
                  aria-label="Yaklaşan ücretsiz oyunları gör"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Yakında Ücretsiz
                </Link>
                
                {mounted && (
                  <div className="flex items-center">
                    <span className="text-gray-700 dark:text-gray-300 mr-3">
                      {theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-epicblue dark:focus:ring-epicaccent"
                      tabIndex={0}
                      aria-label={theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
                    >
                      {theme === 'dark' ? (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white/80 dark:bg-epicgray/80 backdrop-blur-md shadow-inner mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link 
                href="/"
                className="text-xl font-bold text-epicblue dark:text-epicaccent"
              >
                Epic Ücretsiz Oyunlar
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                &copy; {new Date().getFullYear()} Epic Ücretsiz Oyunlar. Epic Games ile bir bağlantısı yoktur.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a
                href="https://store.epicgames.com/tr/free-games"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-epicblue dark:hover:text-epicaccent transition-colors"
                tabIndex={0}
                aria-label="Epic Games Store'u ziyaret et"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  Epic Games Store
                </span>
              </a>
              <Link
                href="/upcoming"
                className="text-gray-600 dark:text-gray-400 hover:text-epicblue dark:hover:text-epicaccent transition-colors"
                tabIndex={0}
                aria-label="Yakında ücretsiz olacak oyunlar"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Yakında Ücretsiz
                </span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 