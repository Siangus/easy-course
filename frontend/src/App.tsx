import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './page/LoginRegister';
import CourseDashboard from './page/CourseDashboard';
import BilibiliPlayerPage from './page/BilibiliPlayerPage'; // 新增导入
import { isAuthenticated } from './services/auth';

// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 登录注册页 */}
          <Route path="/" element={<LoginRegister />} />
          
          {/* 课程仪表板页 */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <CourseDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* B站视频播放页面 */}
          <Route 
            path="/bilibili-player/:bvid" 
            element={
              <ProtectedRoute>
                <BilibiliPlayerPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 重定向所有其他路由到登录页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;