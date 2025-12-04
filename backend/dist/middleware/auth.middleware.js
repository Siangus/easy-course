import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: '缺少认证令牌' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: '无效的认证令牌格式' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: '认证令牌已过期' });
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: '无效的认证令牌' });
        }
        return res.status(500).json({ error: '认证失败' });
    }
};
//# sourceMappingURL=auth.middleware.js.map