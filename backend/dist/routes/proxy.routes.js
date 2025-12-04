import { Router } from 'express';
import { proxyCoursePage, proxyVideo, proxyRedirect, proxyEmbed } from '../controllers/proxy.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();
router.post('/redirect', authMiddleware, proxyRedirect);
router.get('/course/:courseId', proxyCoursePage);
router.get('/video/:courseId', proxyVideo);
router.get('/embed/:courseId', proxyEmbed);
export default router;
//# sourceMappingURL=proxy.routes.js.map