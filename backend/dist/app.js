import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import proxyRoutes from './routes/proxy.routes';
import videoAnalysisRoutes from './routes/videoAnalysis.routes';
// 加载环境变量
dotenv.config();
const app = express();
// 中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:*"]
        }
    }
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP限制100个请求
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);
// 路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/video-analysis', videoAnalysisRoutes);
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('错误详情:', err);
    console.error('请求路径:', req.path);
    console.error('请求方法:', req.method);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ error: '服务器内部错误', message: err.message });
});
// 初始化数据库
import { initDatabase } from './utils/dbInit';
initDatabase().catch(error => {
    console.error('数据库初始化失败:', error);
});
// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map