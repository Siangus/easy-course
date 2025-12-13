# 项目更改记录

## [1.0.3] - 2025-12-13

### 主要更改

#### 1. 前端登录注册UI优化
- **LoginRegister.tsx**：
  - 优化了登录注册卡片样式，增加了圆角、阴影和悬停效果
  - 改进了表单布局，使用了更合理的间距和排版
  - 调整了输入框样式，增加了聚焦效果和过渡动画
  - 优化了按钮样式，增加了悬停缩放效果
  - 修改了背景色，使用了渐变效果，提升视觉体验
- **index.css**：
  - 移除了可能与新设计冲突的默认按钮样式
  - 调整了body样式，确保页面布局正确

## [1.0.2] - 2025-12-13

### 主要更改

#### 1. API设计文档更新
- **API_DESIGN.md**：
  - 修改了注册响应格式，将`userId`字段改为`id`
  - 简化了错误响应格式，移除了`message`字段
  - 更新了代理课程页面API，改为返回JSON响应而非HTML页面
  - 更新了代理视频流API，移除了`token`查询参数
  - 修改了API版本管理方式，不再使用`/api/v1/`前缀
  - 调整了代理重定向API的描述，使其与实际实现一致

## [1.0.1] - 2025-12-13

### 主要更改

#### 1. 移除加密功能
- 移除了AES-256-GCM加密服务（`encryption.service.ts`）
- 课程凭证不再进行加密存储
- 简化了后端服务架构

#### 2. 数据库设计更新
- 修改了`courses`表结构：
  - 移除了加密相关字段：`encrypted_credentials`、`iv`、`auth_tag`
  - 添加了明文凭证字段：`username`和`password`
- 新增了`access_logs`表的索引设计：`idx_access_time`和`idx_user_course`
- 添加了`courses`表的索引：`idx_user_id`和`idx_course_name`

#### 3. 新增临时令牌表
- 添加了`users`表索引：`idx_email`和`idx_username`
- 新增了`sessions`表索引：`idx_session_token`和`idx_user_id`
- 新增了`courses`表索引：`idx_user_id`和`idx_course_name`
- 新增了`access_logs`表索引：`idx_access_time`和`idx_user_course`

#### 4. 文档更新
- **DATABASE_DESIGN.md**：
  - 更新了`courses`表结构，移除加密字段，添加明文凭证字段
  - 新增了`access_logs`表的索引设计
  - 更新了课程创建流程，移除加密步骤
  - 简化了安全设计部分，移除课程凭证加密说明
  - 新增了`access_logs`表的索引设计
  - 新增了`access_logs`表的索引设计
- **DETAILED_DESIGN.md**：
  - 移除了加密相关的核心功能描述
  - 更新了系统架构图，移除AES-256-GCM加密
  - 从技术栈中移除了AES-256-GCM加密
  - 更新了后端模块划分，移除加密服务
  - 修改了课程创建流程，移除加密步骤
  - 简化了安全设计部分
  - 更新了风险评估，移除加密相关缓解措施
  - 从术语表中移除了AES和GCM相关术语

### 5. 代码更新
- `course.controller.ts`：移除了加密服务的使用，直接存储和读取明文凭证
- `proxy.controller.ts`：直接使用明文凭证进行课程跳转
- 移除了未使用的`encryption.service.ts`服务

### 安全说明
- 用户密码仍使用bcrypt算法加密存储
- 课程凭证现在以明文形式存储在数据库中
- 建议在生产环境中启用HTTPS传输加密
- 建议定期备份数据库并采取适当的访问控制措施

## [1.0.0] - 2025-12-12

### 初始版本
- 课程管理系统基础功能实现
- 支持用户注册、登录和认证
- 支持课程的创建、编辑、删除和查看
- 支持课程自动跳转功能
- 实现了AES-256-GCM加密存储课程凭证
- 包含完整的数据库设计和详细设计文档
