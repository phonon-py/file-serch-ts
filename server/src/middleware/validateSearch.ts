// server/src/middleware/validateSearch.ts
import { Request, Response, NextFunction } from 'express';
import { ISearchRequest } from '@shared/types/SearchTypes';
import { sanitizePath } from '../utils/fileSystemUtils';

/**
 * 検索リクエストのバリデーションミドルウェア
 * リクエストボディの検証と不正な入力の防止を行う
 */
const validateSearch = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { startPath, pattern, options } = req.body as Partial<ISearchRequest>;
    
    // 必須フィールドの確認
    if (!startPath || typeof startPath !== 'string') {
      res.status(400).json({ error: '検索パスは必須で、文字列である必要があります' });
      return;
    }

    if (!pattern || typeof pattern !== 'string') {
      res.status(400).json({ error: '検索パターンは必須で、文字列である必要があります' });
      return;
    }

    // パスの長さ制限
    if (startPath.length > 500) {
      res.status(400).json({ error: '検索パスが長すぎます' });
      return;
    }

    // パターンの長さ制限
    if (pattern.length > 100) {
      res.status(400).json({ error: '検索パターンが長すぎます' });
      return;
    }

    // オプションのバリデーション
    if (options) {
      const { recursive, includeHidden, maxResults, timeout } = options;

      // 型チェック
      if (recursive !== undefined && typeof recursive !== 'boolean') {
        res.status(400).json({ error: 'recursive オプションは真偽値である必要があります' });
        return;
      }

      if (includeHidden !== undefined && typeof includeHidden !== 'boolean') {
        res.status(400).json({ error: 'includeHidden オプションは真偽値である必要があります' });
        return;
      }

      // 数値の範囲チェック
      if (maxResults !== undefined) {
        if (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 5000) {
          res.status(400).json({ error: 'maxResults オプションは1から5000の間の数値である必要があります' });
          return;
        }
      }

      if (timeout !== undefined) {
        if (typeof timeout !== 'number' || timeout < 1000 || timeout > 60000) {
          res.status(400).json({ error: 'timeout オプションは1000から60000の間の数値である必要があります' });
          return;
        }
      }
    }

    // パスのサニタイズ
    req.body.startPath = sanitizePath(startPath);

    // 次のミドルウェアへ
    next();
  } catch (error) {
    next(error);
  }
};

export default validateSearch;