// Cloudflare Worker 代理脚本
// 部署到 Cloudflare Workers 后，将 URL 替换到 Portfolio.tsx 中

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 只允许 GET 请求
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  // 从查询参数获取目标 URL
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // 只允许腾讯财经 API
  if (!targetUrl.startsWith('https://qt.gtimg.cn/')) {
    return new Response('Unauthorized domain', { status: 403 })
  }

  try {
    // 代理请求
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://qt.gtimg.cn/'
      }
    })

    // 复制响应并添加 CORS 头
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET')
    newResponse.headers.set('Cache-Control', 'public, max-age=60')

    return newResponse
  } catch (error) {
    return new Response('Proxy error: ' + error.message, { status: 500 })
  }
}

// 使用方法：
// 1. 访问 https://workers.cloudflare.com/
// 2. 创建新的 Worker
// 3. 粘贴此代码
// 4. 部署后获得 URL，例如：https://your-worker.your-subdomain.workers.dev
// 5. 在 Portfolio.tsx 中使用：
//    `https://your-worker.your-subdomain.workers.dev?url=${encodeURIComponent(targetUrl)}`

