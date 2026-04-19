// client/src/components/Search/SearchResults.tsx
import React, { useState } from 'react';
import { IFileSearchResult } from '@shared/types/SearchTypes';
import { formatFileSize } from '../../utils/formatUtils';

interface ISearchResultsProps {
  results: IFileSearchResult[];
  totalCount: number;
  searchTime: number;
  isLoading: boolean;
  isPartialResult?: boolean;
}

export const SearchResults: React.FC<ISearchResultsProps> = ({ 
  results, 
  totalCount, 
  searchTime,
  isLoading,
  isPartialResult = false
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (path: string): Promise<void> => {
    const ok = await copyToClipboard(path);
    if (ok) {
      setCopiedId(path);
      setTimeout(() => setCopiedId(null), 3000);
    } else {
      alert('パスのコピーに失敗しました');
    }
  };

  // HTTP (非セキュアコンテキスト) では navigator.clipboard が使えないので execCommand へフォールバック
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('navigator.clipboard 失敗、フォールバックを試行:', err);
      }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="search-results-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>検索中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <div className="results-title">
          <h2>
            <span className="results-icon">📋</span>
            検索結果
            <span className="results-count">({totalCount}件)</span>
            {isPartialResult && <span className="partial-badge">部分的</span>}
          </h2>
        </div>
        {searchTime > 0 && (
          <div className="search-time">
            <span className="time-icon">⚡</span>
            {searchTime.toFixed(2)}秒
          </div>
        )}
      </div>

      {isPartialResult && (
        <div className="partial-results-notice">
          <div className="notice-icon">ℹ️</div>
          <p>検索時間が長かったため、一部の結果のみ表示しています。より具体的な検索パターンを試してください。</p>
        </div>
      )}

      {totalCount > 0 ? (
        <div className="results-grid">
          {results.map((result) => (
            <div key={result.path} className="result-card">
              <div className="card-header">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <h3 className="file-name">{result.fileName}</h3>
                  <p className="file-path">{result.path}</p>
                </div>
                <button 
                  className={`copy-button ${copiedId === result.path ? 'copied' : ''}`}
                  onClick={() => handleCopy(result.path)}
                  title="パスをコピー"
                >
                  {copiedId === result.path ? '✓' : '📋'}
                </button>
              </div>
              <div className="card-footer">
                <div className="file-meta">
                  <span className="file-size">
                    <span className="meta-icon">💾</span>
                    {formatFileSize(result.size)}
                  </span>
                  <span className="file-date">
                    <span className="meta-icon">📅</span>
                    {new Date(result.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>検索結果がありません</h3>
          <p>別のキーワードで検索してみてください</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;