// client/src/components/Search/SearchPage.tsx
import React, { useState } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { IFileSearchResult, ISearchOptions } from '@shared/types/SearchTypes';
import FileSearchService from '../../services/FileSearchService';
import { SearchIcon, AlertIcon, InfoIcon } from '../icons/Icons';

const SearchPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<IFileSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPartialResult, setIsPartialResult] = useState<boolean>(false);

  const handleSearch = async (
    path: string,
    pattern: string,
    options?: ISearchOptions
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setIsPartialResult(false);

    try {
      const timeout = options?.timeout || 120000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout + 5000);

      const response = await FileSearchService.searchFiles(path, pattern, options, controller.signal);

      clearTimeout(timeoutId);

      setResults(response.results);
      setTotalCount(response.totalCount);
      setSearchTime(response.searchTime);

      if (response.isPartialResult) {
        setIsPartialResult(true);
      }
    } catch (err) {
      setResults([]);
      setTotalCount(0);
      setSearchTime(0);

      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('検索時間が長すぎるため、リクエストがキャンセルされました。検索範囲を狭めるか、より具体的な検索パターンを試してください。');
      } else {
        setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-page">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand-mark">
            <SearchIcon size={14} strokeWidth={2} />
          </span>
          <span className="app-brand-title">File Explorer</span>
          <span className="app-brand-sub">fast file search</span>
        </div>
      </header>

      <div className="search-container">
        <div className="page-intro">
          <h1>ファイル検索</h1>
          <p>ディレクトリとパターンを指定して検索します。</p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="error-message" role="alert">
            <span className="message-icon"><AlertIcon size={16} /></span>
            <div className="message-content">
              <p>{error}</p>
            </div>
          </div>
        )}

        {isPartialResult && !error && (
          <div className="warning-message">
            <span className="message-icon"><InfoIcon size={16} /></span>
            <div className="message-content">
              <p>検索時間が長かったため、一部の結果のみ表示しています。より具体的な検索パターンを試してください。</p>
            </div>
          </div>
        )}

        <SearchResults
          results={results}
          totalCount={totalCount}
          searchTime={searchTime}
          isLoading={isLoading}
          isPartialResult={isPartialResult}
        />
      </div>
    </div>
  );
};

export default SearchPage;
