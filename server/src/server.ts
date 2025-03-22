import express from 'express';
import cors from 'cors';
import path from 'path';
import fileRoutes from './routes/fileRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルート
app.use('/api', fileRoutes);

// エラーハンドラー
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

export default app;
