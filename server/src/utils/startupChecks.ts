// server/src/utils/startupChecks.ts
import fs from 'fs';

/**
 * サーバー起動時のチェック処理（非同期）
 */
export async function performStartupChecks(directories: string[]): Promise<void> {
  console.log('=== 起動時チェック ===');
  
  // 許可ディレクトリの存在確認（並列実行、タイムアウト付き）
  console.log('許可ディレクトリの確認中...');
  
  const checkPromises = directories.map(async (dir, index) => {
    try {
      // 5秒タイムアウト（重い処理対応）
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const checkPromise = fs.promises.access(dir, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
      
      const exists = await Promise.race([checkPromise, timeoutPromise]);
      const status = exists ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${dir}`);
      
      if (!exists) {
        console.warn(`    警告: ディレクトリが存在しないか、アクセスできません`);
      }
      
      return { dir, exists };
    } catch (error) {
      console.log(`  ${index + 1}. ⏱️ ${dir} (タイムアウト)`);
      return { dir, exists: false };
    }
  });

  const results = await Promise.all(checkPromises);
  const availableCount = results.filter(r => r.exists).length;
  
  console.log(`利用可能: ${availableCount}/${directories.length} ディレクトリ`);
  console.log('=====================');
}