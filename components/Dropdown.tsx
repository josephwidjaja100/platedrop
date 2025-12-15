import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  clearable?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  clearable = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    } else {
      // Clear search when closing
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOptions(options);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = options.filter(option => 
        option.toLowerCase().includes(query)
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-2 border-gray-400/40 rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-700 text-sm bg-white hover:border-gray-400/60 text-left flex items-center justify-between ${
          value ? 'text-gray-900' : 'text-gray-400'
        } ${isOpen ? 'border-gray-700' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Clear selection"
            >
              <X size={14} className="text-gray-500" />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-400/40 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search..."
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                no results found for "{searchQuery}"
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-sm flex items-center justify-between ${
                    value === option ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-gray-700'
                  }`}
                >
                  <span className="flex-1 text-left pr-2">{option}</span>
                  {value === option && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
              {filteredOptions.length} {filteredOptions.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;