import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { createCourse, updateCourse } from '../services/course';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course?: Course; // 如果提供，就是编辑模式
}

// 解析B站链接的函数
const parseBilibiliUrl = (url: string) => {
  const result = {
    bvid: '',
    aid: '',
    cid: '',
    episodeId: '',
    seasonId: ''
  };
  
  try {
    const urlObj = new URL(url);
    
    // 从路径中解析 bvid (主要从 /video/BVxxx 格式)
    const pathMatch = urlObj.pathname.match(/\/video\/(BV[a-zA-Z0-9]{10})/);
    if (pathMatch) {
      result.bvid = pathMatch[1];
    }
    
    // 从查询参数中解析 aid
    const aidMatch = urlObj.searchParams.get('aid');
    if (aidMatch) {
      result.aid = aidMatch;
    }
    
    // 如果是番剧/电影页面 (bangumi)
    const epMatch = urlObj.pathname.match(/\/bangumi\/play\/ep(\d+)/);
    const seasonMatch = urlObj.pathname.match(/\/bangumi\/play\/ss(\d+)/);
    
    if (epMatch) {
      result.episodeId = epMatch[1];
    }
    if (seasonMatch) {
      result.seasonId = seasonMatch[1];
    }
    
    // 从查询参数中解析 cid
    const cidMatch = urlObj.searchParams.get('cid');
    if (cidMatch) {
      result.cid = cidMatch;
    }
    
    console.log('解析B站链接结果:', result);
    
  } catch (error) {
    console.error('解析B站链接失败:', error);
  }
  
  return result;
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  course 
}) => {
  const [formData, setFormData] = useState({
    courseName: '',
    courseUrl: '',
    description: '',
    loginUrl: '',
    username: '',
    password: '',
    // Bilibili视频相关字段
    bvid: '',
    aid: '',
    cid: '',
    episodeId: '',
    seasonId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isBilibiliUrl, setIsBilibiliUrl] = useState(false);

  // 编辑模式下，填充表单数据
  useEffect(() => {
    if (course) {
      setFormData({
        courseName: course.courseName,
        courseUrl: course.courseUrl,
        description: course.description || '',
        loginUrl: course.loginUrl || '',
        username: '',
        password: '',
        // Bilibili视频相关字段
        bvid: course.bvid || '',
        aid: course.aid || '',
        cid: course.cid || '',
        episodeId: course.episodeId || '',
        seasonId: course.seasonId || ''
      });
      setIsBilibiliUrl(course.courseUrl.includes('bilibili.com') || !!course.bvid || !!course.aid);
    } else {
      setFormData({
        courseName: '',
        courseUrl: '',
        description: '',
        loginUrl: '',
        username: '',
        password: '',
        // Bilibili视频相关字段
        bvid: '',
        aid: '',
        cid: '',
        episodeId: '',
        seasonId: ''
      });
      setIsBilibiliUrl(false);
    }
    setError(null);
  }, [course]);

  if (!isOpen) return null;

  const handleCourseUrlChange = (url: string) => {
    const isBilibili = url.includes('bilibili.com');
    setIsBilibiliUrl(isBilibili);
    
    if (isBilibili) {
      // 如果是B站链接，自动解析
      const parsed = parseBilibiliUrl(url);
      setFormData(prev => ({
        ...prev,
        courseUrl: url,
        bvid: parsed.bvid || prev.bvid,
        aid: parsed.aid || prev.aid,
        cid: parsed.cid || prev.cid,
        episodeId: parsed.episodeId || prev.episodeId,
        seasonId: parsed.seasonId || prev.seasonId
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        courseUrl: url,
        // 如果不是B站链接，清空B站相关字段
        bvid: '',
        aid: '',
        cid: '',
        episodeId: '',
        seasonId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // 准备提交的数据
      const submitData: any = {
        courseName: formData.courseName,
        courseUrl: formData.courseUrl,
        description: formData.description,
        loginUrl: formData.loginUrl || formData.courseUrl, // 如果没填登录URL，默认用课程URL
        username: formData.username,
        password: formData.password
      };
      
      // 如果有B站相关字段，也一起提交
      if (formData.bvid) submitData.bvid = formData.bvid;
      if (formData.aid) submitData.aid = formData.aid;
      if (formData.cid) submitData.cid = formData.cid;
      if (formData.episodeId) submitData.episodeId = formData.episodeId;
      if (formData.seasonId) submitData.seasonId = formData.seasonId;
      
      if (course) {
        await updateCourse(course.id, submitData);
      } else {
        await createCourse(submitData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {course ? '编辑课程' : '添加课程'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
              课程名称 *
            </label>
            <input
              type="text"
              id="courseName"
              placeholder="输入课程名称"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.courseName}
              onChange={(e) => setFormData({...formData, courseName: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="courseUrl" className="block text-sm font-medium text-gray-700 mb-1">
              课程URL *
              {isBilibiliUrl && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  B站视频（将支持画中画播放）
                </span>
              )}
            </label>
            <input
              type="url"
              id="courseUrl"
              placeholder="输入课程URL，例如：https://www.bilibili.com/video/BV18t2SBgEn4/"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.courseUrl}
              onChange={(e) => handleCourseUrlChange(e.target.value)}
              required
            />
            {isBilibiliUrl && formData.bvid && (
              <p className="mt-1 text-sm text-green-600">
                ✅ 已自动识别BVID: {formData.bvid}
                {formData.episodeId && ` | Episode ID: ${formData.episodeId}`}
              </p>
            )}
          </div>
          
          {/* Bilibili视频相关字段 - 现在会自动填充，但用户仍可手动修改 */}
          {isBilibiliUrl && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Bilibili视频设置</h3>
              <p className="text-xs text-blue-600 mb-3">
                以下字段已从链接自动解析，如需修改可手动编辑
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bvid" className="block text-xs font-medium text-blue-700 mb-1">
                    BVID *
                  </label>
                  <input
                    type="text"
                    id="bvid"
                    placeholder="例如：BV1B7411m7LV"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.bvid}
                    onChange={(e) => setFormData({...formData, bvid: e.target.value})}
                    required={!formData.aid && !formData.episodeId}
                  />
                </div>
                
                <div>
                  <label htmlFor="aid" className="block text-xs font-medium text-blue-700 mb-1">
                    AID（与BVID二选一）
                  </label>
                  <input
                    type="text"
                    id="aid"
                    placeholder="例如：12345678"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.aid}
                    onChange={(e) => setFormData({...formData, aid: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="cid" className="block text-xs font-medium text-blue-700 mb-1">
                    CID（视频分P ID，可选）
                  </label>
                  <input
                    type="text"
                    id="cid"
                    placeholder="例如：123456789"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.cid}
                    onChange={(e) => setFormData({...formData, cid: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="episodeId" className="block text-xs font-medium text-blue-700 mb-1">
                    Episode ID（番剧集数ID，可选）
                  </label>
                  <input
                    type="text"
                    id="episodeId"
                    placeholder="例如：123456"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.episodeId}
                    onChange={(e) => setFormData({...formData, episodeId: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="seasonId" className="block text-xs font-medium text-blue-700 mb-1">
                    Season ID（番剧系列ID，可选）
                  </label>
                  <input
                    type="text"
                    id="seasonId"
                    placeholder="例如：12345"
                    className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.seasonId}
                    onChange={(e) => setFormData({...formData, seasonId: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-100 rounded">
                <p className="text-xs text-blue-800">
                  💡 填写B站视频后，课程卡片将显示"画中画播放"按钮，
                  可直接在页面内嵌入播放B站视频
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="loginUrl" className="block text-sm font-medium text-gray-700 mb-1">
              登录URL（可选，默认与课程URL相同）
            </label>
            <input
              type="url"
              id="loginUrl"
              placeholder="输入登录页面URL"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.loginUrl}
              onChange={(e) => setFormData({...formData, loginUrl: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              课程描述（可选）
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="输入课程描述"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              登录用户名（如果需要登录）
            </label>
            <input
              type="text"
              id="username"
              placeholder="输入课程网站的登录用户名"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              登录密码（如果需要登录）
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="输入课程网站的登录密码"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '处理中...' : course ? '更新课程' : '添加课程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;