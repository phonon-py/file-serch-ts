import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { performStartupChecks } from './utils/startupChecks';

// 環境変数を読み込み
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ミドルウェア
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    /^http:\/\/100\.68\.\d+\.\d+:3000$/, // Tailscaleネットワーク
    /^http:\/\/100\.68\.\d+\.\d+$/, // Tailscaleネットワーク（ポートなし）
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 開発環境でのみリクエストログを有効化
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// ルート
app.use('/api', fileRoutes);

// エラーハンドラー
app.use(errorHandler);

// サーバー起動（起動時チェック後）
async function startServer() {
  try {
    // 起動時チェック実行
    const { ALLOWED_DIRECTORIES } = await import('./config/allowedDirectories');
    await performStartupChecks(ALLOWED_DIRECTORIES);
    
    // サーバー起動
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`サーバーが起動しました: http://0.0.0.0:${PORT}`);
      console.log(`ローカルアクセス: http://localhost:${PORT}`);
      console.log(`Tailscaleアクセス: http://100.68.134.75:${PORT}`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

startServer();

export default app;
