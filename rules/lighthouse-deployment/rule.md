# 部署到腾讯云轻量服务器 + 域名配置

## 适用场景
- 部署前端 React/Vite 项目到腾讯云 Lighthouse
- 部署后端 Node.js API (Docker 容器)
- 配置域名 HTTPS 访问

## 前置条件
1. 腾讯云 Lighthouse 轻量应用服务器（已安装 Docker）
2. 域名已完成 ICP 备案
3. 域名 DNS 已解析到服务器 IP

## 部署流程

### 1. 查询服务器信息

```bash
# 使用 Lighthouse MCP 工具查询可用服务器
analyze_lighthouse_instances
describe_running_instances (Region: ap-shanghai)
```

### 2. 构建前端项目

```bash
cd web
npm run build
# 输出: web/dist/
```

### 3. 上传前端文件到服务器

```bash
# 使用 deploy_project_preparation
deploy_project_preparation(
  FolderPath: "web/dist",
  InstanceId: "服务器实例ID",
  Region: "ap-shanghai",
  ProjectName: "项目名称"
)
```

### 4. 部署后端 (Docker)

```bash
# 1. 上传后端代码
deploy_project_preparation(
  FolderPath: "api",
  InstanceId: "服务器实例ID",
  Region: "ap-shanghai",
  ProjectName: "ai-turtle-soup-api"
)

# 2. 在服务器上构建并启动 Docker 容器
execute_command(
  Command: "cd /root/api_xxxxxx && docker build -t 镜像名 ."
)

# 3. 启动容器
execute_command(
  Command: "docker run -d --name 容器名 -p 3000:3000 --restart always -e DEEPSEEK_API_KEY='你的密钥' 镜像名"
)
```

### 5. 配置 Nginx

```bash
# 创建 Nginx 配置
cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name 你的域名;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 重启 Nginx
nginx -t && systemctl restart nginx
```

### 6. 配置 HTTPS (Let's Encrypt 免费证书)

```bash
# 安装 certbot (如未安装)
yum install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d www.你的域名.com -d 你的域名.com --non-interactive --agree-tos --email 你的邮箱 --redirect
```

### 7. 验证部署

```bash
# 测试 HTTPS
curl -s -o /dev/null -w "状态: %{http_code}\n" https://www.你的域名.com/

# 测试 API
curl -s https://www.你的域名.com/api/test
```

## 常用命令

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重启
systemctl restart nginx

# 查看状态
systemctl status nginx

# 重新加载配置
nginx -s reload
```

### Docker 管理
```bash
# 查看容器日志
docker logs -f 容器名

# 重启容器
docker restart 容器名

# 停止容器
docker stop 容器名

# 重新部署
docker rm -f 容器名 && docker run -d --name 容器名 -p 端口:端口 --restart always 镜像名
```

### SSL 证书自动续期
```bash
# Let's Encrypt 证书有效期 90 天，自动续期已配置
# 可手动测试续期
certbot renew --dry-run
```

## 故障排查

| 问题 | 解决方案 |
|-----|---------|
| `bind() to 0.0.0.0:80 failed` | `fuser -k 80/tcp` 释放端口 |
| 502 Bad Gateway | 检查后端容器是否运行 `docker ps` |
| SSL 证书申请失败 | 确认 DNS 已解析 `nslookup 你的域名` |
| API 返回 404 | 检查 Nginx proxy_pass 路径是否正确 |

## 快速部署脚本

```bash
#!/bin/bash
# 部署前端到 Nginx
rm -rf /usr/share/nginx/html/*
cp -r /root/项目目录/* /usr/share/nginx/html/

# 重启服务
systemctl restart nginx
docker restart 容器名
```
