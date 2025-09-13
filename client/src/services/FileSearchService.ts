// client/src/services/FileSearchService.ts
import { 
  ISearchRequest, 
  ISearchResponse, 
  ISearchOptions 
} from '@shared/types/SearchTypes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class FileSearchService {
  /**
   * ファイル検索APIを呼び出す
   * @param startPath 検索開始パス
   * @param pattern 検索パターン
   * @param options 検索オプション
   * @param signal AbortControllerからのシグナル（タイムアウト用）
   * @returns 検索結果
   */
  public static async searchFiles(
    startPath: string,
    pattern: string,
    options?: ISearchOptions,
    signal?: AbortSignal
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
        body: JSON.stringify(request),
        signal // AbortControllerのシグナルを渡す
      });

      if (!response.ok) {
        let errorMessage = '検索に失敗しました';
        
        // レスポンスのステータスコードに基づいたエラーメッセージ
        switch (response.status) {
          case 400:
            errorMessage = '不正なリクエストです。検索パラメータを確認してください。';
            break;
          case 403:
            errorMessage = '指定されたパスへのアクセスが許可されていません。';
            break;
          case 404:
            errorMessage = '指定されたパスが見つかりません。';
            break;
          case 408:
            errorMessage = '検索がタイムアウトしました。検索範囲を狭めるか、より具体的な検索パターンを試してください。';
            break;
          case 500:
            errorMessage = 'サーバー内部エラーが発生しました。';
            break;
        }
        
        try {
          // サーバーからの詳細なエラーメッセージがあれば使用
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          // JSONパースエラーは無視
        }
        
        throw new Error(errorMessage);
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