// src/components/ui/search-filter.tsx
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilterProps {
  onSearch: (value: string) => void;
  onFilter?: (key: string, value: string) => void;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  placeholder?: string;
  initialSearchValue?: string;
  debounceMs?: number;
}

export function SearchFilter({
  onSearch,
  onFilter,
  filters = [],
  placeholder = 'Search...',
  initialSearchValue = '',
  debounceMs = 300,
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const debouncedSearchValue = useDebounce(searchValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  // Apply the debounced search value
  useEffect(() => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch]);

  const handleClear = () => {
    setSearchValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="pr-9"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="flex-none md:w-48">
          <Select
            onValueChange={(value) => {
              if (onFilter) {
                // Convert special values back to empty strings for the API
                const apiValue = value === "_all" || value === "_empty" ? "" : value;
                onFilter(filter.key, apiValue);
              }
            }}
            defaultValue="_all"
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value || "_empty"}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}