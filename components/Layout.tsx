import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ 
  children, 
  title = 'Epic Games Ücretsiz Oyunlar', 
  description = 'Epic Games Store üzerinde ücretsiz olan oyunları takip edin'
}: LayoutProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tema değişikliğini sadece client tarafında gerçekleştirme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <header className="bg-white dark:bg-epicgray shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/"
            className="text-2xl font-bold text-epicblue"
            tabIndex={0}
            aria-label="Ana sayfaya git"
          >
            Epic Ücretsiz Oyunlar
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link 
              href="/upcoming"
              className="text-gray-700 dark:text-gray-300 hover:text-epicblue dark:hover:text-white transition-colors"
              tabIndex={0}
              aria-label="Yaklaşan ücretsiz oyunları gör"
            >
              Yakında Ücretsiz
            </Link>
            
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-epicblue"
                tabIndex={0}
                aria-label={theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-epicgray shadow-md mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Epic Ücretsiz Oyunlar. Epic Games ile bir bağlantısı yoktur.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a
                href="https://store.epicgames.com/tr/free-games"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-epicblue dark:hover:text-white transition-colors"
                tabIndex={0}
                aria-label="Epic Games Store'u ziyaret et"
              >
                Epic Games Store
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 