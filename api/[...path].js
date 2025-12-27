import { createProxyMiddleware } from 'http-proxy-middleware';

// Vercel Serverless Function Proxy
export const config = {
  api: {
    bodyParser: false, // Important: Disable body parsing so we can stream it
    externalResolver: true,
  },
};

// Since we cannot install http-proxy-middleware easily, we will use a native Node.js approach 
// that is known to work well on Vercel.

export default async function handler(req, res) {
  const target = 'https://bags-shop.runasp.net';

  // Clean URL: /api/user/orders?Page=1 -> /api/user/orders?Page=1
  // We want to pass it exactly as is to the backend (relative to target)
  const url = req.url;

  const backendUrl = target + url;

  // Headers to forward
  const headers = { ...req.headers };
  // Overwrite Host to match backend requirement
  headers['host'] = 'bags-shop.runasp.net';
  headers['x-forwarded-host'] = req.headers.host; // original host (vercel.app)

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined, // Pipe the req stream directly? 
      // Fetch in Node (undici) accepts a stream as body.
      // However, Vercel default 'req' is IncomingMessage.
      // We might need to buffer if stream fails. 
      redirect: 'manual'
    });

    // Copy status
    res.status(backendRes.status);

    // Copy headers
    backendRes.headers.forEach((val, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        // Strip Domain
        const newValue = val.replace(/Domain=[^;]+;?/gi, '');
        res.setHeader(key, newValue);
      } else if (key.toLowerCase() !== 'content-encoding') { // Let Vercel handle compression
        res.setHeader(key, val);
      }
    });

    // Pipe response
    const arrayBuffer = await backendRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: "Proxy Error: " + err.message });
  }
}
