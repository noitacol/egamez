import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ExtendedEpicGame } from '@/lib/types';
import { FaSteam, FaFilter, FaSort, FaTimes } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';
import { RiGamepadLine } from 'react-icons/ri';

export type SortOption = 'newest' | 'oldest' | 'alphabetical-asc' | 'alphabetical-desc' | 'price-asc' | 'price-desc';
export type FilterOption = 'all' | 'free' | 'upcoming' | 'loot' | 'trending' | 'discount';
export type ViewOption = 'grid' | 'list';
export type SourceOption = 'all' | 'epic' | 'steam' | 'gamerpower';

interface GameFiltersProps {
  totalGames: number;
  view: ViewOption;
  setView: (view: ViewOption) => void;
  sortOrder: SortOption;
  setSortOrder: (sortOrder: SortOption) => void;
  activeFilter: FilterOption;
  setActiveFilter: (filter: FilterOption) => void;
  activeSource: SourceOption;
  setActiveSource: (source: SourceOption) => void;
  onlyFreeGames: boolean;
  setOnlyFreeGames: (onlyFree: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  games: ExtendedEpicGame[];
}

export const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'alphabetical-asc', label: 'A-Z' },
  { value: 'alphabetical-desc', label: 'Z-A' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

export const filterOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'free', label: 'Ücretsiz' },
  { value: 'upcoming', label: 'Yakında Ücretsiz' },
  { value: 'trending', label: 'Popüler' },
  { value: 'discount', label: 'İndirimli' },
  { value: 'loot', label: 'Loot' },
];

export const sourceOptions = [
  { value: 'all', label: 'Tüm Platformlar' },
  { value: 'epic', label: 'Epic Games' },
  { value: 'steam', label: 'Steam' },
  { value: 'gamerpower', label: 'Gamer Power' },
];

const GameFilters: React.FC<GameFiltersProps> = ({
  totalGames,
  view,
  setView,
  sortOrder,
  setSortOrder,
  activeFilter,
  setActiveFilter,
  activeSource,
  setActiveSource,
  onlyFreeGames,
  setOnlyFreeGames,
  searchQuery,
  setSearchQuery,
  games,
}) => {
  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Oyun Kütüphanesi</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Toplam {totalGames} oyun bulundu
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Görünüm Seçenekleri */}
          <ToggleGroup 
            type="single" 
            value={view}
            onValueChange={(value) => {
              if (value) setView(value as ViewOption);
            }}
            className="flex items-center"
          >
            <ToggleGroupItem value="grid" aria-label="Izgara görünümü">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Liste görünümü">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* Sıralama Dropdown Yerine Basit Toggle */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder('newest')}
              className={sortOrder === 'newest' ? 'bg-gray-200 dark:bg-gray-700' : ''}
            >
              En Yeni
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder('alphabetical-asc')}
              className={sortOrder === 'alphabetical-asc' ? 'bg-gray-200 dark:bg-gray-700' : ''}
            >
              A-Z
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder('price-asc')}
              className={sortOrder === 'price-asc' ? 'bg-gray-200 dark:bg-gray-700' : ''}
            >
              Fiyat ↑
            </Button>
          </div>
          
          {/* Sadece Ücretsiz Oyunlar */}
          <Toggle 
            pressed={onlyFreeGames}
            onPressedChange={setOnlyFreeGames}
            className="px-3"
          >
            Sadece Ücretsiz
          </Toggle>
        </div>
      </div>
      
      {/* Kategori Filtreleri */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setActiveFilter(option.value as FilterOption)}
              variant={activeFilter === option.value ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Platform Seçimi */}
      <div className="mt-4 flex space-x-2">
        <Button
          variant={activeSource === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSource('all')}
          className="flex items-center gap-2"
        >
          <RiGamepadLine className="w-4 h-4" />
          Tüm Platformlar
        </Button>
        
        <Button
          variant={activeSource === 'epic' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSource('epic')}
          className="flex items-center gap-2"
        >
          <SiEpicgames className="w-4 h-4" />
          Epic
        </Button>
        
        <Button
          variant={activeSource === 'steam' ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveSource('steam')}
          className="flex items-center gap-2"
        >
          <FaSteam className="w-4 h-4" />
          Steam
        </Button>
      </div>
      
      {/* Aktif Filtreler */}
      {(activeFilter !== 'all' || activeSource !== 'all' || onlyFreeGames || searchQuery) && (
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-2 flex items-center">
            <FaFilter className="w-4 h-4 mr-1" /> Aktif Filtreler:
          </div>
          
          {activeFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filterOptions.find(f => f.value === activeFilter)?.label}
              <button 
                onClick={() => setActiveFilter('all')}
                className="ml-1 rounded-full"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {activeSource !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {sourceOptions.find(s => s.value === activeSource)?.label}
              <button 
                onClick={() => setActiveSource('all')}
                className="ml-1 rounded-full"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {onlyFreeGames && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sadece Ücretsiz
              <button 
                onClick={() => setOnlyFreeGames(false)}
                className="ml-1 rounded-full"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Arama: {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-1 rounded-full"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setActiveFilter('all');
              setActiveSource('all');
              setOnlyFreeGames(false);
              setSearchQuery('');
            }}
          >
            Tümünü Temizle
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameFilters; 