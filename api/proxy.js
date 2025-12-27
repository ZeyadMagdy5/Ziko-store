import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const target = 'https://bags-shop.runasp.net';

  // URL Handling
  // If rewritten from /api/..., req.url might be /api/... or /api/proxy...
  // We want to extract the path effectively.
  // If we rewrite /api/(.*) -> /api/proxy, req.url is usually the original URL /api/user/orders

  let incomingUrl = req.url;
  // Ensure it starts with /api
  // If not, maybe we append it? No, client sends /api/...

  const backendUrl = target + incomingUrl;

  try {
    // 1. Buffer Body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // 2. Prepare Headers
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      headers[key] = value;
    }
    // Override Host
    headers['host'] = 'bags-shop.runasp.net';
    // Add forwarded headers
    headers['x-forwarded-host'] = req.headers.host;

    // Remove headers that might confuse backend or fetch
    delete headers['content-length']; // fetch calculates it
    // delete headers['connection'];

    // 3. Fetch
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? bodyBuffer : undefined,
      redirect: 'manual',
    });

    // 4. Send Response
    res.status(response.status);

    response.headers.forEach((val, key) => {
      // Fix Cookie
      if (key.toLowerCase() === 'set-cookie') {
        const newValue = val.replace(/Domain=[^;]+;?/gi, '');
        res.setHeader(key, newValue);
      } else if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'content-length') {
        res.setHeader(key, val);
      }
    });

    const responseBuffer = await response.arrayBuffer();
    res.send(Buffer.from(responseBuffer));

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({
      error: "Proxy Internal Error",
      details: error.message,
      url: backendUrl // Debug info
    });
  }
}
