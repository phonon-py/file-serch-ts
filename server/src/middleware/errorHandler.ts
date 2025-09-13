// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface IErrorWithStatus extends Error {
  status?: number;
}

/**
 * エラーハンドリングミドルウェア
 * アプリケーションで発生した例外を適切に処理し、クライアントに応答する
 */
const errorHandler = (
  err: IErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 詳細なログ出力
  console.error('=== エラー詳細 ===');
  console.error('時刻:', new Date().toISOString());
  console.error('パス:', req.path);
  console.error('メソッド:', req.method);
  console.error('クライアントIP:', req.ip);
  console.error('User-Agent:', req.get('User-Agent'));
  console.error('Origin:', req.get('Origin'));
  console.error('エラー:', err);
  console.error('スタックトレース:', err.stack);
  console.error('==================');

  const statusCode = err.status || 500;
  const message = statusCode === 500 
    ? 'サーバー内部エラーが発生しました' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    // 開発環境でのみ詳細情報を含める
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  });
};

export default errorHandler;