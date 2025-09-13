// server/src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';

/**
 * リクエストログミドルウェア
 * すべてのリクエストの詳細をログ出力する
 */
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  console.log('=== リクエスト詳細 ===');
  console.log('時刻:', new Date().toISOString());
  console.log('メソッド:', req.method);
  console.log('パス:', req.path);
  console.log('URL:', req.url);
  console.log('クライアントIP:', req.ip);
  console.log('X-Forwarded-For:', req.get('X-Forwarded-For'));
  console.log('User-Agent:', req.get('User-Agent'));
  console.log('Origin:', req.get('Origin'));
  console.log('Host:', req.get('Host'));
  console.log('Referer:', req.get('Referer'));
  console.log('Content-Type:', req.get('Content-Type'));
  
  // レスポンス完了時のログ
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('レスポンス:', res.statusCode, `(${duration}ms)`);
    console.log('=====================');
  });
  
  next();
};

export default requestLogger;