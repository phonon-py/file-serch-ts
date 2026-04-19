# NAS上でのDockerデプロイ記録

## 対象環境

- **NAS**: UGREEN DXP2800 (UGOS, Intel N100 / x86_64, ext4)
- **Docker**: 26.1.0 / Compose v2.26.1
- **配置先**: `/volume1/docker/file-search/`
- **公開ポート**: `8080` (nginx)
- **検索対象マウント**: `/volume1/creative_workspace` → `/data/creative_workspace` (read-only)

## アーキテクチャ

```
[ブラウザ]
    ↓ http://192.168.1.34:8080
[frontend コンテナ]  nginx alpine
    ├─ /           → React build (/usr/share/nginx/html)
    └─ /api/*      → proxy_pass http://backend:3001
         ↓ Docker内部ネットワーク (file-search-net)
    [backend コンテナ]  node:20-alpine
         └─ /data/creative_workspace (ro bind mount)
```

- **frontend**: マルチステージビルド（Reactビルド → nginxで配信）
- **backend**: Express + TypeScript。起動時 `tsconfig-paths/register` で `@shared/*` をビルド済み `shared/dist/*` に解決

## デプロイ手順

### 初回

```bash
# Mac → NAS にソース転送（UGOSのrsyncラッパー対策で tar|ssh を使用）
cd /Users/kimuratoshiyuki/TypeScriptProjects/file-search-ts
tar czf - --exclude node_modules --exclude .git --exclude 'client/build' \
  --exclude 'server/dist' --exclude 'shared/dist' --exclude '.DS_Store' . \
  | ssh Toshiyuki@192.168.1.34 "cd /volume1/docker/file-search && tar xzf -"

# NAS上でビルド&起動
ssh Toshiyuki@192.168.1.34
cd /volume1/docker/file-search
cp .env.example .env
docker compose up -d --build
```

### 更新時

コード変更後、Macで同じ tar|ssh コマンドを叩いて、NAS上で `docker compose up -d --build`。

## 詰まったポイントと解決

### 1. NASにgitが入っていない

UGOSにgitコマンドがない。→ `git clone` せず `tar | ssh` でソース転送した。CI/CD移行時も同じパターンが使える。

### 2. rsyncがUGOSで拒否された

```
ug_start_server, check access user: 1000, group: 10
invalid path: '/volume1/docker/file-search/'
```

UGOSが独自のrsyncラッパー (`ug_start_server`) を噛ませていて、`/volume1/docker/` 配下への書き込みを拒否。→ `tar czf - | ssh host "tar xzf -"` で回避。

### 3. Dockerfile builderでの `npx tsc` が意図しないパッケージを落とす

`shared/` にTypeScriptが無いため `npx tsc` が "This is not the tsc command you are looking for" を出した。→ server/node_modules にインストール済みの tsc を直接呼ぶ形に変更:

```dockerfile
RUN ./server/node_modules/.bin/tsc -p shared/tsconfig.json
```

frontend側も同様に `./client/node_modules/.bin/tsc` で shared を先行ビルド。

### 4. `@shared/*` パスエイリアスが本番で解決できない

`tsc` は `@shared/*` を残したまま出力するため、`node dist/server.js` で `Cannot find module '@shared/utils/formatUtils'`。

→ 2段階で解決:
1. ランタイムに `tsconfig-paths/register` を噛ませる:
   ```dockerfile
   CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]
   ```
2. ランタイム用 `tsconfig.json` を生成して paths を dist に向ける:
   ```json
   {"compilerOptions":{"baseUrl":".","paths":{"@shared/*":["../shared/dist/*"]}}}
   ```
3. `tsconfig-paths` を devDependencies → dependencies に移動（本番で必要なため）。

### 5. UGOS独自ACL (UGACL) がコンテナをブロック ★最大の詰まりポイント★

**症状**: backendが起動後、検索実行時に `EACCES: permission denied, scandir '/data/creative_workspace'`。ホスト側は `drwxrwxrwx 777` なのにコンテナ内では `d---------` (mode 0000) に見える。

**原因**: UGREEN UGOSが共有フォルダに独自のACL（`ugacl`）を被せている。拡張属性で確認:

```
$ getfattr -d -m - /volume1/creative_workspace
system.ugacl_self=0sAQAAAAoAAADPNwAABgAAAAoAAAAAAAAA
user.no_permission_hide.status="true"
user.share_folder_key.type="1"
```

`user.no_permission_hide.status="true"` により、権限がないプロセスからはフォルダが「隠される」挙動。POSIX権限もPOSIX ACLも緩いが、UGACLが非rootコンテナを遮断している。

**切り分け**:

```bash
# rootコンテナ → 見える
docker run --rm -v /volume1/creative_workspace:/data:ro alpine ls -la /data

# nodeユーザー (UID 1000) コンテナ → 見えない
docker compose exec backend ls -la /data/creative_workspace
# ls: can't open '/data/creative_workspace': Permission denied
```

UGACLは root (UID 0) をバイパスする。

**暫定対処** (現状): `docker-compose.yml` の backend に `user: "0:0"` を追加し、`Dockerfile.backend` から `USER node` を削除。rootでコンテナを起動。

マウントは `:ro` なので書き込みリスクはゼロ。検索のみの用途なので実害は限定的だが、原則非root推奨なので恒久対応で戻したい。

**恒久対応 (TODO)**: UGOS管理画面で `creative_workspace` にコンテナ用UID (1000) への読み取り権限を UGACL に追加。できれば `user: "0:0"` を削除し、`USER node` を復活させる。

## 環境変数 (.env)

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PUBLIC_PORT` | `8080` | ホスト側の公開ポート（nginx） |
| `HOST_SEARCH_ROOT` | `/volume1/creative_workspace` | NAS側の検索対象ルート |
| `ALLOWED_DIRECTORIES` | `/data/creative_workspace` | コンテナ内で許可するディレクトリ（サーバーが読む） |

## アクセス方法

- **LAN内**: http://192.168.1.34:8080
- **外出先**: Tailscale経由で同じURLまたはNASのTailscale IPでアクセス（サーバーのCORSに Tailscale `100.68.x.x` 系を追加済み）

## パフォーマンス

NAS内ローカル（`/volume1` 直結）のため、Tailscale経由のリモート検索より圧倒的に速い。「爆速」レベル。

## 未実施 (今後のTODO)

- [ ] UGOS管理画面でUGACLを設定し、`user: "0:0"` を外して非rootに戻す
- [ ] CI/CD構築（GitHub Actions → NAS SSH デプロイ）
- [ ] NASのIPをDHCP予約で固定
- [ ] コンテナのヘルスチェック追加

## 参考情報

- UGOSのrsync/SSHは独自ラッパー経由。`tar | ssh` で素のSSHを使う手法が確実
- UGOSは `prjquota` 付きext4で共有フォルダを管理。ACLは `system.ugacl_self` という拡張属性に格納される非標準方式
- Dockerの `:ro` bind mount はUGACLを上書きできない（UGACLはカーネル/FSレイヤで効く）
