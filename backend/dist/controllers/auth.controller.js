import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../utils/database';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
export const register = async (req, res) => {
    try {
        const { email, username, password, confirmPassword } = req.body;
        // 验证
        if (password !== confirmPassword) {
            return res.status(400).json({ error: '密码不匹配' });
        }
        // 检查用户是否存在
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return res.status(409).json({ error: '邮箱或用户名已存在' });
        }
        // 生成盐和哈希
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        // 创建用户
        const [result] = await pool.query('INSERT INTO users (email, username, password_hash, salt) VALUES (?, ?, ?, ?)', [email, username, passwordHash, salt]);
        const insertResult = result;
        const [newUser] = await pool.query('SELECT uuid, email, username, created_at FROM users WHERE id = ?', [insertResult.insertId]);
        res.status(201).json({
            success: true,
            message: '注册成功',
            data: newUser[0]
        });
    }
    catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 查找用户
        const [users] = await pool.query('SELECT id, uuid, email, username, password_hash FROM users WHERE email = ?', [email]);
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }
        const user = users[0];
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '邮箱或密码错误' });
        }
        // 生成JWT令牌
        const token = jwt.sign({ userId: user.uuid, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // 创建会话记录
        const crypto = await import('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后
        await pool.query('INSERT INTO sessions (user_id, session_token, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)', [user.id, sessionToken, expiresAt, req.headers['user-agent'] || '', req.ip || '']);
        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                sessionToken,
                user: {
                    id: user.uuid,
                    email: user.email,
                    username: user.username
                },
                expiresIn: 7 * 24 * 60 * 60 // 秒
            }
        });
    }
    catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
export const logout = async (req, res) => {
    try {
        // 在实际项目中，应该根据请求中的token或sessionToken来销毁会话
        res.json({
            success: true,
            message: '退出成功'
        });
    }
    catch (error) {
        console.error('退出错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
//# sourceMappingURL=auth.controller.js.map