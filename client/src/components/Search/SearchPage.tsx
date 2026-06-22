// client/src/components/Search/SearchPage.tsx
import React, { useState } from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { IFileSearchResult, ISearchOptions } from '@shared/types/SearchTypes';
import FileSearchService from '../../services/FileSearchService';
import { GlobMark } from '../Icons';

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

    const timeout = options?.timeout ?? 120000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout + 5000);

    try {
      const response = await FileSearchService.searchFiles(path, pattern, options, controller.signal);
      setResults(response.results);
      setTotalCount(response.totalCount);
      setSearchTime(response.searchTime);
      setIsPartialResult(Boolean(response.isPartialResult));
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
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="masthead">
        <div className="masthead__mark">
          <GlobMark size={26} className="masthead__glyph" />
          <h1 className="masthead__title">Glacial Index</h1>
        </div>
        <div className="masthead__meta">
          ファイル検索<br />
          MONOCHROME · FILE SEARCH
        </div>
      </header>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="notice" role="alert" style={{ marginTop: 22 }}>
          <span className="notice__tag">ERROR</span>
          <p>{error}</p>
        </div>
      )}

      {isPartialResult && !error && (
        <div className="notice notice--soft" style={{ marginTop: 22 }}>
          <span className="notice__tag">NOTE</span>
          <p>検索時間が長かったため、一部の結果のみ表示しています。より具体的な検索パターンを試してください。</p>
        </div>
      )}

      <SearchResults
        results={results}
        totalCount={totalCount}
        searchTime={searchTime}
        isLoading={isLoading}
        isPartialResult={isPartialResult}
      />
    </>
  );
};

export default SearchPage;
