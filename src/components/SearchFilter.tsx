// src/components/ui/search-filter.tsx
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
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
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
        </div>
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="pl-11 pr-10 h-11 rounded-xl border-gray-200 bg-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 placeholder:text-gray-400"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
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