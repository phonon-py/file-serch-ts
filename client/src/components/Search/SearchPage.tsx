// client/src/components/Search/SearchPage.tsx
import React, { useState } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { IFileSearchResult, ISearchOptions } from '@shared/types/SearchTypes';
import FileSearchService from '../../services/FileSearchService';

const SearchPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<IFileSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (
    path: string, 
    pattern: string, 
    options?: ISearchOptions
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await FileSearchService.searchFiles(path, pattern, options);
      
      setResults(response.results);
      setTotalCount(response.totalCount);
      setSearchTime(response.searchTime);
    } catch (err) {
      setResults([]);
      setTotalCount(0);
      setSearchTime(0);
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h1>ファイル検索アプリ</h1>
      
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <SearchResults 
        results={results} 
        totalCount={totalCount} 
        searchTime={searchTime}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SearchPage;