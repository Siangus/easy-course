import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

/**
 * 视频下载服务
 */
class VideoDownloadService {
  private ytDlpPath: string;
  private tempDir: string;

  constructor() {
    // 获取当前文件的目录名（ES模块兼容写法）
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // 设置yt-dlp路径
    this.ytDlpPath = path.join(__dirname, '../../yt-dlp.exe');
    // 创建临时目录 - 使用backend/temp
    this.tempDir = path.join(__dirname, '../../temp');
    // 确保temp目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  /**
   * 清空临时目录
   */
  private cleanupTempDir(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          const filePath = path.join(this.tempDir, file);
          fs.unlinkSync(filePath);
        }
        console.log('临时目录已清空:', this.tempDir);
      }
    } catch (error) {
      console.error('清空临时目录失败:', error);
    }
  }

  /**
   * 下载B站视频文件
   * @param bvid B站视频ID
   * @returns 视频文件路径
   */
  async downloadVideo(bvid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 下载前清空临时目录
      this.cleanupTempDir();
      
      const url = `https://www.bilibili.com/video/${bvid}`;
      const outputPath = path.join(this.tempDir, `${bvid}_video.%(ext)s`);
      
      // 构建yt-dlp命令 - 直接下载视频文件，不转换格式
      const command = `${this.ytDlpPath} "${url}" ` +
        `--output "${outputPath}" ` +
        `--no-playlist ` +
        `--quiet`;

      console.log('执行下载命令:', command);

      // 执行命令
      const child = exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('下载失败:', error.message);
          reject(new Error(`下载失败: ${error.message}`));
          return;
        }

        if (stderr) {
          console.error('下载错误信息:', stderr);
        }

        console.log('下载成功:', stdout);
        
        // 查找生成的视频文件
        fs.readdir(this.tempDir, (err, files) => {
          if (err) {
            reject(new Error(`读取临时目录失败: ${err.message}`));
            return;
          }

          const videoFiles = files.filter(file => 
            file.startsWith(`${bvid}_video.`)
          );

          if (videoFiles.length === 0) {
            reject(new Error('未找到下载的视频文件'));
            return;
          }

          const videoFilePath = path.join(this.tempDir, videoFiles[0]);
          resolve(videoFilePath);
        });
      });

      // 监听子进程退出
      child.on('exit', (code) => {
        console.log(`yt-dlp进程退出，代码: ${code}`);
      });
    });
  }
  
  /**
   * 下载B站视频音频（兼容旧方法）
   * @param bvid B站视频ID
   * @returns 音频文件路径
   */
  async downloadAudio(bvid: string): Promise<string> {
    return this.downloadVideo(bvid);
  }

  /**
   * 删除临时文件
   * @param filePath 文件路径
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('删除临时文件失败:', err.message);
            reject(err);
          } else {
            console.log('临时文件已删除:', filePath);
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取视频信息
   * @param bvid B站视频ID
   * @returns 视频信息
   */
  async getVideoInfo(bvid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `https://www.bilibili.com/video/${bvid}`;
      const command = `${this.ytDlpPath} "${url}" --dump-json --no-playlist`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`获取视频信息失败: ${error.message}`));
          return;
        }

        if (stderr) {
          console.error('获取视频信息错误:', stderr);
        }

        try {
          const videoInfo = JSON.parse(stdout);
          resolve(videoInfo);
        } catch (err) {
          reject(new Error(`解析视频信息失败: ${(err as Error).message}`));
        }
      });
    });
  }
}

export default new VideoDownloadService();
