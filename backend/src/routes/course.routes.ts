import { Router } from 'express';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, launchCourse } from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createCourse);
router.get('/', authMiddleware, getCourses);
router.get('/:courseId', authMiddleware, getCourseById);
router.put('/:courseId', authMiddleware, updateCourse);
router.delete('/:courseId', authMiddleware, deleteCourse);
router.post('/:courseId/launch', authMiddleware, launchCourse);

export default router;
