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
      timeout: 300000, // 300秒（5分）- Tailscale NAS対応
      maxDepth: 5 // デフォルト5階層（NASローカル実行で爆速なので深めに）
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
   * 除外すべきディレクトリパターン
   */
  private static readonly EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.svn',
    '.hg',
    'dist',
    'build',
    '.next',
    '.cache',
    'coverage'
  ]);

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
    // 早期return: 結果数が上限に達した場合は終了
    if (results.length >= options.maxResults) {
      return;
    }

    // 早期return: 検索深度の制限（Tailscale NAS最適化）
    const maxDepth = options.maxDepth || 5;
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      // ディレクトリ内のファイルとフォルダを取得
      const files = await fs.promises.readdir(currentPath);

      // 並列処理の同時実行数を制限（メモリ効率向上）
      const BATCH_SIZE = 20;
      const filteredFiles = files.filter(file => options.includeHidden || !file.startsWith('.'));

      for (let i = 0; i < filteredFiles.length; i += BATCH_SIZE) {
        // 早期return: バッチ処理前に結果数チェック
        if (results.length >= options.maxResults) {
          return;
        }

        const batch = filteredFiles.slice(i, i + BATCH_SIZE);
        const processPromises = batch.map(async (file) => {
          const fullPath = path.join(currentPath, file);

          // ファイル名事前フィルタリング（Tailscale NAS最適化）
          const fileName = file.toLowerCase();
          const fullPathLower = fullPath.toLowerCase();
          const matchesPattern = fileName.includes(pattern) || fullPathLower.includes(pattern);

          try {
            // lstat()のみ使用（stat()二重呼び出し削除 - NAS最適化）
            const stats = await fs.promises.lstat(fullPath);

            // ディレクトリの場合
            if (stats.isDirectory()) {
              // 除外ディレクトリのスキップ
              if (this.EXCLUDED_DIRS.has(file)) {
                return null;
              }

              const dirResults = [];

              // ディレクトリ名も検索対象に含める
              if (matchesPattern) {
                dirResults.push({
                  path: fullPath,
                  fileName: path.basename(fullPath),
                  extension: '',
                  lastModified: stats.mtime,
                  size: 0
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
            // ファイルの場合（パターンマッチ時のみ）
            else if (stats.isFile() && matchesPattern) {
              // lstat()の結果を直接使用（stat()削除）
              return [{
                path: fullPath,
                fileName: path.basename(fullPath),
                extension: path.extname(fullPath),
                lastModified: stats.mtime,
                size: stats.size
              }];
            }

            return null;
          } catch (err) {
            // 個々のファイル処理エラーは無視
            console.error(`ファイル処理エラー: ${fullPath}`, err);
            return null;
          }
        });

        // バッチ単位で並列処理の結果を収集
        const allResults = await Promise.all(processPromises);

        // 結果をフラット化して追加
        for (const fileResults of allResults) {
          if (fileResults) {
            for (const result of fileResults) {
              if (result) {
                results.push(result);
                // 早期return: 結果数が上限に達した場合は即座に終了
                if (results.length >= options.maxResults) {
                  return;
                }
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