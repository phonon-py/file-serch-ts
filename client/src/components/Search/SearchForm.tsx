// client/src/components/Search/SearchForm.tsx
import React, { useState } from 'react';
import { ISearchOptions } from '@shared/types/SearchTypes';

interface ISearchFormProps {
  onSearch: (path: string, pattern: string, options?: ISearchOptions) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<ISearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchPath, setSearchPath] = useState<string>('/Users/kimuratoshiyuki/Dropbox');
  const [searchPattern, setSearchPattern] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [recursive, setRecursive] = useState<boolean>(true);
  const [includeHidden, setIncludeHidden] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchPattern.trim()) return;
    
    const options: ISearchOptions = {
      recursive,
      includeHidden
    };
    
    onSearch(searchPath, searchPattern, options);
  };

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="searchPath">検索パス:</label>
          <input
            id="searchPath"
            type="text"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            placeholder="検索を開始するパスを入力"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="searchPattern">検索パターン:</label>
          <input
            id="searchPattern"
            type="text"
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
            placeholder="検索するパターンを入力"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isLoading}
          >
            {showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}
          </button>
          
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !searchPattern.trim()}
          >
            {isLoading ? '検索中...' : '検索'}
          </button>
        </div>
        
        {showAdvanced && (
          <div className="advanced-options">
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={recursive}
                  onChange={(e) => setRecursive(e.target.checked)}
                  disabled={isLoading}
                />
                サブディレクトリを含める
              </label>
            </div>
            
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeHidden}
                  onChange={(e) => setIncludeHidden(e.target.checked)}
                  disabled={isLoading}
                />
                隠しファイルを含める
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;
