// server/src/controllers/FileSearchController.ts
import { Request, Response, NextFunction } from 'express';
import { ISearchRequest, ISearchResponse, IDirectoriesResponse } from '@shared/types/SearchTypes';
import FileSearchService from '../services/FileSearchService';
import { ALLOWED_DIRECTORIES, getAvailableDirectories } from '../config/allowedDirectories';

class FileSearchController {
  /**
   * 許可ディレクトリ一覧を取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  public static async getDirectories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('ディレクトリ一覧取得リクエスト受信');
      const startTime = Date.now();
      
      // 利用可能なディレクトリを非同期で取得
      const availableDirectories = await getAvailableDirectories();
      
      const duration = Date.now() - startTime;
      console.log(`ディレクトリ一覧レスポンス: ${duration}ms`);
      
      const response: IDirectoriesResponse = {
        directories: availableDirectories
      };
      res.json(response);
    } catch (error) {
      console.error('ディレクトリ取得エラー:', error);
      next(error);
    }
  }

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

      // 部分的な結果かどうかを判定（最大結果数に達した場合）
      const maxResults = options?.maxResults || 1000;
      const isPartialResult = results.length >= maxResults;

      // レスポンスの作成
      const response: ISearchResponse = {
        results,
        totalCount: results.length,
        searchTime,
        isPartialResult
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default FileSearchController;