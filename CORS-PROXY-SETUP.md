# CORS 代理设置指南

## 问题说明
GitHub Pages 上的前端应用无法直接访问腾讯财经 API（`qt.gtimg.cn`），因为存在 CORS（跨域资源共享）限制。

## 当前方案
代码中使用了多个公共 CORS 代理服务，按优先级尝试：

1. **AllOrigins** (`api.allorigins.win`) - 最稳定，推荐
2. **ThingProxy** (`thingproxy.freeboard.io`) - 备用
3. **CORS.SH** (`cors.sh`) - 新服务
4. **CorsProxy.io** (`corsproxy.io`) - 可能被限制

### 公共代理的问题
- ❌ 可能被限流或封禁
- ❌ 不稳定，随时可能下线
- ❌ 速度较慢
- ❌ 隐私风险

## 推荐方案：自建 Cloudflare Worker 代理

### 优势
- ✅ **完全免费**（每天 10 万次请求）
- ✅ **全球 CDN**，速度快
- ✅ **稳定可靠**
- ✅ **完全控制**

### 部署步骤

#### 1. 注册 Cloudflare 账号
访问 https://dash.cloudflare.com/sign-up

#### 2. 创建 Worker
1. 登录后，点击左侧 **Workers & Pages**
2. 点击 **Create Application**
3. 选择 **Create Worker**
4. 给 Worker 命名，例如：`stock-proxy`
5. 点击 **Deploy**

#### 3. 编辑 Worker 代码
1. 部署后，点击 **Edit Code**
2. 删除默认代码
3. 复制 `cloudflare-worker-proxy.js` 的内容并粘贴
4. 点击 **Save and Deploy**

#### 4. 获取 Worker URL
部署成功后，你会得到一个 URL，例如：
```
https://stock-proxy.your-username.workers.dev
```

#### 5. 更新代码
在 `pages/Portfolio.tsx` 中，将代理列表的第一项改为你的 Worker URL：

```typescript
const proxies = [
  // 你的 Cloudflare Worker（最优先）
  `https://stock-proxy.your-username.workers.dev?url=${encodeURIComponent(targetUrl)}`,
  // 其他备用代理...
  `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
];
```

#### 6. 提交并部署
```bash
git add pages/Portfolio.tsx
git commit -m "使用自建 Cloudflare Worker 代理"
git push
```

## 其他方案

### 方案 2：GitHub Actions 定时更新
如果不想依赖代理，可以用 GitHub Actions 每小时抓取一次数据，保存为静态 JSON：

**优点**：
- 不依赖第三方代理
- 数据缓存在仓库中

**缺点**：
- 不是实时数据
- 需要额外的 Actions 配置

### 方案 3：使用 Vercel/Netlify Edge Functions
如果你愿意迁移到 Vercel 或 Netlify，可以使用它们的 Edge Functions 作为代理。

## 当前状态
✅ 代码已配置多个公共代理备份  
⚠️ 建议部署自己的 Cloudflare Worker 以获得最佳体验

## 测试
部署后，访问持仓页面，打开浏览器控制台，查看日志：
```
✓ 使用代理: api.allorigins.win
```

如果看到成功日志，说明代理工作正常。

