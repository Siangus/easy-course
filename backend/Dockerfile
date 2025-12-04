# 使用 Node.js 官方 Alpine 镜像
FROM node:20-alpine

# 安装 bcrypt 编译依赖
RUN apk add --no-cache python3 g++ make

WORKDIR /app

# 先拷贝 package.json 安装依赖
COPY package*.json ./
RUN npm install

# 拷贝项目文件
COPY . .

# 启动开发模式
CMD ["npm", "run", "dev"]
