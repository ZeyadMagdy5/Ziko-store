import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const target = 'https://bags-shop.runasp.net';
  
  // In Vercel file-system routing with [...path].js:
  // PROD (Vercel): req.url is the full path e.g., /api/user/orders?page=1
  // LOCAL (Vite/Next): might differ, but we are fixing for PROD.
  
  // Ensure we don't have double /api/api if something is weird
  // But usually req.url is exactly what we need.
  
  const backendUrl = target + req.url;

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
    
    // Remove headers that might confuse backend
    delete headers['content-length']; 
    
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
    // Return JSON error so frontend doesn't get < !DOCTYPE
    res.status(500).json({ 
        error: "Proxy Internal Error", 
        message: error.message,
    });
  }
}
