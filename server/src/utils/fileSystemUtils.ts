// server/src/utils/fileSystemUtils.ts
import path from 'path';
import { ALLOWED_DIRECTORIES } from '../config/allowedDirectories';

/**
 * 指定されたパスが許可されたディレクトリ内かを確認する
 * @param checkPath 確認するパス
 * @returns 許可された場合はtrue、そうでない場合はfalse
 */
export async function isAllowedPath(checkPath: string): Promise<boolean> {
  // 入力パスを正規化
  const normalizedPath = path.normalize(checkPath);
  
  // パスが絶対パスであることを確認
  if (!path.isAbsolute(normalizedPath)) {
    return false;
  }
  
  // macOSでは大文字小文字を区別しないようにする
  const lowerNormalizedPath = normalizedPath.toLowerCase();
  
  // 許可されたディレクトリ内にあるか確認
  return ALLOWED_DIRECTORIES.some((allowedDir) => {
    const lowerAllowedDir = allowedDir.toLowerCase();
    // 正確に一致（大文字小文字を区別しない）
    if (lowerNormalizedPath === lowerAllowedDir) {
      return true;
    }
    
    const relPath = path.relative(allowedDir, normalizedPath);
    // パスが許可されたディレクトリ内にあり、かつディレクトリトラバーサル攻撃を防ぐ
    return relPath && !relPath.startsWith('..') && !path.isAbsolute(relPath);
  });
}

/**
 * ファイルサイズを人間が読みやすい形式に変換する
 * @param bytes ファイルサイズ（バイト）
 * @returns 人間が読みやすいファイルサイズ
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * パス文字列を安全にする（不正な文字を削除）
 * @param pathStr パス文字列
 * @returns 安全なパス文字列
 */
export function sanitizePath(pathStr: string): string {
  // パスインジェクションを防ぐための簡易サニタイズ
  // 実際のアプリケーションではより厳密な検証が必要
  return pathStr.replace(/\.{2,}\/|\/\.{2,}/g, '');
}
