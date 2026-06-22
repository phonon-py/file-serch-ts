// client/src/components/Search/SearchResults.tsx
import React, { useState } from 'react';
import { IFileSearchResult } from '@shared/types/SearchTypes';
import { formatFileSize } from '../../utils/formatUtils';
import { CopyIcon, CheckIcon, GlobMark, SearchIcon } from '../Icons';

interface ISearchResultsProps {
  results: IFileSearchResult[];
  totalCount: number;
  searchTime: number;
  isLoading: boolean;
  isPartialResult?: boolean;
}

// HTTP（非セキュアコンテキスト）では navigator.clipboard が使えないので execCommand へフォールバック
async function copyToClipboard(text: string): Promise<boolean> {
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
    textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('クリップボードへのコピーに失敗しました:', err);
    return false;
  }
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
    if (await copyToClipboard(path)) {
      setCopiedId(path);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      alert('パスのコピーに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="results">
        <div className="loading">
          <GlobMark size={46} className="scanner" />
          <p>SCANNING — 検索中</p>
        </div>
      </div>
    );
  }

  return (
    <section className="results">
      <div className="results__head">
        <h2 className="results__title">
          検索結果
          <span className="results__count">{totalCount} 件</span>
          {isPartialResult && <span className="badge-partial">PARTIAL</span>}
        </h2>
        {searchTime > 0 && (
          <span className="results__stat">
            ELAPSED <b>{searchTime.toFixed(2)}s</b>
          </span>
        )}
      </div>

      {totalCount > 0 ? (
        <div className="ladder">
          {results.map((result, i) => (
            <article key={result.path} className="row">
              <span className="row__idx">{String(i + 1).padStart(4, '0')}</span>
              <div className="row__main">
                <h3 className="row__name">{result.fileName}</h3>
                <p className="row__path">{result.path}</p>
              </div>
              <div className="row__meta">
                <span className="meta-cell">
                  <span className="k">Size</span>
                  <span className="v">{formatFileSize(result.size)}</span>
                </span>
                <span className="meta-cell">
                  <span className="k">Modified</span>
                  <span className="v">{new Date(result.lastModified).toLocaleDateString('ja-JP')}</span>
                </span>
              </div>
              <button
                className={`row__copy ${copiedId === result.path ? 'copied' : ''}`}
                onClick={() => handleCopy(result.path)}
                title="パスをコピー"
                aria-label="パスをコピー"
              >
                {copiedId === result.path ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <SearchIcon size={40} className="empty__mark" />
          <h3>No Results</h3>
          <p>別のキーワードで検索してみてください</p>
        </div>
      )}
    </section>
  );
};

export default SearchResults;
