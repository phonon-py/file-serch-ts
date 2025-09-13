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
      // ローカルタイムアウト（クライアント側の保護）
      const timeout = options?.timeout || 120000; // デフォルト120秒
      
      // タイムアウト付きの検索リクエスト
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout + 5000); // サーバーより少し長め
      
      const response = await FileSearchService.searchFiles(path, pattern, options, controller.signal);
      
      clearTimeout(timeoutId);
      
      setResults(response.results);
      setTotalCount(response.totalCount);
      setSearchTime(response.searchTime);
      
      // サーバーからの部分的な結果を検出
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
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="icon">🔍</span>
            File Explorer
          </h1>
          <p className="hero-subtitle">高速でスマートなファイル検索</p>
        </div>
      </div>
      
      <div className="search-container">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="error-message">
            <div className="message-icon">⚠️</div>
            <div className="message-content">
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {isPartialResult && !error && (
          <div className="warning-message">
            <div className="message-icon">ℹ️</div>
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