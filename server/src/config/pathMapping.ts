// server/src/config/pathMapping.ts
/**
 * コンテナ内パス ↔ クライアント表示パス の相互変換
 *
 * 環境変数 DISPLAY_PATH_MAP でマッピングを指定する
 * 書式: "<container>:<display>" をカンマ区切りで並べる
 * 例: "/data/creative_workspace:/Volumes/creative_workspace"
 *
 * サーバーは内部的にコンテナ内パスを扱い、レスポンスでは表示パスに変換する。
 * クライアントから送られた検索パスは変換してサービスに渡す。
 */

interface PathMapping {
  container: string;
  display: string;
}

const parseMappings = (): PathMapping[] => {
  const raw = process.env.DISPLAY_PATH_MAP?.trim();
  if (!raw) return [];

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const idx = entry.indexOf(':');
      if (idx <= 0) return null;
      return {
        container: entry.slice(0, idx).trim(),
        display: entry.slice(idx + 1).trim(),
      };
    })
    .filter((m): m is PathMapping => !!m && !!m.container && !!m.display);
};

const MAPPINGS = parseMappings();

const matches = (p: string, prefix: string): boolean =>
  p === prefix || p.startsWith(prefix + '/');

export function toDisplayPath(containerPath: string): string {
  for (const m of MAPPINGS) {
    if (matches(containerPath, m.container)) {
      return m.display + containerPath.slice(m.container.length);
    }
  }
  return containerPath;
}

export function toContainerPath(displayPath: string): string {
  for (const m of MAPPINGS) {
    if (matches(displayPath, m.display)) {
      return m.container + displayPath.slice(m.display.length);
    }
  }
  return displayPath;
}
