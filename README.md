# 课程跳转系统

一个用于统一管理课程链接、自动登录第三方课程平台的系统。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- Tailwind CSS

### 后端
- Node.js + Express
- TypeScript
- MySQL 8.0

## 项目结构

```
course-jump-system/
├── backend/          # 后端代码
│   ├── src/          # 源代码
│   ├── .env          # 环境变量
│   └── package.json  # 依赖配置
├── database/         # 数据库相关
│   └── init.sql      # 初始化脚本
└── frontend/         # 前端代码
    ├── src/          # 源代码
    ├── dist/         # 构建输出
    └── package.json  # 依赖配置
```

## 快速开始

### 1. 准备环境

- Node.js 16+ 
- MySQL 8.0

### 2. 初始化数据库

1. 登录MySQL：
   ```bash
   mysql -u root -p
   ```

2. 执行初始化脚本：
   ```bash
   source G:/easy_course/course-jump-system/database/init.sql
   ```

### 3. 配置环境变量

#### 后端配置 (`backend/.env`)

```env
# 服务器配置
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=course_jump_system

# JWT配置
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 加密配置
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

### 4. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 5. 启动项目

#### 后端开发模式
```bash
cd backend
npm run dev
```

#### 前端开发模式
```bash
cd frontend
npm run dev
```

#### 构建生产版本

**前端**：
```bash
cd frontend
npm run build
```

**后端**：
```bash
cd backend
npm run build
npm start
```

## 访问地址

- 前端：http://localhost:3000
- 后端API：http://localhost:3001

## 主要功能

1. **课程管理**：创建、编辑、删除课程
2. **自动登录**：跳转到第三方平台时自动填充用户名和密码
3. **视频播放**：支持画中画播放
4. **访问统计**：记录课程访问次数和时间
5. **安全加密**：使用AES-256-GCM加密课程凭证

## 注意事项

1. 首次使用需要注册账号
2. 确保MySQL服务正在运行
3. 环境变量配置正确
4. 浏览器可能会阻止自动弹窗，需要手动允许
5. 某些网站可能有严格的反爬机制，自动填充可能失效

## 许可证

MIT
