// client/src/components/Search/SearchForm.tsx
import React, { useState, useEffect } from 'react';
import { ISearchOptions } from '@shared/types/SearchTypes';
import FileSearchService from '../../services/FileSearchService';
import { SearchIcon } from '../Icons';

interface ISearchFormProps {
  onSearch: (path: string, pattern: string, options?: ISearchOptions) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<ISearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchPath, setSearchPath] = useState<string>('');
  const [searchPattern, setSearchPattern] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [recursive, setRecursive] = useState<boolean>(true);
  const [includeHidden, setIncludeHidden] = useState<boolean>(false);
  const [availableDirectories, setAvailableDirectories] = useState<string[]>([]);
  const [isLoadingDirectories, setIsLoadingDirectories] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const directories = await FileSearchService.getDirectories();
        if (!active) return;
        setAvailableDirectories(directories);
        if (directories.length > 0) setSearchPath(directories[0]);
      } catch (error) {
        if (active) console.error('ディレクトリ取得失敗:', error);
      } finally {
        if (active) setIsLoadingDirectories(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPattern.trim()) return;
    onSearch(searchPath, searchPattern, { recursive, includeHidden });
  };

  return (
    <form className="query" onSubmit={handleSubmit}>
      <p className="query__eyebrow">QUERY / <b>検索</b></p>

      <div className="query__field">
        <label className="field-label" htmlFor="searchPath">検索パス — TARGET PATH</label>
        <select
          id="searchPath"
          className="select-mono"
          value={searchPath}
          onChange={(e) => setSearchPath(e.target.value)}
          disabled={isLoading || isLoadingDirectories}
        >
          {isLoadingDirectories ? (
            <option value="">読み込み中…</option>
          ) : (
            <>
              <option value="">パスを選択してください</option>
              {availableDirectories.map((directory) => (
                <option key={directory} value={directory}>{directory}</option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="query__field">
        <label className="field-label" htmlFor="searchPattern">検索パターン — PATTERN</label>
        <input
          id="searchPattern"
          className="input-mono input-pattern"
          type="text"
          value={searchPattern}
          onChange={(e) => setSearchPattern(e.target.value)}
          placeholder="例: report  *.pdf  invoice"
          autoComplete="off"
          spellCheck={false}
          required
          disabled={isLoading}
        />
      </div>

      <div className="query__actions">
        <button
          type="button"
          className="btn-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
        >
          <span className="btn-advanced__sign">{showAdvanced ? '−' : '+'}</span>
          {showAdvanced ? '詳細設定を隠す' : '詳細設定'}
        </button>

        <button
          type="submit"
          className="btn-search"
          disabled={isLoading || !searchPattern.trim() || !searchPath}
        >
          <SearchIcon size={16} />
          {isLoading ? '検索中…' : '検索'}
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced">
          <label className="check">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              disabled={isLoading}
            />
            サブディレクトリを含める
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={includeHidden}
              onChange={(e) => setIncludeHidden(e.target.checked)}
              disabled={isLoading}
            />
            隠しファイルを含める
          </label>
        </div>
      )}
    </form>
  );
};

export default SearchForm;
