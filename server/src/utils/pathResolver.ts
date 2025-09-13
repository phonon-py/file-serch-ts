// server/src/utils/pathResolver.ts
import fs from 'fs';
import path from 'path';

/**
 * 動的にマウントポイントを検出する
 */
export function findMountPoint(baseName: string): string | null {
  const volumesDir = '/Volumes';
  
  try {
    const volumes = fs.readdirSync(volumesDir);
    
    // 完全一致を優先
    if (volumes.includes(baseName)) {
      return path.join(volumesDir, baseName);
    }
    
    // 番号付きバージョンを検索（creative_workspace-1, creative_workspace-2など）
    const numberedVersions = volumes
      .filter(vol => vol.startsWith(`${baseName}-`))
      .sort(); // 番号順にソート
    
    if (numberedVersions.length > 0) {
      return path.join(volumesDir, numberedVersions[0]);
    }
    
    return null;
  } catch (error) {
    console.error('ボリューム検索エラー:', error);
    return null;
  }
}

/**
 * 利用可能なパスを動的に解決する
 */
export function resolveAvailablePaths(): string[] {
  const basePaths = [
    'creative_workspace',
    // 他のベース名も追加可能
  ];
  
  const resolvedPaths: string[] = [];
  
  basePaths.forEach(baseName => {
    const mountPoint = findMountPoint(baseName);
    if (mountPoint) {
      // サブディレクトリも追加
      const subDirs = [
        '000_audio_production/audio_sources',
        '000_audio_production/003_demos',
        '000_audio_production',
        ''
      ];
      
      subDirs.forEach(subDir => {
        const fullPath = subDir ? path.join(mountPoint, subDir) : mountPoint;
        if (fs.existsSync(fullPath)) {
          resolvedPaths.push(fullPath);
        }
      });
    }
  });
  
  // 固定パスも追加
  const fixedPaths = ['/Users/kimuratoshiyuki/Dropbox'];
  fixedPaths.forEach(fixedPath => {
    if (fs.existsSync(fixedPath)) {
      resolvedPaths.push(fixedPath);
    }
  });
  
  return resolvedPaths;
}