// server/src/routes/fileRoutes.ts
import { Router } from 'express';
import FileSearchController from '../controllers/FileSearchController';
import validateSearch from '../middleware/validateSearch';

const router = Router();

/**
 * @route POST /api/search
 * @desc ファイル検索API
 * @access Public
 */
router.post('/search', validateSearch, FileSearchController.searchFiles);

export default router;