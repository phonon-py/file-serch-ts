// server/src/controllers/FileSearchController.ts
import { Request, Response, NextFunction } from 'express';
import { ISearchRequest, ISearchResponse } from '@shared/types/SearchTypes';
import FileSearchService from '../services/FileSearchService';

class FileSearchController {
  /**
   * ファイルを検索する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  public static async searchFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startPath, pattern, options } = req.body as ISearchRequest;
      
      // バリデーション
      if (!startPath || !pattern) {
        res.status(400).json({ 
          error: '検索パスと検索パターンの両方が必要です' 
        });
        return;
      }

      // 検索サービスを呼び出し
      const startTime = Date.now();
      const results = await FileSearchService.searchFiles(startPath, pattern, options);
      const searchTime = (Date.now() - startTime) / 1000; // 秒単位

      // レスポンスの作成
      const response: ISearchResponse = {
        results,
        totalCount: results.length,
        searchTime
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default FileSearchController;