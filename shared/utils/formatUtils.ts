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
 * パスからファイル名を抽出する
 * @param path ファイルパス
 * @returns ファイル名
 */
export function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

/**
 * パスからファイル拡張子を抽出する
 * @param path ファイルパス
 * @returns ファイル拡張子
 */
export function getFileExtension(path: string): string {
  const fileName = getFileName(path);
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : fileName.slice(lastDotIndex);
}