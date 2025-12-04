import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../utils/database';
import { decryptCredentials } from '../services/encryption.service';

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
      return res.status(404).send('课程不存在');
    }

    const course = courses[0] as any;

    // 解密凭证
    const decrypted = decryptCredentials(
      course.encrypted_credentials,
      course.iv,
      course.auth_tag
    );
    const credentials = JSON.parse(decrypted);

    // 直接跳转到B站登录页面，不检测登录状态
    // 因为B站视频页面允许未登录观看，导致登录检测不准确
    const loginUrl = course.login_url || 'https://passport.bilibili.com/login';
    
    // 构造登录后要跳转的URL
    const redirectUrl = course.course_url;
    
    // 使用简单的HTML，直接将登录信息显示给用户
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>跳转到B站登录页面</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            margin: 15px 0;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background-color: #00a1d6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid #00a1d6;
        }
        .btn:hover {
            background-color: #0094c6;
            border-color: #0094c6;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .info {
            background-color: #f8f9fa;
            padding: 20px;
            margin-top: 20px;
            border-radius: 4px;
            text-align: left;
            border: 1px solid #e9ecef;
        }
        .info h3 {
            margin-top: 0;
            color: #333;
        }
        .info p {
            margin: 10px 0;
            word-break: break-all;
        }
        .highlight {
            background-color: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .copy-btn {
            padding: 5px 10px;
            background-color: #e9ecef;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
        }
        .copy-btn:hover {
            background-color: #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>准备跳转到B站登录页面</h1>
        <p>请按照以下步骤登录B站：</p>
        
        <div style="text-align: left; margin: 20px 0;">
            <ol>
                <li>点击下方按钮跳转到B站登录页面</li>
                <li>或者复制下方的登录URL到浏览器地址栏</li>
                <li>使用提供的用户名和密码登录</li>
                <li>完成人机验证后即可开始学习</li>
            </ol>
        </div>
        
        <!-- 直接使用a标签，确保点击一定有效 -->
        <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" class="btn">
            跳转到B站登录页面
        </a>
        
        <div class="info">
            <h3>登录信息</h3>
            <p><strong>登录URL:</strong> 
                <span>${loginUrl}</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${loginUrl}')">复制</button>
            </p>
            <p><strong>用户名:</strong> 
                <span>${credentials.username}</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${credentials.username}')">复制</button>
            </p>
            <p><strong>密码:</strong> 
                <span>${credentials.password}</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${credentials.password}')">复制</button>
            </p>
        </div>
        
        <div class="highlight">
            <strong>提示：</strong>如果点击按钮没有反应，可能是浏览器阻止了弹窗，请手动复制上方的登录URL到新标签页打开。
        </div>
    </div>
    
    <script>
        // 配置信息
        const config = {
            loginUrl: '${loginUrl}',
            username: '${credentials.username}',
            password: '${credentials.password}'
        };
        
        console.log('B站登录页面准备完成', config);
        
        // 获取跳转按钮
        const jumpBtn = document.querySelector('a.btn');
        
        if (jumpBtn) {
            // 替换默认的href跳转方式
            jumpBtn.addEventListener('click', function(e) {
                // 阻止默认跳转
                e.preventDefault();
                
                console.log('开始处理跳转请求');
                
                // 打开B站登录页面
                const loginWindow = window.open(config.loginUrl, '_blank');
                
                if (loginWindow) {
                    console.log('登录窗口已打开，准备填充表单');
                    
                    // 尝试填充表单
                    const fillForm = () => {
                        try {
                            console.log('尝试填充表单...');
                            
                            // 检查是否可以访问iframe内容
                            if (loginWindow.document) {
                                // 查找用户名和密码输入框
                                const usernameInputs = loginWindow.document.querySelectorAll(
                                    'input.bili-uname, input#login-username, input[name="username"], input[name="email"], input[type="email"]'
                                );
                                const passwordInputs = loginWindow.document.querySelectorAll(
                                    'input.bili-pwd, input#login-passwd, input[name="password"], input[type="password"]'
                                );
                                
                                console.log('找到用户名输入框:', usernameInputs.length);
                                console.log('找到密码输入框:', passwordInputs.length);
                                
                                // 填充用户名
                                usernameInputs.forEach(input => {
                                    input.value = config.username;
                                    // 触发input事件，确保表单验证通过
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                });
                                
                                // 填充密码
                                passwordInputs.forEach(input => {
                                    input.value = config.password;
                                    // 触发input事件，确保表单验证通过
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                });
                                
                                console.log('表单填充完成');
                                return true;
                            } else {
                                console.log('无法访问登录窗口文档');
                                return false;
                            }
                        } catch (error) {
                            console.log('填充表单出错:', error.message);
                            return false;
                        }
                    };
                    
                    // 尝试多次填充，直到成功或超时
                    let attempts = 0;
                    const maxAttempts = 10;
                    const interval = setInterval(() => {
                        attempts++;
                        console.log('填充尝试:', attempts);
                        
                        const success = fillForm();
                        
                        if (success || attempts >= maxAttempts) {
                            clearInterval(interval);
                            console.log('填充过程结束，成功:', success);
                        }
                    }, 1000);
                    
                    // 窗口加载完成后尝试填充
                    loginWindow.addEventListener('load', function() {
                        console.log('登录窗口加载完成');
                        fillForm();
                    });
                } else {
                    console.log('无法打开登录窗口，可能被浏览器阻止');
                    // 显示手动填充提示
                    alert('无法打开登录窗口，请手动复制用户名和密码进行登录');
                }
            });
        }
        
        // 复制功能
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.previousElementSibling.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    // 显示复制成功提示
                    const originalText = this.textContent;
                    this.textContent = '已复制';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1000);
                });
            });
        });
    </script>
</body>
</html>
    `
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('代理页面错误:', error);
    res.status(500).send('代理请求失败');
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

    // 解密凭证
    const decrypted = decryptCredentials(
      course.encrypted_credentials,
      course.iv,
      course.auth_tag
    );
    const credentials = JSON.parse(decrypted);

    // 设置视频流代理
    const response = await axios.get(videoUrl as string, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cookie': await getAuthCookies(course, credentials) // 获取认证cookie
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

// 辅助函数：获取认证cookie
async function getAuthCookies(course: any, credentials: any): Promise<string> {
  // 这里应该实现获取目标网站认证cookie的逻辑
  // 这可能涉及模拟登录、会话管理等
  // 返回格式：'session_id=abc123; token=xyz789'
  return '';
}

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
      return res.status(404).send('课程不存在');
    }

    const course = courses[0] as any;

    // 解密凭证
    const decrypted = decryptCredentials(
      course.encrypted_credentials,
      course.iv,
      course.auth_tag
    );
    const credentials = JSON.parse(decrypted);

    // 获取课程页面
    const response = await axios.get(course.login_url || course.course_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // 自动填充登录表单
    $('input[name="username"], input[name="email"], input[type="email"]').each((_, elem) => {
      $(elem).val(credentials.username);
    });

    $('input[name="password"], input[type="password"]').each((_, elem) => {
      $(elem).val(credentials.password);
    });

    // 自动提交表单（如果有）
    const forms = $('form');
    if (forms.length > 0) {
      forms.each((_, form) => {
        const action = $(form).attr('action') || course.course_url;
        const method = $(form).attr('method') || 'post';
        
        // 修改表单，使其自动提交
        $(form)
          .attr('action', `/api/proxy/submit/${courseId}`)
          .attr('method', 'post')
          .append(`
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                document.querySelector('form').submit();
              });
            </script>
          `);
      });
    }

    // 设置基础URL，确保相对路径正确
    $('head').append(`
      <base href="${course.course_url}">
      <style>
        body { margin: 0; padding: 0; }
      </style>
    `);

    res.set('Content-Type', 'text/html');
    res.send($.html());
  } catch (error) {
    console.error('嵌入式代理页面错误:', error);
    res.status(500).send('代理请求失败');
  }
};
