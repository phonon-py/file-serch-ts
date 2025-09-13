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
    // デフォルトオプション（Tailscale NAS対応）
    const defaultOptions: Required<ISearchOptions> = {
      recursive: true,
      includeHidden: false,
      maxResults: 1000,
      timeout: 300000 // 300秒（5分）- Tailscale NAS対応
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
    
    // 検索パターンを小文字に変換（大文字小文字を区別しない検索のため）
    const lowerPattern = pattern.toLowerCase();

    // タイムアウト付きで検索を実行
    const searchPromise = this.recursiveSearch(
      startPath,
      lowerPattern,
      results,
      searchOptions
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('検索がタイムアウトしました'));
      }, searchOptions.timeout);
    });

    try {
      await Promise.race([searchPromise, timeoutPromise]);
      return results;
    } catch (error) {
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
    options: Required<ISearchOptions>,
    currentDepth: number = 0
  ): Promise<void> {
    // 結果数が上限に達した場合は終了
    if (results.length >= options.maxResults) {
      return;
    }

    // 検索深度の制限（Tailscale NAS最適化）
    // 深度0: 最上位ディレクトリ、深度1: 1階層下、深度2: 2階層下まで
    const maxDepth = 2; // バランスの取れた制限
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      // ディレクトリ内のファイルとフォルダを取得
      const files = await fs.promises.readdir(currentPath);
      
      // 各ファイルを処理（並列処理で高速化）
      const processPromises = files
        .filter(file => options.includeHidden || !file.startsWith('.'))
        .map(async (file) => {
          const fullPath = path.join(currentPath, file);
          
          // ファイル名事前フィルタリング（Tailscale NAS最適化）
          const fileName = file.toLowerCase();
          const fullPathLower = fullPath.toLowerCase();
          const matchesPattern = fileName.includes(pattern) || fullPathLower.includes(pattern);
          
          try {
            // 軽量なファイルタイプチェック（lstat使用）
            const stats = await fs.promises.lstat(fullPath);
            
            // パターンマッチしないファイルはスキップ（ディレクトリ除く）
            if (!matchesPattern && !stats.isDirectory()) {
              return null;
            }
            
            // ディレクトリの場合
            if (stats.isDirectory()) {
              const dirResults = [];
              
              // ディレクトリ名も検索対象に含める
              if (matchesPattern) {
                dirResults.push({
                  path: fullPath,
                  fileName: path.basename(fullPath),
                  extension: '', // ディレクトリは拡張子なし
                  lastModified: stats.mtime,
                  size: 0 // ディレクトリはサイズ0
                });
              }
              
              // 再帰検索を実行
              if (options.recursive) {
                await this.recursiveSearch(
                  fullPath,
                  pattern,
                  results,
                  options,
                  currentDepth + 1
                );
              }
              
              return dirResults;
            } 
            // ファイルの場合
            else if (stats.isFile() && matchesPattern) {
              // より詳細なstat情報が必要な場合のみ追加でstat()実行
              const detailedStats = await fs.promises.stat(fullPath);
              return [{
                path: fullPath,
                fileName: path.basename(fullPath),
                extension: path.extname(fullPath),
                lastModified: detailedStats.mtime,
                size: detailedStats.size
              }];
            }
            
            return null;
          } catch (err) {
            // 個々のファイル処理エラーは無視
            console.error(`ファイル処理エラー: ${fullPath}`, err);
            return null;
          }
        });

      // 並列処理の結果を収集
      const allResults = await Promise.all(processPromises);
      
      // 結果をフラット化して追加
      for (const fileResults of allResults) {
        if (fileResults) {
          for (const result of fileResults) {
            if (result) {
              results.push(result);
              // 結果数が上限に達した場合は終了
              if (results.length >= options.maxResults) {
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      // ディレクトリの読み取りエラー
      console.error(`ディレクトリ読み取りエラー: ${currentPath}`, err);
    }
  }
}

export default FileSearchService;