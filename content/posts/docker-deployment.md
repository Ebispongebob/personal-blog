---
title: Docker 容器化部署指南
date: 2025-06-05
tags: [Docker, DevOps, 部署]
excerpt: Docker 让应用部署变得简单一致。本文介绍如何将 Node.js 应用容器化，并实现高效的 CI/CD 流水线。
---

## 什么是 Docker

Docker 是一个开源的容器化平台，允许开发者将应用及其依赖打包到一个轻量级、可移植的容器中。

## Dockerfile 编写

```dockerfile
# 多阶段构建优化
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产环境
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass

volumes:
  postgres_data:
```

## 常用命令

```bash
# 构建镜像
docker build -t myapp:latest .

# 运行容器
docker run -d -p 3000:3000 --name myapp myapp:latest

# 查看日志
docker logs -f myapp

# 停止容器
docker stop myapp

# 清理资源
docker system prune -a
```

## 最佳实践

1. 使用多阶段构建减少镜像体积
2. 使用 Alpine 或 Distroless 基础镜像
3. 以非 root 用户运行应用
4. 使用 .dockerignore 排除不需要的文件
5. 为镜像打语义化标签

## 总结

Docker 容器化是现代应用部署的标准实践。掌握 Docker 能够显著提升开发和运维效率，实现"一次构建，到处运行"的目标。
