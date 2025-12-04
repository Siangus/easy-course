import { Request, Response } from 'express';
export declare const createCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCourses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCourseById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const launchCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=course.controller.d.ts.map