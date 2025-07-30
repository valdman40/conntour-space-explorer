import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchInputContextType {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: (searchTerm: string) => void;
  setHandleSearch: (handler: (searchTerm: string) => void) => void;
}

const SearchInputContext = createContext<SearchInputContextType | undefined>(undefined);

export const useSearchInput = () => {
  const context = useContext(SearchInputContext);
  if (!context) {
    throw new Error('useSearchInput must be used within a SearchInputProvider');
  }
  return context;
};

interface SearchInputProviderProps {
  children: ReactNode;
}

export const SearchInputProvider: React.FC<SearchInputProviderProps> = ({ children }) => {
  const [searchInput, setSearchInput] = useState('');
  const [handleSearch, setHandleSearch] = useState<(searchTerm: string) => void>(() => () => {});

  return (
    <SearchInputContext.Provider value={{ 
      searchInput, 
      setSearchInput, 
      handleSearch, 
      setHandleSearch 
    }}>
      {children}
    </SearchInputContext.Provider>
  );
};
