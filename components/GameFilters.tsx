import React from 'react';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { ExtendedEpicGame } from '@/lib/types';

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
  const [openSort, setOpenSort] = React.useState(false);
  const [openSource, setOpenSource] = React.useState(false);

  return (
    <div className="w-full border-b border-border pb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Oyun Kütüphanesi</h2>
          <p className="text-sm text-muted-foreground">
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
          
          {/* Sıralama Seçenekleri */}
          <Popover open={openSort} onOpenChange={setOpenSort}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSort}
                className="w-auto justify-between"
              >
                {sortOrder ? sortOptions.find((option) => option.value === sortOrder)?.label : "Sırala"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Sıralama seçeneği ara..." />
                <CommandEmpty>Eşleşen sıralama bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {sortOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setSortOrder(currentValue as SortOption);
                        setOpenSort(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          sortOrder === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Kaynak Platform Seçenekleri */}
          <Popover open={openSource} onOpenChange={setOpenSource}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSource}
                className="w-auto justify-between"
              >
                {activeSource ? sourceOptions.find((option) => option.value === activeSource)?.label : "Platform"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Platform ara..." />
                <CommandEmpty>Eşleşen platform bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {sourceOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setActiveSource(currentValue as SourceOption);
                        setOpenSource(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeSource === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Sadece Ücretsiz Oyunlar Filtresi */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="onlyFree" 
              checked={onlyFreeGames}
              onCheckedChange={(checked) => {
                setOnlyFreeGames(checked === true);
              }}
            />
            <label
              htmlFor="onlyFree"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Sadece Ücretsiz
            </label>
          </div>
        </div>
      </div>
      
      {/* Kategori Filtreleri */}
      <div className="overflow-x-auto hide-scrollbar pb-2">
        <div className="flex space-x-2 min-w-max">
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
      
      {/* Aktif Filtreler */}
      {(activeFilter !== 'all' || activeSource !== 'all' || onlyFreeGames || searchQuery) && (
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="text-sm text-muted-foreground mr-2 flex items-center">
            <Filter className="w-4 h-4 mr-1" /> Aktif Filtreler:
          </div>
          
          {activeFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filterOptions.find(f => f.value === activeFilter)?.label}
              <button 
                onClick={() => setActiveFilter('all')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </Badge>
          )}
          
          {activeSource !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {sourceOptions.find(s => s.value === activeSource)?.label}
              <button 
                onClick={() => setActiveSource('all')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </Badge>
          )}
          
          {onlyFreeGames && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sadece Ücretsiz
              <button 
                onClick={() => setOnlyFreeGames(false)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </Badge>
          )}
          
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Arama: {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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