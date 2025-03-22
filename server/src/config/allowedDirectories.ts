// server/src/config/allowedDirectories.ts

/**
 * 検索が許可されているディレクトリのリスト
 * セキュリティ上の理由から、検索可能なディレクトリを制限
 */
export const ALLOWED_DIRECTORIES: string[] = [
    '/Users/kimuratoshiyuki/Dropbox'
    // 必要に応じて他の許可されたディレクトリを追加
  ];