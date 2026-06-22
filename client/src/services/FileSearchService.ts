// client/src/services/FileSearchService.ts
import {
  ISearchRequest,
  ISearchResponse,
  ISearchOptions,
  IDirectoriesResponse
} from '@shared/types/SearchTypes';

// 相対パス。dev は CRA の proxy(:3001)、本番は nginx の location /api/ が転送するため、
// どの端末・どのホストからアクセスしても同一オリジンで到達できる。
const API_URL = process.env.REACT_APP_API_URL || '/api';

/** AbortSignal that fires after `ms`, composing with an optional caller signal. */
function withTimeout(ms: number, signal?: AbortSignal): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });
  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

const STATUS_MESSAGES: Record<number, string> = {
  400: '不正なリクエストです。検索パラメータを確認してください。',
  403: '指定されたパスへのアクセスが許可されていません。',
  404: '指定されたパスが見つかりません。',
  408: '検索がタイムアウトしました。検索範囲を狭めるか、より具体的な検索パターンを試してください。',
  500: 'サーバー内部エラーが発生しました。'
};

class FileSearchService {
  /** 検索可能なディレクトリ一覧を取得する。 */
  public static async getDirectories(timeoutMs = 30000): Promise<string[]> {
    const { signal, clear } = withTimeout(timeoutMs);
    try {
      const response = await fetch(`${API_URL}/directories`, { signal });
      const data: IDirectoriesResponse = await response.json();
      return data.directories || [];
    } finally {
      clear();
    }
  }

  /**
   * ファイル検索APIを呼び出す。
   * @param signal 呼び出し側のキャンセル用シグナル（タイムアウト等）
   */
  public static async searchFiles(
    startPath: string,
    pattern: string,
    options?: ISearchOptions,
    signal?: AbortSignal
  ): Promise<ISearchResponse> {
    const request: ISearchRequest = { startPath, pattern, options };

    const response = await fetch(`${API_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal
    });

    if (!response.ok) {
      let message = STATUS_MESSAGES[response.status] || '検索に失敗しました';
      try {
        const errorData = await response.json();
        if (errorData?.error) message = errorData.error;
      } catch {
        /* JSONでないレスポンスはステータス由来のメッセージを使う */
      }
      throw new Error(message);
    }

    return response.json();
  }
}

export default FileSearchService;
