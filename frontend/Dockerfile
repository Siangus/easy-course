FROM node:20-alpine

# 安装构建依赖
RUN apk add --no-cache bash git

WORKDIR /app

# 拷贝 package.json 和 lock 文件
COPY package*.json ./
RUN npm install

# 拷贝其余文件
COPY . .

# 暴露 Vite 默认端口
EXPOSE 3000

# 启动开发模式
CMD ["npm", "run", "dev"]
