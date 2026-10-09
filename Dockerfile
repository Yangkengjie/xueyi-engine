# 学医智用增强引擎云部署镜像（SnapDeploy / Hugging Face Spaces / Render 通用）
FROM node:22-slim

WORKDIR /app

# 先拷贝依赖清单，充分利用 Docker 层缓存
COPY package*.json ./
RUN npm ci

# 拷贝源码并构建 esbuild 产物，随后移除开发依赖以精简镜像
COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
# 云平台通过 PORT 环境变量指定端口（SnapDeploy/Render 自动注入；Hugging Face 为 7860）
ENV PORT=7860
EXPOSE 7860

CMD ["node", "dist/server.cjs"]
