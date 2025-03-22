# ファイル検索アプリケーション

これはTypeScriptで実装されたファイル検索アプリケーションです。指定されたディレクトリ内のファイルをパターンで検索し、結果を一覧表示します。

## 機能

- ディレクトリ内のファイルをパターンマッチで検索
- 再帰的な検索オプション
- 検索結果の一覧表示（ファイル名、パス、サイズ、更新日時）
- ファイルパスのクリップボードへのコピー
- 隠しファイルの表示/非表示オプション

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バックエンド**: Express.js + TypeScript
- **アーキテクチャ**: RESTfulなAPIとクライアント構成

## プロジェクト構造

```
file-search-ts/
├── client/         # フロントエンドのReactアプリケーション
├── server/         # バックエンドのExpress.jsサーバー
├── shared/         # 共有型定義
└── docs/           # プロジェクトドキュメント
    ├── requirements/  # 要件定義
    └── mockups/       # UIモックアップ
```

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/file-search-ts.git
cd file-search-ts

# 依存パッケージのインストール
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 開発サーバーの起動
npm run dev
```

## ビルドと実行

```bash
# プロジェクトのビルド
npm run build

# 本番環境での実行
npm start
```

## 使い方

1. 検索パスを入力（デフォルトは `/Users/kimuratoshiyuki/Dropbox`）
2. 検索パターンを入力（例: `melodic` や `.mp3`）
3. オプションの設定（サブディレクトリを含める、隠しファイルを含めるなど）
4. 検索ボタンをクリック
5. 検索結果から必要なファイルパスをコピー

## トラブルシューティング

### 検索が正常に動作しない場合

- 検索パスが存在することを確認
- 大文字小文字の区別に注意（パスは正確に入力）
- サーバーが起動していることを確認（ポート3001）

### アクセス権限エラーが発生する場合

- サーバー側の `allowedDirectories.ts` ファイルで許可されたディレクトリが正しく設定されているか確認
- パスの大文字小文字が正確に一致しているか確認（特にMacOSでは重要）
- 該当ディレクトリにアクセス権限があるか確認

## セキュリティに関する注意点

このアプリケーションは、ファイルシステムにアクセスするため、セキュリティに注意が必要です：

- 信頼できるディレクトリのみを `allowedDirectories.ts` に設定
- パスインジェクション攻撃を防ぐためのバリデーションが実装されています
- 重要なシステムディレクトリへのアクセスは制限されています

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT

## 謝辞

- このプロジェクトは TypeScript、React、Express.js の優れた機能を活用しています
- アプリケーションの設計と実装にあたり、コミュニティの多くのリソースを参考にしました