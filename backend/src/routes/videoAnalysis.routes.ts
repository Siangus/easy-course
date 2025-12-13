import { Router } from 'express';
import { analyzeVideo, getAnalysisResult, getUserVideoAnalyses } from '../controllers/videoAnalysis.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 分析视频
router.post('/', authMiddleware, analyzeVideo);

// 获取分析结果
router.get('/:analysisId', authMiddleware, getAnalysisResult);

// 获取用户的视频分析列表
router.get('/', authMiddleware, getUserVideoAnalyses);

export default router;
