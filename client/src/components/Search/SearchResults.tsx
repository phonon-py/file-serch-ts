// client/src/components/Search/SearchResults.tsx
import React, { useState } from 'react';
import { IFileSearchResult } from '@shared/types/SearchTypes';
import { formatFileSize } from '../../utils/formatUtils';

interface ISearchResultsProps {
  results: IFileSearchResult[];
  totalCount: number;
  searchTime: number;
  isLoading: boolean;
}

export const SearchResults: React.FC<ISearchResultsProps> = ({ 
  results, 
  totalCount, 
  searchTime,
  isLoading
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (path: string): void => {
    navigator.clipboard.writeText(path)
      .then(() => {
        setCopiedId(path);
        // 3秒後にコピー状態をリセット
        setTimeout(() => setCopiedId(null), 3000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('パスのコピーに失敗しました');
      });
  };

  if (isLoading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>検索中...</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>検索結果 ({totalCount}件)</h2>
        {searchTime > 0 && (
          <span className="search-time">検索時間: {searchTime.toFixed(2)}秒</span>
        )}
      </div>

      {totalCount > 0 ? (
        <ul className="results-list">
          {results.map((result) => (
            <li key={result.path} className="result-item">
              <div className="file-info">
                <span className="file-name">{result.fileName}</span>
                <span className="file-path">{result.path}</span>
                <div className="file-meta">
                  <span className="file-size">{formatFileSize(result.size)}</span>
                  <span className="file-date">
                    {new Date(result.lastModified).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                className={`copy-button ${copiedId === result.path ? 'copied' : ''}`}
                onClick={() => handleCopy(result.path)}
              >
                {copiedId === result.path ? 'コピー済み' : 'コピー'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-results">検索結果がありません</p>
      )}
    </div>
  );
};

export default SearchResults;