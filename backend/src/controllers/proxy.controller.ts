import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../utils/database';

export const proxyCoursePage = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { token } = req.query;

    // 验证令牌（实际项目中应该验证临时令牌）
    // const isValidToken = await validateToken(token as string);

    // 获取课程信息
    const [courses] = await pool.query(
      `SELECT c.* 
       FROM courses c 
       WHERE c.uuid = ?`,
      [courseId]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const course = courses[0] as any;

    // 获取凭证
    const credentials = {
      username: course.username,
      password: course.password
    };

    // 直接跳转到B站登录页面，不检测登录状态
    // 因为B站视频页面允许未登录观看，导致登录检测不准确
    const loginUrl = course.login_url || 'https://passport.bilibili.com/login';
    
    // 构造登录后要跳转的URL
    const redirectUrl = course.course_url;
    
    // 返回JSON响应，符合项目RESTful API设计风格
    return res.json({
      success: true,
      data: {
        loginUrl,
        redirectUrl,
        credentials: {
          username: credentials.username,
          password: credentials.password
        },
        courseTitle: course.title,
        courseUrl: course.course_url
      },
      message: '获取登录信息成功'
    });
  } catch (error) {
    console.error('代理页面错误:', error);
    res.status(500).json({ error: '代理请求失败' });
  }
};

export const proxyVideo = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { videoUrl } = req.query;

    if (!videoUrl) {
      return res.status(400).json({ error: '缺少视频URL' });
    }

    // 获取课程凭证
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE uuid = ?',
      [courseId]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const course = courses[0] as any;

    // 获取凭证
    const credentials = {
      username: course.username,
      password: course.password
    };

    // 设置视频流代理
        const response = await axios.get(videoUrl as string, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

    // 设置响应头
    res.set({
      'Content-Type': response.headers['content-type'] || 'video/mp4',
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes'
    });

    // 管道传输视频流
    response.data.pipe(res);
  } catch (error) {
    console.error('视频代理错误:', error);
    res.status(500).json({ error: '视频加载失败' });
  }
};



export const proxyRedirect = async (req: Request, res: Response) => {
  try {
    const { courseId, action } = req.body;
    const userId = (req as any).user?.userId;

    // 获取用户ID
    const [users] = await pool.query(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const user = users[0] as any;

    // 检查课程是否存在并属于该用户
    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE uuid = ? AND user_id = ?',
      [courseId, user.id]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在或无权访问' });
    }

    // 生成一次性访问令牌
    const crypto = await import('crypto');
    const accessToken = crypto.randomBytes(32).toString('hex');

    // 生成完整的代理页面URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      success: true,
      data: {
        redirectUrl: `${baseUrl}/api/proxy/course/${courseId}?token=${accessToken}`,
        embeddedUrl: `${baseUrl}/api/proxy/embed/${courseId}?token=${accessToken}`
      }
    });
  } catch (error) {
    console.error('代理重定向错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const proxyEmbed = async (req: Request, res: Response) => {
  // 实现嵌入式课程页面的代理逻辑
  try {
    const { courseId } = req.params;
    const { token } = req.query;

    // 验证令牌（实际项目中应该验证临时令牌）
    // const isValidToken = await validateToken(token as string);

    // 获取课程信息
    const [courses] = await pool.query(
      `SELECT c.* 
       FROM courses c 
       WHERE c.uuid = ?`,
      [courseId]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const course = courses[0] as any;

    // 获取凭证
    const credentials = {
      username: course.username,
      password: course.password
    };

    // 返回JSON响应，符合项目RESTful API设计风格
    return res.json({
      success: true,
      data: {
        courseId: course.uuid,
        courseTitle: course.title,
        courseUrl: course.course_url,
        loginUrl: course.login_url || course.course_url,
        credentials: {
          username: credentials.username,
          password: credentials.password
        }
      },
      message: '获取嵌入式课程信息成功'
    });
  } catch (error) {
    console.error('嵌入式代理页面错误:', error);
    res.status(500).json({ error: '代理请求失败' });
  }
};
