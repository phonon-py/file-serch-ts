// server/src/config/allowedDirectories.ts
import fs from 'fs';

/**
 * 検索が許可されているディレクトリのリスト
 * セキュリティ上の理由から、検索可能なディレクトリを制限
 */
const DEFAULT_ALLOWED_DIRECTORIES = [
  '/Volumes/creative_workspace/000_audio_production/audio_sources',
  '/Volumes/creative_workspace/000_audio_production/003_demos',
  '/Volumes/creative_workspace/000_audio_production',
  '/Volumes/creative_workspace',
  '/Users/kimuratoshiyuki/Dropbox'
];

// 環境変数から許可ディレクトリを取得（カンマ区切り）
const envDirectories = process.env.ALLOWED_DIRECTORIES?.split(',').map(dir => dir.trim()) || [];

// 基本的な許可ディレクトリ（存在チェックなし）
export const ALLOWED_DIRECTORIES: string[] = [
  ...DEFAULT_ALLOWED_DIRECTORIES,
  ...envDirectories
].filter(Boolean); // 空文字列を除去

// キャッシュされた利用可能ディレクトリ
let cachedAvailableDirectories: string[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 120000; // 2分キャッシュ（重い処理対応）

/**
 * 利用可能なディレクトリを非同期で取得（キャッシュ付き）
 */
export async function getAvailableDirectories(): Promise<string[]> {
  const now = Date.now();
  
  // キャッシュが有効な場合は返す
  if (cachedAvailableDirectories && (now - lastCacheTime) < CACHE_DURATION) {
    return cachedAvailableDirectories;
  }

  console.log('ディレクトリ存在チェック開始...');
  const startTime = Date.now();
  
  // 並列でディレクトリ存在チェック（タイムアウト付き）
  const checkPromises = ALLOWED_DIRECTORIES.map(async (dir) => {
    try {
      // 10秒タイムアウト（重い処理対応）
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const checkPromise = fs.promises.access(dir, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
      
      const exists = await Promise.race([checkPromise, timeoutPromise]);
      return exists ? dir : null;
    } catch (error) {
      console.warn(`ディレクトリチェックタイムアウト: ${dir}`);
      return null;
    }
  });

  const results = await Promise.all(checkPromises);
  cachedAvailableDirectories = results.filter((dir): dir is string => dir !== null);
  lastCacheTime = now;
  
  const duration = Date.now() - startTime;
  console.log(`ディレクトリチェック完了: ${duration}ms, 利用可能: ${cachedAvailableDirectories.length}/${ALLOWED_DIRECTORIES.length}`);
  
  return cachedAvailableDirectories;
}
