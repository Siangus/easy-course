import pool from './database';

/**
 * 初始化数据库表结构
 */
export const initDatabase = async () => {
  try {
    // 创建视频分析表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS video_analysis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bvid VARCHAR(20) NOT NULL,
        course_id VARCHAR(36) NULL,
        user_id INT NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        ai_analysis_result TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_bvid_user (bvid, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建知识点表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS knowledge_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        analysis_id INT NOT NULL,
        start_time FLOAT NOT NULL,
        end_time FLOAT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (analysis_id) REFERENCES video_analysis(id) ON DELETE CASCADE,
        INDEX idx_analysis_id (analysis_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('数据库表初始化失败:', error);
    throw error;
  }
};

// 如果直接运行此文件，则执行初始化
if (import.meta.url.startsWith('file:')) {
  const modulePath = new URL(import.meta.url).pathname;
  const argvPath = process.argv[1];
  
  // 检查当前文件是否直接运行
  if (modulePath === argvPath || modulePath.endsWith(argvPath)) {
    initDatabase().then(() => {
      console.log('数据库初始化成功');
      process.exit(0);
    }).catch((error) => {
      console.error('数据库初始化失败:', error);
      process.exit(1);
    });
  }
}
