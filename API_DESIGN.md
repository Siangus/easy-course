# API设计文档

## 1. 概述

课程跳转系统API采用RESTful设计风格，使用JSON格式进行数据交换，基于Express框架实现。API支持JWT认证，保护敏感资源。

## 2. 基础信息

### 2.1 基本URL

```
http://localhost:3001/api
```

### 2.2 认证方式

- **JWT Token**：用于保护API资源，在请求头中通过`Authorization`字段传递
- **Session Token**：用于Web浏览器会话管理
- **临时访问Token**：用于课程跳转的一次性令牌

### 2.3 响应格式

**成功响应**：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

**错误响应**：

```json
{
  "success": false,
  "error": "错误信息",
  "message": "详细错误描述"
}
```

### 2.4 状态码

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 3. API端点

### 3.1 认证相关API

#### 3.1.1 用户注册

**描述**：创建新用户

- **URL**：`/auth/register`
- **方法**：`POST`
- **认证**：不需要
- **请求体**：

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

- **响应**：

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 3.1.2 用户登录

**描述**：用户登录获取令牌

- **URL**：`/auth/login`
- **方法**：`POST`
- **认证**：不需要
- **请求体**：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **响应**：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "jwt-token",
    "sessionToken": "session-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    },
    "expiresIn": 604800
  }
}
```

#### 3.1.3 用户登出

**描述**：用户登出，销毁会话

- **URL**：`/auth/logout`
- **方法**：`POST`
- **认证**：JWT Token
- **响应**：

```json
{
  "success": true,
  "message": "登出成功"
}
```

### 3.2 课程相关API

#### 3.2.1 获取课程列表

**描述**：获取当前用户的课程列表

- **URL**：`/courses`
- **方法**：`GET`
- **认证**：JWT Token
- **查询参数**：
  - `page`：页码，默认1
  - `limit`：每页数量，默认20

- **响应**：

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "courseName": "课程名称",
        "courseUrl": "https://example.com/course",
        "description": "课程描述",
        "loginUrl": "https://example.com/login",
        "lastAccessed": "2023-10-01T12:00:00Z",
        "accessCount": 5,
        "createdAt": "2023-09-01T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### 3.2.2 获取课程详情

**描述**：获取单个课程的详细信息

- **URL**：`/courses/:courseId`
- **方法**：`GET`
- **认证**：JWT Token
- **路径参数**：
  - `courseId`：课程UUID

- **响应**：

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "courseName": "课程名称",
    "courseUrl": "https://example.com/course",
    "description": "课程描述",
    "loginUrl": "https://example.com/login",
    "lastAccessed": "2023-10-01T12:00:00Z",
    "accessCount": 5,
    "createdAt": "2023-09-01T12:00:00Z"
  }
}
```

#### 3.2.3 创建课程

**描述**：创建新课程

- **URL**：`/courses`
- **方法**：`POST`
- **认证**：JWT Token
- **请求体**：

```json
{
  "courseName": "课程名称",
  "courseUrl": "https://example.com/course",
  "loginUrl": "https://example.com/login",
  "description": "课程描述",
  "username": "course-username",
  "password": "course-password"
}
```

- **响应**：

```json
{
  "success": true,
  "message": "课程创建成功",
  "data": {
    "id": "uuid",
    "courseName": "课程名称",
    "courseUrl": "https://example.com/course",
    "description": "课程描述",
    "createdAt": "2023-09-01T12:00:00Z"
  }
}
```

#### 3.2.4 更新课程

**描述**：更新现有课程

- **URL**：`/courses/:courseId`
- **方法**：`PUT`
- **认证**：JWT Token
- **路径参数**：
  - `courseId`：课程UUID

- **请求体**：

```json
{
  "courseName": "更新的课程名称",
  "loginUrl": "https://example.com/new-login",
  "description": "更新的课程描述",
  "username": "new-username",
  "password": "new-password"
}
```

- **响应**：

```json
{
  "success": true,
  "message": "课程更新成功",
  "data": {
    "id": "uuid",
    "courseName": "更新的课程名称",
    "courseUrl": "https://example.com/course",
    "description": "更新的课程描述",
    "loginUrl": "https://example.com/new-login",
    "createdAt": "2023-09-01T12:00:00Z"
  }
}
```

#### 3.2.5 删除课程

**描述**：软删除课程

- **URL**：`/courses/:courseId`
- **方法**：`DELETE`
- **认证**：JWT Token
- **路径参数**：
  - `courseId`：课程UUID

- **响应**：

```json
{
  "success": true,
  "message": "课程删除成功"
}
```

#### 3.2.6 启动课程

**描述**：生成课程跳转URL

- **URL**：`/courses/:courseId/launch`
- **方法**：`POST`
- **认证**：JWT Token
- **路径参数**：
  - `courseId`：课程UUID

- **请求体**：

```json
{
  "action": "direct" // 或 "embed"
}
```

- **响应**：

```json
{
  "success": true,
  "data": {
    "redirectUrl": "/proxy/course/uuid?token=temp-token",
    "embeddedUrl": "/proxy/embed/uuid?token=temp-token"
  }
}
```

### 3.3 代理相关API

#### 3.3.1 代理课程页面

**描述**：生成课程跳转页面

- **URL**：`/proxy/course/:courseId`
- **方法**：`GET`
- **认证**：临时访问Token
- **查询参数**：
  - `token`：临时访问Token

- **响应**：HTML页面

#### 3.3.2 代理视频流

**描述**：代理视频流请求

- **URL**：`/proxy/video/:courseId`
- **方法**：`GET`
- **认证**：临时访问Token
- **查询参数**：
  - `token`：临时访问Token
  - `videoUrl`：原始视频URL

- **响应**：视频流

#### 3.3.3 代理重定向

**描述**：处理课程跳转请求

- **URL**：`/proxy/redirect`
- **方法**：`POST`
- **认证**：JWT Token

- **请求体**：

```json
{
  "courseId": "uuid",
  "action": "direct"
}
```

- **响应**：

```json
{
  "success": true,
  "data": {
    "redirectUrl": "/proxy/course/uuid?token=temp-token",
    "embeddedUrl": "/proxy/embed/uuid?token=temp-token"
  }
}
```

## 4. API版本管理

- 当前版本：v1
- 版本控制方式：URL路径前缀（如 `/api/v1/`）
- 向后兼容策略：支持旧版本API至少6个月

## 5. 安全考虑

- 所有API使用HTTPS传输（生产环境）
- 密码使用bcrypt算法加盐存储
- 课程凭证使用AES-256-GCM加密
- JWT令牌有效期7天
- 临时访问令牌单次有效
- 防止SQL注入
- 防止XSS攻击
- 防止CSRF攻击
- 限流保护

## 6. 性能优化

- API响应缓存
- 数据库连接池
- 异步处理
- 分页查询
- 合理的索引设计
- 减少不必要的数据传输

## 7. 监控与日志

- API请求日志
- 错误日志
- 性能监控
- 安全审计日志

## 8. 测试

- 单元测试
- 集成测试
- API自动化测试
- 负载测试
- 安全测试

## 9. 部署

- 容器化部署
- 自动缩放
- 健康检查
- 蓝绿部署

## 10. 文档维护

- 自动生成API文档
- 定期更新
- 版本化管理
- 示例代码
