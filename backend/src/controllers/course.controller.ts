import { Request, Response } from 'express';
import pool from '../utils/database';
import { encryptCredentials } from '../services/encryption.service';

export const createCourse = async (req: Request, res: Response) => {
  try {
    console.log('收到创建课程请求');
    const authRequest = req as any;
    const userId = authRequest.user?.userId;

    console.log('用户ID:', userId);

    if (!userId) {
      console.error('用户ID不存在');
      return res.status(401).json({ error: '未授权访问' });
    }

    const { courseName, courseUrl, description, loginUrl, username, password } = req.body;

    console.log('课程信息:', { courseName, courseUrl, description, loginUrl, username });

    // 获取用户ID
    console.log('查询用户信息，uuid:', userId);
    const [users] = await pool.query(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    console.log('用户查询结果:', users);

    if (!Array.isArray(users) || users.length === 0) {
      console.error('用户不存在');
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;
    console.log('用户信息:', user);

    // 加密凭证
    console.log('加密凭证，用户名:', username);
    const credentials = JSON.stringify({ username, password });
    const encrypted = encryptCredentials(credentials);
    console.log('加密结果:', { content: encrypted.content.substring(0, 20) + '...', iv: encrypted.iv, tag: encrypted.tag });

    // 创建课程
    console.log('创建课程，用户ID:', user.id);
    const [result] = await pool.query(
      `INSERT INTO courses 
   (user_id, course_name, course_url, description, login_url, username, password, encrypted_credentials, iv, auth_tag) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        courseName,
        courseUrl,
        description || null,
        loginUrl || null,
        username || '',  // 添加 username 字段值
        password || '',  // 添加 password 字段值
        encrypted.content,
        encrypted.iv,
        encrypted.tag
      ]
    );

    console.log('创建课程结果:', result);

    const insertResult = result as any;
    console.log('插入结果:', insertResult);

    // 获取插入的课程ID
    const insertId = insertResult.insertId || insertResult[0]?.insertId;
    console.log('插入ID:', insertId);

    if (!insertId) {
      console.error('插入失败，没有返回插入ID');
      return res.status(500).json({ error: '创建课程失败' });
    }

    const [newCourse] = await pool.query(
      'SELECT uuid as id, course_name as courseName, course_url as courseUrl, description, created_at FROM courses WHERE id = ?',
      [insertResult.insertId]
    );

    console.log('查询新创建的课程结果:', newCourse);

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: (newCourse as any[])[0]
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({
      error: '服务器内部错误',
      message: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    console.log('收到获取课程请求');
    const authRequest = req as any;
    const userId = authRequest.user?.userId;

    console.log('用户ID:', userId);

    if (!userId) {
      console.error('用户ID不存在');
      return res.status(401).json({ error: '未授权访问' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // 获取用户ID
    console.log('查询用户信息，uuid:', userId);
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    console.log('用户查询结果:', users);

    if (!Array.isArray(users) || users.length === 0) {
      console.error('用户不存在');
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;
    console.log('用户信息:', user);

    // 获取课程总数
    console.log('查询课程总数，用户ID:', user.id);
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM courses WHERE user_id = ? AND is_active = TRUE',
      [user.id]
    );

    console.log('课程总数查询结果:', countResult);
    const total = (countResult as any[])[0].total;

    // 获取课程列表
    console.log('查询课程列表，用户ID:', user.id, 'limit:', limit, 'offset:', offset);
    const [courses] = await pool.query(
      `SELECT uuid as id, course_name as courseName, course_url as courseUrl, login_url as loginUrl, description, 
              last_accessed, access_count, created_at 
       FROM courses 
       WHERE user_id = ? AND is_active = TRUE 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [user.id, parseInt(limit.toString()), parseInt(offset.toString())]
    );

    console.log('课程列表查询结果:', courses);

    res.json({
      success: true,
      data: {
        courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取课程错误:', error);
    console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({
      error: '服务器内部错误',
      message: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { courseId } = req.params;

    // 获取用户ID
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;

    // 获取课程
    const [courses] = await pool.query(
      `SELECT uuid as id, course_name as courseName, course_url as courseUrl, login_url as loginUrl, description, 
              last_accessed, access_count, created_at 
       FROM courses 
       WHERE uuid = ? AND user_id = ? AND is_active = TRUE`,
      [courseId, user.id]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    res.json({
      success: true,
      data: courses[0]
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { courseId } = req.params;
    const { courseName, description, loginUrl, username, password } = req.body;

    // 获取用户ID
    const [users] = await pool.execute(
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

    const course = courses[0] as any;

    // 更新课程信息
    if (username && password) {
      // 如果提供了新的凭证，加密并更新
      const credentials = JSON.stringify({ username, password });
      const encrypted = encryptCredentials(credentials);

      await pool.query(
        `UPDATE courses 
         SET course_name = ?, description = ?, login_url = ?, encrypted_credentials = ?, iv = ?, auth_tag = ? 
         WHERE id = ?`,
        [courseName, description || null, loginUrl || null, encrypted.content, encrypted.iv, encrypted.tag, course.id]
      );
    } else {
      // 否则只更新基本信息
      await pool.query(
        `UPDATE courses 
         SET course_name = ?, description = ?, login_url = ? 
         WHERE id = ?`,
        [courseName, description || null, loginUrl || null, course.id]
      );
    }

    // 获取更新后的课程
    const [updatedCourse] = await pool.query(
      'SELECT uuid as id, course_name as courseName, course_url as courseUrl, login_url, description, created_at FROM courses WHERE id = ?',
      [course.id]
    );

    res.json({
      success: true,
      message: '课程更新成功',
      data: (updatedCourse as any[])[0]
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { courseId } = req.params;

    // 获取用户ID
    const [users] = await pool.execute(
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

    const course = courses[0] as any;

    // 软删除课程
    await pool.query(
      'UPDATE courses SET is_active = FALSE WHERE id = ?',
      [course.id]
    );

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const launchCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { courseId } = req.params;

    // 获取用户ID
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE uuid = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0] as any;

    // 获取课程和凭证
    const [courses] = await pool.query(
      `SELECT c.* 
       FROM courses c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.uuid = ? AND c.user_id = ?`,
      [courseId, user.id]
    );

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const course = courses[0] as any;

    // 更新访问记录
    await pool.query(
      'UPDATE courses SET last_accessed = NOW(), access_count = access_count + 1 WHERE id = ?',
      [course.id]
    );

    // 记录访问日志
    await pool.query(
      `INSERT INTO access_logs (user_id, course_id, access_type, success) 
       VALUES (?, ?, 'direct', TRUE)`,
      [user.id, course.id]
    );

    // 生成一次性访问令牌
    const crypto = await import('crypto');
    const accessToken = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      data: {
        redirectUrl: `/proxy/course/${courseId}?token=${accessToken}`,
        embeddedUrl: `/proxy/embed/${courseId}?token=${accessToken}`
      }
    });
  } catch (error) {
    console.error('启动课程错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
