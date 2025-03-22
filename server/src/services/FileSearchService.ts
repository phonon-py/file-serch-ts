// server/src/services/FileSearchService.ts
import fs from 'fs';
import path from 'path';
import { IFileSearchResult, ISearchOptions } from '@shared/types/SearchTypes';
import { isAllowedPath } from '../utils/fileSystemUtils';

class FileSearchService {
  /**
   * ファイルを検索する
   * @param startPath 検索開始パス
   * @param pattern 検索パターン
   * @param options 検索オプション
   * @returns 検索結果
   */
  public static async searchFiles(
    startPath: string,
    pattern: string,
    options: ISearchOptions = {}
  ): Promise<IFileSearchResult[]> {
    // デフォルトオプション
    const defaultOptions: Required<ISearchOptions> = {
      recursive: true,
      includeHidden: false,
      maxResults: 1000,
      timeout: 30000 // 30秒
    };

    // オプションのマージ
    const searchOptions: Required<ISearchOptions> = {
      ...defaultOptions,
      ...options
    };

    // パス検証（セキュリティ対策）
    if (!await isAllowedPath(startPath)) {
      throw new Error('指定されたパスでの検索は許可されていません');
    }

    // startPathが存在するか確認
    if (!fs.existsSync(startPath)) {
      throw new Error(`指定されたパス ${startPath} は存在しません`);
    }

    // 検索結果
    const results: IFileSearchResult[] = [];
    
    // タイムアウト処理
    const timeoutId = setTimeout(() => {
      throw new Error('検索がタイムアウトしました');
    }, searchOptions.timeout);

    // 検索パターンを小文字に変換（大文字小文字を区別しない検索のため）
    const lowerPattern = pattern.toLowerCase();

    try {
      // 再帰的に検索
      await this.recursiveSearch(
        startPath,
        lowerPattern,
        results,
        searchOptions
      );
      
      // タイムアウトをクリア
      clearTimeout(timeoutId);
      
      return results;
    } catch (error) {
      // タイムアウトをクリア
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 再帰的に検索する
   */
  private static async recursiveSearch(
    currentPath: string,
    pattern: string,
    results: IFileSearchResult[],
    options: Required<ISearchOptions>
  ): Promise<void> {
    // 結果数が上限に達した場合は終了
    if (results.length >= options.maxResults) {
      return;
    }

    try {
      // ディレクトリ内のファイルとフォルダを取得
      const files = await fs.promises.readdir(currentPath);
      
      // 各ファイルを処理
      for (const file of files) {
        // 隠しファイルをスキップ（オプションに応じて）
        if (!options.includeHidden && file.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(currentPath, file);
        
        try {
          const stats = await fs.promises.stat(fullPath);
          
          // ディレクトリの場合
          if (stats.isDirectory() && options.recursive) {
            await this.recursiveSearch(
              fullPath,
              pattern,
              results,
              options
            );
          } 
          // ファイルの場合
          else if (stats.isFile()) {
            // ファイルパスを小文字に変換して検索
            if (fullPath.toLowerCase().includes(pattern)) {
              results.push({
                path: fullPath,
                fileName: path.basename(fullPath),
                extension: path.extname(fullPath),
                lastModified: stats.mtime,
                size: stats.size
              });
            }
          }
          
          // 結果数が上限に達した場合は終了
          if (results.length >= options.maxResults) {
            return;
          }
        } catch (err) {
          // 個々のファイル処理エラーは無視（アクセス権限の問題など）
          console.error(`ファイル処理エラー: ${fullPath}`, err);
        }
      }
    } catch (err) {
      // ディレクトリの読み取りエラー
      console.error(`ディレクトリ読み取りエラー: ${currentPath}`, err);
    }
  }
}

export default FileSearchService;