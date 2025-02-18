const HOST_PARAM = "_proxy_host_"; // 使用不易冲突的查询参数名

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  const targetHost = queryParams.get(HOST_PARAM);

  // 检查目标主机参数是否存在
  if (!targetHost) {
    return new Response(`Missing required query parameter: ${HOST_PARAM}`, {
      status: 400,
    });
  }

  // 移除用于代理的查询参数
  queryParams.delete(HOST_PARAM);
  url.search = queryParams.toString();

  // 构建新请求URL（强制使用HTTPS协议）
  url.protocol = "https:";
  url.host = targetHost;

  // 复制并修改请求头
  const headers = new Headers(request.headers);
  headers.set("Host", targetHost); // 确保Host头与目标匹配

  // 构建新请求
  const newRequest = new Request(url.toString(), {
    headers: headers,
    method: request.method,
    body: request.body,
    redirect: "follow",
  });

  try {
    return await fetch(newRequest);
  } catch (e) {
    console.error("Proxy error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
});
