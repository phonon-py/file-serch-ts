// client/src/components/Search/SearchForm.tsx
import React, { useState, useEffect } from 'react';
import { ISearchOptions, IDirectoriesResponse } from '@shared/types/SearchTypes';

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
    fetchAvailableDirectories();
  }, []);

  const fetchAvailableDirectories = async () => {
    try {
      setIsLoadingDirectories(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      // 30秒タイムアウト設定（重い処理対応）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      console.log('ディレクトリ一覧取得開始...');
      const startTime = Date.now();
      
      const response = await fetch(`${apiUrl}/directories`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log(`ディレクトリ一覧取得完了: ${duration}ms`);
      const data: IDirectoriesResponse = await response.json();
      setAvailableDirectories(data.directories || []);
      
      // デフォルト値を設定（最初のディレクトリを選択）
      if (data.directories && data.directories.length > 0) {
        setSearchPath(data.directories[0]);
      }
    } catch (error) {
      console.error('ディレクトリ取得失敗:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('ディレクトリ取得がタイムアウトしました');
        // タイムアウト時はデフォルトパスを設定
        setAvailableDirectories(['/Users/kimuratoshiyuki/Dropbox']);
        setSearchPath('/Users/kimuratoshiyuki/Dropbox');
      }
    } finally {
      setIsLoadingDirectories(false);
    }
  };

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
          <select
            id="searchPath"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            disabled={isLoading || isLoadingDirectories}
          >
            {isLoadingDirectories ? (
              <option value="">読み込み中...</option>
            ) : (
              <>
                <option value="">パスを選択してください</option>
                {availableDirectories.map((directory) => (
                  <option key={directory} value={directory}>
                    {directory}
                  </option>
                ))}
              </>
            )}
          </select>
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
            disabled={isLoading || !searchPattern.trim() || !searchPath}
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
