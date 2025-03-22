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
  console.error('エラーが発生しました:', err);

  const statusCode = err.status || 500;
  const message = statusCode === 500 
    ? 'サーバー内部エラーが発生しました' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

export default errorHandler;