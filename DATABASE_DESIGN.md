# 数据库设计文档

## 1. 数据库概述

课程跳转系统使用MySQL 8.0作为数据库，采用InnoDB存储引擎，字符集为utf8mb4，排序规则为utf8mb4_unicode_ci。

## 2. 数据库结构

### 2.1 数据库实体关系图

```
+----------------+       +----------------+       +----------------+       +----------------+
|     users      |       |    sessions    |       |    courses     |       |  access_logs   |
+----------------+       +----------------+       +----------------+       +----------------+
| id (PK)        |<------| user_id (FK)   |       | id (PK)        |<------| course_id (FK) |
| uuid           |       | session_token  |       | uuid           |       | user_id (FK)   |
| email          |       | expires_at     |       | user_id (FK)   |------>| access_type    |
| username       |       | user_agent     |       | course_name    |       | access_time    |
| password_hash  |       | ip_address     |       | course_url     |       | duration_seconds |
| salt           |       | created_at     |       | description    |       | success        |
| created_at     |       |                |       | login_url      |       | error_message  |
| updated_at     |       |                |       | encrypted_credentials | |                |
+----------------+       +----------------+       | iv             |       +----------------+
                                                | auth_tag       |
                                                | last_accessed  |
                                                | access_count   |
                                                | is_active      |
                                                | created_at     |
                                                | updated_at     |
                                                +----------------+
```

### 2.2 表结构详解

#### 2.2.1 users表

**描述**：存储系统用户信息

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| uuid | VARCHAR(36) | UNIQUE, NOT NULL, DEFAULT (UUID()) | 用户唯一标识 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址 |
| username | VARCHAR(100) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希值 |
| salt | VARCHAR(255) | NOT NULL | 密码盐值 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- idx_email (email)
- idx_username (username)

#### 2.2.2 sessions表

**描述**：存储用户会话信息

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 会话ID |
| user_id | INT | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE | 用户ID |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | 会话令牌 |
| expires_at | TIMESTAMP | NOT NULL | 过期时间 |
| user_agent | TEXT | | 用户代理 |
| ip_address | VARCHAR(45) | | IP地址 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- idx_session_token (session_token)
- idx_user_id (user_id)

#### 2.2.3 courses表

**描述**：存储课程信息和加密的登录凭证

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 课程ID |
| uuid | VARCHAR(36) | UNIQUE, NOT NULL, DEFAULT (UUID()) | 课程唯一标识 |
| user_id | INT | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE | 所属用户ID |
| course_name | VARCHAR(255) | NOT NULL | 课程名称 |
| course_url | VARCHAR(500) | NOT NULL | 课程URL |
| description | TEXT | | 课程描述 |
| login_url | VARCHAR(500) | | 登录页面URL（可选，默认与课程URL相同） |
| encrypted_credentials | TEXT | NOT NULL | 加密的登录凭证（JSON格式） |
| iv | VARCHAR(255) | NOT NULL | 加密初始向量 |
| auth_tag | VARCHAR(255) | | GCM认证标签 |
| last_accessed | TIMESTAMP | NULL | 最后访问时间 |
| access_count | INT | DEFAULT 0 | 访问次数 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- idx_user_id (user_id)
- idx_course_name (course_name)

#### 2.2.4 access_logs表

**描述**：记录课程访问日志

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| user_id | INT | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE | 用户ID |
| course_id | INT | NOT NULL, FOREIGN KEY REFERENCES courses(id) ON DELETE CASCADE | 课程ID |
| access_type | ENUM('direct', 'proxy', 'video') | NOT NULL | 访问类型 |
| access_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 访问时间 |
| duration_seconds | INT | | 访问时长（秒） |
| success | BOOLEAN | DEFAULT TRUE | 是否成功 |
| error_message | TEXT | | 错误信息 |

**索引**：
- idx_access_time (access_time)
- idx_user_course (user_id, course_id)

## 3. 数据流程

### 3.1 用户注册流程

1. 用户填写注册信息
2. 后端生成随机盐值
3. 使用盐值加密密码
4. 生成UUID
5. 插入users表

### 3.2 课程创建流程

1. 用户填写课程信息
2. 后端生成随机UUID
3. 加密用户名和密码
4. 插入courses表

### 3.3 课程访问流程

1. 用户点击课程卡片
2. 后端更新courses表的last_accessed和access_count
3. 插入access_logs表
4. 生成访问令牌
5. 跳转到代理页面
6. 代理页面尝试自动登录

## 4. 安全设计

### 4.1 数据加密

- **密码加密**：使用bcrypt算法，加盐存储
- **课程凭证加密**：使用AES-256-GCM算法
  - 加密数据：用户名和密码的JSON字符串
  - 加密参数：32字节密钥，12字节IV，16字节认证标签

### 4.2 访问控制

- 每个用户只能访问自己的课程
- JWT认证保护API
- 会话令牌有效期7天
- 敏感操作需要重新验证

### 4.3 日志记录

- 记录课程访问日志
- 记录登录失败尝试
- 敏感操作审计

## 5. 性能优化

- 合理的索引设计
- 避免全表扫描
- 连接查询优化
- 定期清理过期会话
- 分页查询

## 6. 备份与恢复

- 定期备份数据库
- 使用二进制日志进行增量备份
- 制定灾难恢复计划

## 7. 数据库维护

### 7.1 定期任务

- 清理过期会话（超过7天）
- 清理超过3个月的访问日志
- 优化表结构
- 更新统计信息

### 7.2 监控

- 监控数据库连接数
- 监控慢查询
- 监控磁盘空间
- 监控CPU和内存使用

## 8. 扩展考虑

- 支持多租户
- 读写分离
- 分库分表
- 缓存热点数据
- 支持NoSQL存储
