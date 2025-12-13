import { Request, Response } from 'express';
import pool from '../utils/database';
import videoDownloadService from '../services/videoDownload.service';
import aiAnalysisService from '../services/aiAnalysis.service';
import { KnowledgePoint } from '../services/aiAnalysis.service';

/**
 * 视频分析控制器
 */

/**
 * 分析视频
 * @param req 请求对象
 * @param res 响应对象
 */
export const analyzeVideo = async (req: Request, res: Response) => {
  try {
    const authRequest = req as any;
    const userId = authRequest.user?.userId;
    const { bvid } = req.body;

    if (!userId) {
      return res.status(401).json({ error: '未授权访问' });
    }

    if (!bvid) {
      return res.status(400).json({ error: '缺少视频ID' });
    }

    // 获取用户ID
    const [users] = await pool.query(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;

    // 检查是否已有分析记录
    const [existingAnalyses] = await pool.query(
      'SELECT id, status, ai_analysis_result FROM video_analysis WHERE bvid = ? AND user_id = ?',
      [bvid, user.id]
    );

    let analysisId: number;

    if (Array.isArray(existingAnalyses) && existingAnalyses.length > 0) {
      const existingAnalysis = existingAnalyses[0] as any;
      analysisId = existingAnalysis.id;
      
      // 如果状态是completed，直接返回结果
      if (existingAnalysis.status === 'completed' && existingAnalysis.ai_analysis_result) {
        const knowledgePoints = await getKnowledgePoints(analysisId);
        return res.json({
          success: true,
          data: {
            analysisId: existingAnalysis.id,
            status: existingAnalysis.status,
            knowledgePoints
          }
        });
      }

      // 更新状态为processing
      await pool.query(
        'UPDATE video_analysis SET status = ? WHERE id = ?',
        ['processing', existingAnalysis.id]
      );
    } else {
      // 创建新的分析记录
      const [result] = await pool.query(
        'INSERT INTO video_analysis (bvid, user_id, status) VALUES (?, ?, ?)',
        [bvid, user.id, 'processing']
      );

      const insertResult = result as any;
      analysisId = insertResult.insertId;
    }

    // 异步执行分析任务
    processVideoAnalysis(analysisId, bvid, user.id).catch(error => {
      console.error('视频分析任务失败:', error);
      // 更新状态为failed
      pool.query(
        'UPDATE video_analysis SET status = ?, ai_analysis_result = ? WHERE id = ?',
        ['failed', JSON.stringify({ error: error.message }), analysisId]
      );
    });

    // 返回分析ID，供客户端轮询状态
    res.json({
      success: true,
      data: {
        analysisId,
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('分析视频错误:', error);
    res.status(500).json({ error: '服务器内部错误', message: (error as Error).message });
  }
};

/**
 * 获取分析结果
 * @param req 请求对象
 * @param res 响应对象
 */
export const getAnalysisResult = async (req: Request, res: Response) => {
  try {
    const authRequest = req as any;
    const userId = authRequest.user?.userId;
    const { analysisId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: '未授权访问' });
    }

    if (!analysisId) {
      return res.status(400).json({ error: '缺少分析ID' });
    }

    // 获取分析记录
    const [analyses] = await pool.query(
      'SELECT id, status, ai_analysis_result FROM video_analysis WHERE id = ?',
      [parseInt(analysisId)]
    );

    if (!Array.isArray(analyses) || analyses.length === 0) {
      return res.status(404).json({ error: '分析记录不存在' });
    }

    const analysis = analyses[0] as any;

    // 获取知识点
    const knowledgePoints = await getKnowledgePoints(analysis.id);

    res.json({
      success: true,
      data: {
        analysisId: analysis.id,
        status: analysis.status,
        knowledgePoints
      }
    });
  } catch (error) {
    console.error('获取分析结果错误:', error);
    res.status(500).json({ error: '服务器内部错误', message: (error as Error).message });
  }
};

/**
 * 处理视频分析任务
 * @param analysisId 分析ID
 * @param bvid 视频ID
 * @param userId 用户ID
 */
async function processVideoAnalysis(analysisId: number, bvid: string, userId: number) {
  try {
    // 1. 下载音频
    const audioFilePath = await videoDownloadService.downloadAudio(bvid);
    console.log('音频下载成功:', audioFilePath);

    // 2. AI分析
    const knowledgePoints = await aiAnalysisService.analyzeAudio(audioFilePath);
    console.log('AI分析成功:', knowledgePoints);

    // 3. 保存分析结果
    await pool.query(
      'UPDATE video_analysis SET status = ?, ai_analysis_result = ? WHERE id = ?',
      ['completed', JSON.stringify(knowledgePoints), analysisId]
    );

    // 4. 保存知识点
    await saveKnowledgePoints(analysisId, knowledgePoints);

    // 5. 清理临时文件
    await videoDownloadService.cleanupTempFile(audioFilePath);

    console.log('视频分析任务完成:', analysisId);
  } catch (error) {
    console.error('处理视频分析任务失败:', error);
    throw error;
  }
}

/**
 * 保存知识点
 * @param analysisId 分析ID
 * @param knowledgePoints 知识点列表
 */
async function saveKnowledgePoints(analysisId: number, knowledgePoints: KnowledgePoint[]) {
  // 删除旧的知识点
  await pool.query(
    'DELETE FROM knowledge_points WHERE analysis_id = ?',
    [analysisId]
  );

  // 插入新的知识点
  if (knowledgePoints.length > 0) {
    const values = knowledgePoints.map(kp => [
      analysisId,
      kp.start_time,
      kp.end_time,
      kp.content
    ]);

    await pool.query(
      'INSERT INTO knowledge_points (analysis_id, start_time, end_time, content) VALUES ?',
      [values]
    );
  }
}

/**
 * 获取知识点
 * @param analysisId 分析ID
 * @returns 知识点列表
 */
async function getKnowledgePoints(analysisId: number): Promise<KnowledgePoint[]> {
  const [knowledgePoints] = await pool.query(
    'SELECT start_time, end_time, content FROM knowledge_points WHERE analysis_id = ? ORDER BY start_time ASC',
    [analysisId]
  );

  if (Array.isArray(knowledgePoints)) {
    return knowledgePoints as KnowledgePoint[];
  }

  return [];
}

/**
 * 获取用户的视频分析列表
 * @param req 请求对象
 * @param res 响应对象
 */
export const getUserVideoAnalyses = async (req: Request, res: Response) => {
  try {
    const authRequest = req as any;
    const userId = authRequest.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: '未授权访问' });
    }

    // 获取用户ID
    const [users] = await pool.query(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;

    // 获取分析列表
    const [analyses] = await pool.query(
      'SELECT id, bvid, status, created_at, updated_at FROM video_analysis WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    res.json({
      success: true,
      data: {
        analyses: Array.isArray(analyses) ? analyses : []
      }
    });
  } catch (error) {
    console.error('获取视频分析列表错误:', error);
    res.status(500).json({ error: '服务器内部错误', message: (error as Error).message });
  }
};
