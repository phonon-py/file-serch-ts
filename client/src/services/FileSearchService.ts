// client/src/services/FileSearchService.ts
import { 
    ISearchRequest, 
    ISearchResponse, 
    ISearchOptions 
  } from '@shared/types/SearchTypes';
  
  const API_URL = 'http://localhost:3001/api';
  
  class FileSearchService {
    /**
     * ファイル検索APIを呼び出す
     * @param startPath 検索開始パス
     * @param pattern 検索パターン
     * @param options 検索オプション
     * @returns 検索結果
     */
    public static async searchFiles(
      startPath: string,
      pattern: string,
      options?: ISearchOptions
    ): Promise<ISearchResponse> {
      try {
        const request: ISearchRequest = {
          startPath,
          pattern,
          options
        };
  
        const response = await fetch(`${API_URL}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '検索に失敗しました');
        }
  
        const data: ISearchResponse = await response.json();
        return data;
      } catch (error) {
        console.error('検索エラー:', error);
        throw error;
      }
    }
  }
  
  export default FileSearchService;