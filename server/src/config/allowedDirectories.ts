// server/src/config/allowedDirectories.ts
import fs from 'fs';

/**
 * ローカル開発用のフォールバック（環境変数 ALLOWED_DIRECTORIES が未設定のとき使用）
 */
const LOCAL_DEV_FALLBACK = [
  '/Volumes/creative_workspace',
  '/Users/kimuratoshiyuki/Dropbox',
];

const envDirectories = process.env.ALLOWED_DIRECTORIES
  ?.split(',')
  .map((dir) => dir.trim())
  .filter(Boolean);

export const ALLOWED_DIRECTORIES: string[] =
  envDirectories && envDirectories.length > 0 ? envDirectories : LOCAL_DEV_FALLBACK;

let cachedAvailableDirectories: string[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 120000;

export async function getAvailableDirectories(): Promise<string[]> {
  const now = Date.now();

  if (cachedAvailableDirectories && (now - lastCacheTime) < CACHE_DURATION) {
    return cachedAvailableDirectories;
  }

  console.log('ディレクトリ存在チェック開始...');
  const startTime = Date.now();

  const checkPromises = ALLOWED_DIRECTORIES.map(async (dir) => {
    try {
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
